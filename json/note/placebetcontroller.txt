import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { GameErrorCode, GameErrorDescription } from '../exceptions/gameErrorCode';
import { RequestTransaction } from '../dtos/RequestTransaction';
import { validate } from 'class-validator';

const prisma = new PrismaClient();

function md5(str: string) {
  return crypto.createHash('md5').update(str).digest('hex');
}

export const placeBet = async (req: Request, res: Response) => {
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
    return res.json({
      ErrorCode: GameErrorCode.ApiError,
      ErrorMessage: GameErrorDescription[GameErrorCode.ApiError],
      Balance: 0,
      BeforeBalance: 0,
    });
  }

  // 2. Validate signature
  const method = 'placebet';
  const expectedSign = md5(OperatorCode + RequestTime + method + process.env.GAME_SECRET_KEY);
  if (Sign !== expectedSign) {
    return res.json({
      ErrorCode: GameErrorCode.InvalidSign,
      ErrorMessage: GameErrorDescription[GameErrorCode.InvalidSign],
      Balance: 0,
      BeforeBalance: 0,
    });
  }

  // 3. Fetch user
  const user = await prisma.user.findFirst({ where: { user_name: MemberName } });
  if (!user) {
    return res.json({
      ErrorCode: GameErrorCode.MemberNotExists,
      ErrorMessage: GameErrorDescription[GameErrorCode.MemberNotExists],
      Balance: 0,
      BeforeBalance: 0,
    });
  }

  // 4. Validate transactions using DTO and class-validator
  if (!Array.isArray(Transactions) || Transactions.length === 0) {
    return res.json({
      ErrorCode: GameErrorCode.ApiError,
      ErrorMessage: 'Invalid transaction data format.',
      Balance: user.balance,
      BeforeBalance: user.balance,
    });
  }

  for (const t of Transactions) {
    const tx = Object.assign(new RequestTransaction(), t);
    const errors = await validate(tx);
    if (errors.length > 0) {
      return res.json({
        ErrorCode: GameErrorCode.ApiError,
        ErrorMessage: 'Invalid transaction fields',
        Balance: user.balance,
        BeforeBalance: user.balance,
      });
    }
  }

  // 5. Check for duplicate TransactionID
  const transactionIds = Transactions.map((t: any) => t.TransactionID);
  const existing = await prisma.seamlessTransaction.findFirst({
    where: { transaction_id: { in: transactionIds } }
  });
  if (existing) {
    return res.json({
      ErrorCode: GameErrorCode.DuplicateTransaction,
      ErrorMessage: GameErrorDescription[GameErrorCode.DuplicateTransaction],
      Balance: user.balance,
      BeforeBalance: user.balance,
    });
  }

  // 6. Calculate total TransactionAmount
  const totalTransactionAmount = Transactions.reduce((sum: number, t: any) => sum + (t.TransactionAmount || 0), 0);
  const beforeBalance = Number(user.balance);
  const afterBalance = beforeBalance + totalTransactionAmount;

  if (afterBalance < 0) {
    return res.json({
      ErrorCode: GameErrorCode.MemberInsufficientBalance,
      ErrorMessage: GameErrorDescription[GameErrorCode.MemberInsufficientBalance],
      Balance: beforeBalance,
      BeforeBalance: beforeBalance,
    });
  }

  // 7. Insert transactions and update balance in a transaction
  try {
    await prisma.$transaction(async (tx) => {
      for (const t of Transactions) {
        await tx.seamlessTransaction.create({
          data: {
            user_id: user.id,
            wager_id: BigInt(t.WagerID),
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
            seamless_event_id: 1, // Set this appropriately if you have event logic
            rate: null, // Set this if you have rate logic
            wager_status: 'Ongoing', // Or set based on your business logic
          }
        });
      }
      await tx.user.update({
        where: { id: user.id },
        data: { balance: afterBalance }
      });
    });

    return res.json({
      ErrorCode: GameErrorCode.Success,
      ErrorMessage: GameErrorDescription[GameErrorCode.Success],
      Balance: afterBalance.toFixed(4),
      BeforeBalance: beforeBalance.toFixed(4),
    });
  } catch (e) {
    return res.json({
      ErrorCode: GameErrorCode.InternalServerError,
      ErrorMessage: GameErrorDescription[GameErrorCode.InternalServerError],
      Balance: beforeBalance,
      BeforeBalance: beforeBalance,
    });
  }
};