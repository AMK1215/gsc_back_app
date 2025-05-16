import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { GetBalanceRequest, GetBalanceResponse } from '../types/seamless';
import { GAME_OPERATOR_CODE, GAME_SECRET_KEY } from '../config/game';
import { GameErrorCode, GameErrorDescription } from '../exceptions/gameErrorCode';
import { RequestTransaction } from '../dtos/RequestTransaction';
import { validate } from 'class-validator';


const prisma = new PrismaClient();

function md5(str: string) {
  return crypto.createHash('md5').update(str).digest('hex');
}

export const getBalance = async (req: Request, res: Response) => {
  const {
    MemberName,
    OperatorCode,
    ProductID,
    MessageID,
    RequestTime,
    Sign,
  } = req.body as GetBalanceRequest;

  // 1. Validate required fields
  if (!MemberName || !OperatorCode || !MessageID || !RequestTime || !Sign) {
    const response: GetBalanceResponse = {
      ErrorCode: GameErrorCode.MemberInsufficientBalance,
      ErrorMessage: GameErrorDescription[GameErrorCode.MemberInsufficientBalance],
      Balance: 0,
      BeforeBalance: 0,
    };
    res.json(response);
    return;
  }

  // 2. Validate signature using config values
  const method = 'getbalance'; // always lower case
  // Debug logs
  console.log('OperatorCode:', OperatorCode);
  console.log('RequestTime:', RequestTime);
  console.log('Method:', method);
  console.log('SecretKey:', GAME_SECRET_KEY);
  console.log('String to hash:', OperatorCode + RequestTime + method + GAME_SECRET_KEY);

  const expectedSign = md5(OperatorCode + RequestTime + method + GAME_SECRET_KEY);
  console.log('ExpectedSign:', expectedSign);
  console.log('Provided Sign:', Sign);
  if (Sign !== expectedSign) {
    const response: GetBalanceResponse = {
      ErrorCode: GameErrorCode.InvalidSign,
      ErrorMessage: GameErrorDescription[GameErrorCode.InvalidSign],
      Balance: 0,
      BeforeBalance: 0,
    };
    res.json(response);
    return;
  }

  // 3. Fetch user
  const user = await prisma.user.findFirst({
    where: { user_name: MemberName },
  });

  if (!user) {
    const response: GetBalanceResponse = {
      ErrorCode: GameErrorCode.MemberNotExists,
      ErrorMessage: GameErrorDescription[GameErrorCode.MemberNotExists],
      Balance: 0,
      BeforeBalance: 0,
    };
    res.json(response);
    return;
  }

  // 4. Return balance
  const balance = Number(user.balance).toFixed(4);
  const response: GetBalanceResponse = {
    ErrorCode: GameErrorCode.Success,
    ErrorMessage: GameErrorDescription[GameErrorCode.Success],
    Balance: balance,
    BeforeBalance: balance,
  };
  res.json(response);
};

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

// export const placeBet = async (req: Request, res: Response) => {
//   const {
//     MemberName,
//     OperatorCode,
//     ProductID,
//     MessageID,
//     RequestTime,
//     Sign,
//     Transactions,
//   } = req.body;

//   // 1. Validate required fields
//   if (!MemberName || !OperatorCode || !ProductID || !MessageID || !RequestTime || !Sign || !Transactions) {
//     return res.json({
//       ErrorCode: GameErrorCode.InvalidRequest,
//       ErrorMessage: GameErrorDescription[GameErrorCode.InvalidRequest],
//       Balance: 0,
//       BeforeBalance: 0,
//     });
//   }

//   // 2. Validate signature
//   const method = 'placebet';
//   const expectedSign = md5(OperatorCode + RequestTime + method + GAME_SECRET_KEY);
//   if (Sign !== expectedSign) {
//     return res.json({
//       ErrorCode: GameErrorCode.InvalidSign,
//       ErrorMessage: GameErrorDescription[GameErrorCode.InvalidSign],
//       Balance: 0,
//       BeforeBalance: 0,
//     });
//   }

//   // 3. Fetch user
//   const user = await prisma.user.findFirst({ where: { user_name: MemberName } });
//   if (!user) {
//     return res.json({
//       ErrorCode: GameErrorCode.MemberNotExists,
//       ErrorMessage: GameErrorDescription[GameErrorCode.MemberNotExists],
//       Balance: 0,
//       BeforeBalance: 0,
//     });
//   }

//   // 4. Validate transactions
//   if (!Array.isArray(Transactions) || Transactions.length === 0) {
//     return res.json({
//       ErrorCode: GameErrorCode.InvalidRequest,
//       ErrorMessage: 'Invalid transaction data format.',
//       Balance: user.balance,
//       BeforeBalance: user.balance,
//     });
//   }

//   // 5. Check for duplicate TransactionID
//   const transactionIds = Transactions.map((t: any) => t.TransactionID);
//   const existing = await prisma.seamlessTransaction.findFirst({
//     where: { transaction_id: { in: transactionIds } }
//   });
//   if (existing) {
//     return res.json({
//       ErrorCode: GameErrorCode.DuplicateTransaction,
//       ErrorMessage: GameErrorDescription[GameErrorCode.DuplicateTransaction],
//       Balance: user.balance,
//       BeforeBalance: user.balance,
//     });
//   }

//   // 6. Calculate total TransactionAmount
//   const totalTransactionAmount = Transactions.reduce((sum: number, t: any) => sum + (t.TransactionAmount || 0), 0);
//   const beforeBalance = Number(user.balance);
//   const afterBalance = beforeBalance + totalTransactionAmount;

//   if (afterBalance < 0) {
//     return res.json({
//       ErrorCode: GameErrorCode.MemberInsufficientBalance,
//       ErrorMessage: GameErrorDescription[GameErrorCode.MemberInsufficientBalance],
//       Balance: beforeBalance,
//       BeforeBalance: beforeBalance,
//     });
//   }

//   // 7. Insert transactions and update balance in a transaction
//   try {
//     await prisma.$transaction(async (tx) => {
//       for (const t of Transactions) {
//         await tx.seamlessTransaction.create({
//           data: {
//             user_id: user.id,
//             wager_id: t.WagerID,
//             game_type_id: t.GameType,
//             product_id: t.ProductID,
//             transaction_id: t.TransactionID,
//             transaction_amount: t.TransactionAmount,
//             payout_amount: t.PayoutAmount,
//             bet_amount: t.BetAmount,
//             valid_bet_amount: t.ValidBetAmount,
//             status: t.Status,
//             member_name: t.MemberName,
//             created_at: new Date(),
//             updated_at: new Date(),
//           }
//         });
//       }
//       await tx.user.update({
//         where: { id: user.id },
//         data: { balance: afterBalance }
//       });
//     });

//     return res.json({
//       ErrorCode: GameErrorCode.Success,
//       ErrorMessage: GameErrorDescription[GameErrorCode.Success],
//       Balance: afterBalance.toFixed(4),
//       BeforeBalance: beforeBalance.toFixed(4),
//     });
//   } catch (e) {
//     return res.json({
//       ErrorCode: GameErrorCode.InternalError,
//       ErrorMessage: 'Internal error',
//       Balance: beforeBalance,
//       BeforeBalance: beforeBalance,
//     });
//   }
// };

// export { getBalance, placeBet }; 