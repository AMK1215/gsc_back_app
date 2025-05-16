import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class User {
  static async findByName(user_name: string) {
    return prisma.user.findFirst({ where: { user_name } });
  }
}