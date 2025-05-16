import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create System Owner
  const systemOwner = await prisma.user.create({
    data: {
      name: 'System Owner',
      user_name: 'systemowner',
      email: 'systemowner@example.com',
      phone: '1234567890',
      password: await bcrypt.hash('systemowner123', 10),
      role: 'SystemOwner',
      balance: 1000000.00
    }
  });

  // Create Owner
  const owner = await prisma.user.create({
    data: {
      name: 'Main Owner',
      user_name: 'owner',
      email: 'owner@example.com',
      phone: '1234567891',
      password: await bcrypt.hash('owner123', 10),
      role: 'Owner',
      balance: 500000.00
    }
  });

  // Create Agent
  const agent = await prisma.user.create({
    data: {
      name: 'Main Agent',
      user_name: 'agent',
      email: 'agent@example.com',
      phone: '1234567892',
      password: await bcrypt.hash('agent123', 10),
      role: 'Agent',
      balance: 100000.00,
      agent_id: owner.id
    }
  });

  // Create Sub Agent
  const subAgent = await prisma.user.create({
    data: {
      name: 'Sub Agent',
      user_name: 'subagent',
      email: 'subagent@example.com',
      phone: '1234567893',
      password: await bcrypt.hash('subagent123', 10),
      role: 'Sub_Agent',
      balance: 50000.00,
      agent_id: agent.id
    }
  });

  // Create Player
  const player = await prisma.user.create({
    data: {
      name: 'Test Player',
      user_name: 'player',
      email: 'player@example.com',
      phone: '1234567894',
      password: await bcrypt.hash('player123', 10),
      role: 'Player',
      balance: 10000.00,
      agent_id: subAgent.id
    }
  });

  console.log('Database has been seeded. 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 