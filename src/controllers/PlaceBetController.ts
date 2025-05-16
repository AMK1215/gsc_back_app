import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { GameErrorCode, GameErrorDescription } from '../exceptions/gameErrorCode';
import { RequestTransaction } from '../dtos/RequestTransaction';
import { validate } from 'class-validator';

const prisma = new PrismaClient();
const redis = new Redis(); // configure as needed

function md5(str: string) {
  return require('crypto').createHash('md5').update(str).digest('hex');
}

async function acquireLock(key: string, ttl = 15, maxAttempts = 3): Promise<boolean> {
  let attempts = 0;
  while (attempts < maxAttempts) {
    const result = await redis.set(key, 'locked', 'EX', ttl, 'NX');
    if (result === 'OK') return true;
    await new Promise(res => setTimeout(res, 1000));
    attempts++;
  }
  return false;
}

async function releaseLock(key: string) {
  await redis.del(key);
}

export enum WagerStatus {
  Win = 'Win',
  Lose = 'Lose',
}

export const placeBet = async (req: Request, res: Response) => {
  console.log('--- PlaceBet Request Body ---');
  console.log(JSON.stringify(req.body, null, 2));
  const {
    MemberName,
    OperatorCode,
    ProductID,
    MessageID,
    RequestTime,
    Sign,
    Transactions,
  } = req.body;

  // 1. Validate required fields
  if (!MemberName || !OperatorCode || !ProductID || !MessageID || !RequestTime || !Sign || !Transactions) {
    console.log('Missing required fields');
    return res.json({
      ErrorCode: GameErrorCode.ApiError,
      ErrorMessage: GameErrorDescription[GameErrorCode.ApiError],
      Balance: "0.0000",
      BeforeBalance: "0.0000",
    });
  }

  // 2. Validate signature
  const method = 'placebet';
  const expectedSign = md5(OperatorCode + RequestTime + method + process.env.GAME_SECRET_KEY);
  console.log('ExpectedSign:', expectedSign);
  console.log('Provided Sign:', Sign);
  if (Sign !== expectedSign) {
    console.log('Invalid signature');
    return res.json({
      ErrorCode: GameErrorCode.InvalidSign,
      ErrorMessage: GameErrorDescription[GameErrorCode.InvalidSign],
      Balance: "0.0000",
      BeforeBalance: "0.0000",
    });
  }

  // 3. Fetch user
  const user = await prisma.user.findFirst({ where: { user_name: MemberName } });
  if (!user) {
    console.log('User not found:', MemberName);
    return res.json({
      ErrorCode: GameErrorCode.MemberNotExists,
      ErrorMessage: GameErrorDescription[GameErrorCode.MemberNotExists],
      Balance: "0.0000",
      BeforeBalance: "0.0000",
    });
  }

  // 4. Extract wager IDs
  const wagerIds = (Transactions as any[]).map(t => t.WagerID).filter(Boolean);
  if (!wagerIds.length) {
    return res.status(400).json({ message: 'WagerID is required for all transactions.' });
  }

  // 5. Acquire Redis locks
  const userLockKey = `wallet:lock:${user.id}`;
  const wagerLockKeys = wagerIds.map(wid => `wager:lock:${wid}`);
  let acquiredUserLock = false;
  const acquiredWagerLocks: string[] = [];
  try {
    acquiredUserLock = await acquireLock(userLockKey);
    if (!acquiredUserLock) {
      return res.status(409).json({
        message: 'Another transaction is currently processing for this user. Please try again later.',
        userId: user.id,
      });
    }
    for (const key of wagerLockKeys) {
      const gotLock = await acquireLock(key);
      if (!gotLock) {
        // Release all locks and fail
        await releaseLock(userLockKey);
        for (const lockedKey of acquiredWagerLocks) await releaseLock(lockedKey);
        return res.status(409).json({
          message: `Another transaction is currently processing for wager_id ${key.split(':').pop()}. Please try again later.`,
          wager_id: key.split(':').pop(),
        });
      }
      acquiredWagerLocks.push(key);
    }

    // 6. Validate transactions
    for (const t of Transactions) {
      const tx = Object.assign(new RequestTransaction(), t);
      const errors = await validate(tx);
      if (errors.length > 0) {
        return res.json({
          ErrorCode: GameErrorCode.ApiError,
          ErrorMessage: 'Invalid transaction fields',
          Balance: Number(user.balance).toFixed(4),
          BeforeBalance: Number(user.balance).toFixed(4),
        });
      }
    }

    // 7. Check for duplicate TransactionID
    const transactionIds = Transactions.map((t: any) => t.TransactionID);
    const existing = await prisma.seamlessTransaction.findFirst({
      where: { transaction_id: { in: transactionIds } }
    });
    if (existing) {
      return res.json({
        ErrorCode: GameErrorCode.DuplicateTransaction,
        ErrorMessage: GameErrorDescription[GameErrorCode.DuplicateTransaction],
        Balance: Number(user.balance).toFixed(4),
        BeforeBalance: Number(user.balance).toFixed(4),
      });
    }

    // 8. Calculate balances
    const totalTransactionAmount = Transactions.reduce((sum: number, t: any) => sum + (t.TransactionAmount || 0), 0);
    const beforeBalance = Number(user.balance);
    const afterBalance = beforeBalance + totalTransactionAmount;
    if (afterBalance < 0) {
      return res.json({
        ErrorCode: GameErrorCode.MemberInsufficientBalance,
        ErrorMessage: GameErrorDescription[GameErrorCode.MemberInsufficientBalance],
        Balance: beforeBalance.toFixed(4),
        BeforeBalance: beforeBalance.toFixed(4),
      });
    }

    // 8.1 Create seamless event
    const event = await prisma.seamlessEvent.create({
      data: {
        user_id: user.id,
        message_id: MessageID,
        provider_id: String(ProductID),
        request_time: new Date(), // Optionally parse from RequestTime
        raw_data: req.body,
        created_at: new Date(),
        updated_at: new Date(),
      }
    });

    // 9. DB Transaction
    try {
      await prisma.$transaction(async (tx) => {
        for (const t of Transactions) {
          await tx.seamlessTransaction.create({
            data: {
              user_id: user.id,
              wager_id: t.WagerID,
              game_type_id: t.GameType,
              provider_id: typeof t.ProductID === 'string' ? parseInt(t.ProductID) : t.ProductID,
              valid_bet_amount: t.ValidBetAmount,
              bet_amount: t.BetAmount,
              transaction_amount: t.TransactionAmount,
              transaction_id: t.TransactionID,
              payout_amount: t.PayoutAmount,
              status: String(t.Status),
              member_name: t.MemberName,
              created_at: new Date(),
              updated_at: new Date(),
              seamless_event_id: event.id, // Use created event's ID
              rate: null,
              wager_status: t.TransactionAmount > 0 ? WagerStatus.Win : WagerStatus.Lose,
            }
          });
        }
        await tx.user.update({
          where: { id: user.id },
          data: { balance: afterBalance }
        });
      });

      // 10. Success response
      return res.json({
        ErrorCode: GameErrorCode.Success,
        ErrorMessage: GameErrorDescription[GameErrorCode.Success],
        Balance: afterBalance.toFixed(4),
        BeforeBalance: beforeBalance.toFixed(4),
      });
    } catch (e) {
      console.log('Error during DB transaction:', e);
      return res.json({
        ErrorCode: GameErrorCode.InternalServerError,
        ErrorMessage: GameErrorDescription[GameErrorCode.InternalServerError],
        Balance: beforeBalance.toFixed(4),
        BeforeBalance: beforeBalance.toFixed(4),
      });
    }
  } finally {
    // Always release all locks
    if (acquiredUserLock) await releaseLock(userLockKey);
    for (const key of acquiredWagerLocks) await releaseLock(key);
  }
};