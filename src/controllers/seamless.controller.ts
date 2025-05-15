import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { GetBalanceRequest, GetBalanceResponse } from '../types/seamless';
import { GAME_OPERATOR_CODE, GAME_SECRET_KEY } from '../config/game';
import { GameErrorCode, GameErrorDescription } from '../exceptions/gameErrorCode';

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
  const expectedSign = md5(GAME_OPERATOR_CODE + RequestTime + method + GAME_SECRET_KEY);
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