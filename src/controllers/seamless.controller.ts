import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { GetBalanceRequest, GetBalanceResponse } from '../types/seamless';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.GAME_API_SECRET_KEY || 'your_default_secret';

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
      ErrorCode: 1001,
      ErrorMessage: 'Missing required fields',
      Balance: 0,
      BeforeBalance: 0,
    };
    res.json(response);
    return;
  }

  // 2. Validate signature
  const method = 'getbalance'; // or extract from URL if needed
  const expectedSign = md5(OperatorCode + RequestTime + method + SECRET_KEY);
  if (Sign !== expectedSign) {
    const response: GetBalanceResponse = {
      ErrorCode: 1002,
      ErrorMessage: 'Invalid signature',
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
      ErrorCode: 1003,
      ErrorMessage: 'Member not exists',
      Balance: 0,
      BeforeBalance: 0,
    };
    res.json(response);
    return;
  }

  // 4. Return balance
  const balance = Number(user.balance).toFixed(4);
  const response: GetBalanceResponse = {
    ErrorCode: 0,
    ErrorMessage: 'Success',
    Balance: balance,
    BeforeBalance: balance,
  };
  res.json(response);
}; 