import { prismaClient } from '../index';
import { ForbiddenException, BadRequestsException, ErrorCode } from '../exceptions/root';
import { PrismaClient, Prisma } from '@prisma/client';

type UserRole = 'Owner' | 'Agent' | 'Sub_Agent' | 'Player';
type RoleHierarchy = Record<UserRole, UserRole[]>;

export class WalletService {
  // Deposit from higher role to lower role
  async deposit(fromUserId: number, toUserId: number, amount: number) {
    const [fromUser, toUser] = await Promise.all([
      prismaClient.user.findUnique({ where: { id: fromUserId } }),
      prismaClient.user.findUnique({ where: { id: toUserId } })
    ]);

    if (!fromUser || !toUser) {
      throw new BadRequestsException('User not found', ErrorCode.USER_NOT_FOUND);
    }

    // Validate role hierarchy
    if (!this.isValidDepositHierarchy(fromUser.role as UserRole, toUser.role as UserRole)) {
      throw new ForbiddenException('Invalid deposit hierarchy', ErrorCode.FORBIDDEN);
    }

    // Validate amount
    if (amount <= 0) {
      throw new BadRequestsException('Invalid amount', ErrorCode.INVALID_INPUT);
    }

    // Check if sender has enough balance
    if (fromUser.balance.toNumber() < amount) {
      throw new BadRequestsException('Insufficient balance', ErrorCode.INVALID_INPUT);
    }

    // Perform transaction
    return await prismaClient.$transaction(async (tx: Prisma.TransactionClient) => {
      // Deduct from sender
      await tx.user.update({
        where: { id: fromUserId },
        data: { balance: { decrement: amount } }
      });

      // Add to receiver
      await tx.user.update({
        where: { id: toUserId },
        data: { balance: { increment: amount } }
      });

      return { message: 'Deposit successful' };
    });
  }

  // Withdraw from lower role to higher role
  async withdraw(fromUserId: number, toUserId: number, amount: number) {
    const [fromUser, toUser] = await Promise.all([
      prismaClient.user.findUnique({ where: { id: fromUserId } }),
      prismaClient.user.findUnique({ where: { id: toUserId } })
    ]);

    if (!fromUser || !toUser) {
      throw new BadRequestsException('User not found', ErrorCode.USER_NOT_FOUND);
    }

    // Validate role hierarchy
    if (!this.isValidWithdrawHierarchy(fromUser.role as UserRole, toUser.role as UserRole)) {
      throw new ForbiddenException('Invalid withdraw hierarchy', ErrorCode.FORBIDDEN);
    }

    // Validate amount
    if (amount <= 0) {
      throw new BadRequestsException('Invalid amount', ErrorCode.INVALID_INPUT);
    }

    // Check if sender has enough balance
    if (fromUser.balance.toNumber() < amount) {
      throw new BadRequestsException('Insufficient balance', ErrorCode.INVALID_INPUT);
    }

    // Perform transaction
    return await prismaClient.$transaction(async (tx: Prisma.TransactionClient) => {
      // Deduct from sender
      await tx.user.update({
        where: { id: fromUserId },
        data: { balance: { decrement: amount } }
      });

      // Add to receiver
      await tx.user.update({
        where: { id: toUserId },
        data: { balance: { increment: amount } }
      });

      return { message: 'Withdraw successful' };
    });
  }

  private isValidDepositHierarchy(fromRole: UserRole, toRole: UserRole): boolean {
    const hierarchy: RoleHierarchy = {
      'Owner': ['Agent'],
      'Agent': ['Sub_Agent', 'Player'],
      'Sub_Agent': ['Player'],
      'Player': []
    };
    return hierarchy[fromRole]?.includes(toRole) || false;
  }

  private isValidWithdrawHierarchy(fromRole: UserRole, toRole: UserRole): boolean {
    const hierarchy: RoleHierarchy = {
      'Owner': [],
      'Agent': ['Owner'],
      'Sub_Agent': ['Agent'],
      'Player': ['Agent', 'Sub_Agent']
    };
    return hierarchy[fromRole]?.includes(toRole) || false;
  }
} 