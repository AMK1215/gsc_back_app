import { Request, Response } from 'express';
import { prismaClient } from '../index';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../secrets';
import { UnauthorizedException, NotFoundException, ForbiddenException, BadRequestsException, ErrorCode } from '../exceptions/root';
import { WalletService } from '../services/wallet.service';

type Role = 'Owner' | 'Agent' | 'Sub_Agent' | 'Player';

export class UserController {
  // Admin login (Owner, Agent, Sub_Agent)
  async adminLogin(req: Request, res: Response) {
    const { user_name, password } = req.body;

    const user = await prismaClient.user.findFirst({
      where: {
        user_name,
        role: {
          in: ['Owner', 'Agent', 'Sub_Agent']
        }
      }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials', ErrorCode.INVALID_CREDENTIALS);
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials', ErrorCode.INVALID_CREDENTIALS);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        user_name: user.user_name,
        role: user.role,
        email: user.email,
        phone: user.phone,
        address: user.address,
        status: user.status,
        balance: user.balance,
        agent_id: user.agent_id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  }

  // Player login
  async playerLogin(req: Request, res: Response) {
    const { user_name, password } = req.body;

    const user = await prismaClient.user.findFirst({
      where: {
        user_name,
        role: 'Player'
      }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials', ErrorCode.INVALID_CREDENTIALS);
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials', ErrorCode.INVALID_CREDENTIALS);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        user_name: user.user_name,
        role: user.role
      }
    });
  }

  // Create new user (Owner can create Agent, Agent can create Sub_Agent and Player)
  async createUser(req: Request, res: Response) {
    const { name, user_name, email, phone, password, role, agent_id, deposit_amount } = req.body;
    const currentUser = req.user!;
    const walletService = new WalletService();

    // Validate role hierarchy
    if (currentUser.role === 'Owner' && role !== 'Agent') {
      throw new ForbiddenException('Owner can only create Agents', ErrorCode.FORBIDDEN);
    }

    if (currentUser.role === 'Agent' && !['Sub_Agent', 'Player'].includes(role)) {
      throw new ForbiddenException('Agent can only create Sub-Agents and Players', ErrorCode.FORBIDDEN);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user first (with zero balance if deposit is provided)
    const newUser = await prismaClient.user.create({
      data: {
        name,
        user_name,
        email,
        phone,
        password: hashedPassword,
        role,
        agent_id: currentUser.role === 'Agent' ? currentUser.id : agent_id,
        balance: deposit_amount ? 0 : undefined // set to 0 if deposit, else default
      }
    });

    // If deposit_amount is provided and > 0, perform deposit from creator to new user
    if (deposit_amount && deposit_amount > 0) {
      await walletService.deposit(currentUser.id, newUser.id, deposit_amount);
    }

    // Fetch updated user (with correct balance)
    const createdUser = await prismaClient.user.findUnique({
      where: { id: newUser.id },
      select: {
        id: true,
        name: true,
        user_name: true,
        role: true,
        balance: true
      }
    });

    res.status(201).json({
      message: 'User created successfully',
      user: createdUser
    });
  }

  // Get all users (with role-based filtering and grouping)
  async getUsers(req: Request, res: Response) {
    const currentUser = req.user!;

    if (currentUser.role === 'Owner') {
      // Owner: Get all Agents with their related Sub_Agents and Players
      const agents = await prismaClient.user.findMany({
        where: { role: 'Agent' },
        select: {
          id: true,
          name: true,
          user_name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          balance: true,
          createdAt: true,
          // Include related users (Sub_Agents and Players)
          users: {
            where: {
              role: {
                in: ['Sub_Agent', 'Player']
              }
            },
            select: {
              id: true,
              name: true,
              user_name: true,
              email: true,
              phone: true,
              role: true,
              status: true,
              balance: true,
              createdAt: true,
              // Include Players under Sub_Agents
              users: {
                where: {
                  role: 'Player'
                },
                select: {
                  id: true,
                  name: true,
                  user_name: true,
                  email: true,
                  phone: true,
                  role: true,
                  status: true,
                  balance: true,
                  createdAt: true
                }
              }
            }
          }
        }
      });
      return res.json({ agents });
    }

    if (currentUser.role === 'Agent') {
      // Agent: Get all Sub-Agents and Players belonging to this Agent
      const [subAgents, players] = await Promise.all([
        prismaClient.user.findMany({
          where: { 
            role: 'Sub_Agent', 
            agent_id: currentUser.id 
          },
          select: {
            id: true,
            name: true,
            user_name: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            balance: true,
            createdAt: true,
            // Include Players under Sub_Agents
            users: {
              where: {
                role: 'Player'
              },
              select: {
                id: true,
                name: true,
                user_name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                balance: true,
                createdAt: true
              }
            }
          }
        }),
        prismaClient.user.findMany({
          where: { 
            role: 'Player', 
            agent_id: currentUser.id 
          },
          select: {
            id: true,
            name: true,
            user_name: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            balance: true,
            createdAt: true
          }
        })
      ]);
      return res.json({ subAgents, players });
    }

    if (currentUser.role === 'Sub_Agent') {
      // Sub-Agent: Get all Players belonging to this Sub-Agent
      const players = await prismaClient.user.findMany({
        where: { 
          role: 'Player', 
          agent_id: currentUser.id 
        },
        select: {
          id: true,
          name: true,
          user_name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          balance: true,
          createdAt: true
        }
      });
      return res.json({ players });
    }

    // If Player or unknown role
    throw new ForbiddenException('Access denied', ErrorCode.FORBIDDEN);
  }

  // Update user
  async updateUser(req: Request, res: Response) {
    const { id } = req.params;
    const { name, email, phone, status } = req.body;
    const currentUser = req.user!;

    // Check if user has permission to update
    const targetUser = await prismaClient.user.findUnique({
      where: { id: Number(id) }
    });

    if (!targetUser) {
      throw new NotFoundException('User not found', ErrorCode.USER_NOT_FOUND);
    }

    // Validate role hierarchy
    if (currentUser.role === 'Owner' && targetUser.role !== 'Agent') {
      throw new ForbiddenException('Owner can only update Agents', ErrorCode.FORBIDDEN);
    }

    if (currentUser.role === 'Agent' && !['Sub_Agent', 'Player'].includes(targetUser.role)) {
      throw new ForbiddenException('Agent can only update Sub-Agents and Players', ErrorCode.FORBIDDEN);
    }

    const updatedUser = await prismaClient.user.update({
      where: { id: Number(id) },
      data: {
        name,
        email,
        phone,
        status
      }
    });

    res.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        status: updatedUser.status
      }
    });
  }

  // Delete user
  async deleteUser(req: Request, res: Response) {
    const { id } = req.params;
    const currentUser = req.user!;

    const targetUser = await prismaClient.user.findUnique({
      where: { id: Number(id) }
    });

    if (!targetUser) {
      throw new NotFoundException('User not found', ErrorCode.USER_NOT_FOUND);
    }

    // Validate role hierarchy
    if (currentUser.role === 'Owner' && targetUser.role !== 'Agent') {
      throw new ForbiddenException('Owner can only delete Agents', ErrorCode.FORBIDDEN);
    }

    if (currentUser.role === 'Agent' && !['Sub_Agent', 'Player'].includes(targetUser.role)) {
      throw new ForbiddenException('Agent can only delete Sub-Agents and Players', ErrorCode.FORBIDDEN);
    }

    await prismaClient.user.delete({
      where: { id: Number(id) }
    });

    res.json({ message: 'User deleted successfully' });
  }

  // Admin logout
  async adminLogout(req: Request, res: Response) {
    // Since we're using JWT tokens, we don't need to do anything server-side
    // The client should remove the token from their storage
    res.json({ message: 'Logged out successfully' });
  }

  // Update user profile (users can update their own profile)
  async updateProfile(req: Request, res: Response) {
    const currentUser = req.user!;
    const { name, email, phone, address } = req.body;

    // Get current user data to check existing values
    const currentUserData = await prismaClient.user.findUnique({
      where: { id: currentUser.id },
      select: { email: true, phone: true }
    });

    if (!currentUserData) {
      throw new NotFoundException('User not found', ErrorCode.USER_NOT_FOUND);
    }

    // Validate email format if provided
    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new BadRequestsException('Invalid email format', ErrorCode.INVALID_INPUT);
    }

    // Validate phone format if provided (basic validation)
    if (phone && !phone.match(/^\+?[\d\s-]{8,}$/)) {
      throw new BadRequestsException('Invalid phone format', ErrorCode.INVALID_INPUT);
    }

    // Check if email is already taken by another user
    if (email && email !== currentUserData.email) {
      const existingUser = await prismaClient.user.findFirst({
        where: {
          email,
          id: { not: currentUser.id }
        }
      });
      if (existingUser) {
        throw new BadRequestsException('Email already taken', ErrorCode.USER_ALREADY_EXISTS);
      }
    }

    // Check if phone is already taken by another user
    if (phone && phone !== currentUserData.phone) {
      const existingUser = await prismaClient.user.findFirst({
        where: {
          phone,
          id: { not: currentUser.id }
        }
      });
      if (existingUser) {
        throw new BadRequestsException('Phone number already taken', ErrorCode.USER_ALREADY_EXISTS);
      }
    }

    // Update user profile
    const updatedUser = await prismaClient.user.update({
      where: { id: currentUser.id },
      data: {
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined
      },
      select: {
        id: true,
        name: true,
        user_name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        status: true,
        balance: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  }
} 