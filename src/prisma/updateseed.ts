import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Import seeder functions
import providerSeeder from './provider.seed';
import gameTypeSeeder from './gameType.seed';
import gameTypeProviderSeeder from './gameTypeProvider.seed';

async function main() {
  // Seed providers first
  //await providerSeeder();
  // Then seed game types
 // await gameTypeSeeder();
  // Then seed game type providers (relations)
  //await gameTypeProviderSeeder();
  await prisma.user.deleteMany();

  // Create Owner
  const owner = await prisma.user.create({
    data: {
      name: 'Owner',
      user_name: 'owner',
      email: 'owner@example.com',
      phone: '09123456789',
      password: await bcrypt.hash('owner123', 10),
      role: 'Owner',
      balance: 50000000
    }
  });

  const Systemowner = await prisma.user.create({
    data: {
      name: 'System Owner',
      user_name: 'systemowner',
      email: 'systemowner@example.com',
      phone: '09123456788',
      password: await bcrypt.hash('systemowner123', 10),
      role: 'SystemOwner',
      balance: 5000000
    }
  });

  // Create Agent
  const agent = await prisma.user.create({
    data: {
      name: 'Main Agent',
      user_name: 'agent',
      email: 'agent@example.com',
      phone: '09123456787',
      password: await bcrypt.hash('agent123', 10),
      role: 'Agent',
      balance: 400000,
      agent_id: owner.id
    }
  });

  // Create Sub Agent
  const subAgent = await prisma.user.create({
    data: {
      name: 'Sub Agent',
      user_name: 'subagent',
      email: 'subagent@example.com',
      phone: '09123456786',
      password: await bcrypt.hash('subagent123', 10),
      role: 'Sub_Agent',
      balance: 300000,
      agent_id: agent.id
    }
  });

  // Create Player
  const player001 = await prisma.user.create({
    data: {
      name: 'Test Player',
      user_name: 'player001',
      email: 'player001@example.com',
      phone: '09123456785',
      password: await bcrypt.hash('player123', 10),
      role: 'Player',
      balance: 100000,
      agent_id: subAgent.id
    }
  });

  const player002 = await prisma.user.create({
    data: {
      name: 'Test Player',
      user_name: 'player002',
      email: 'player002@example.com',
      phone: '09123456784',
      password: await bcrypt.hash('player123', 10),
      role: 'Player',
      balance: 100000,
      agent_id: agent.id
    }
  });

  console.log('All seeders ran successfully');
}

main()
  .then(() => {
    console.log('All seeders ran successfully');
  })
  .catch((e) => {
    console.error('Error running seeders:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 