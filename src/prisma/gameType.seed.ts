import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedGameTypes() {
  try {
    // Game Types data
    const gameTypes = [
      {
        name: 'Slot',
        name_mm: 'စလော့',
        code: '1',
        order: '1',
        status: 1,
        img: 'slots.png',
      },
      {
        name: 'Live Casino',
        name_mm: 'တိုက်ရိုက်ကာစီနို',
        code: '2',
        order: '2',
        status: 1,
        img: 'live_casino.png',
      },
      {
        name: 'Sport Book',
        name_mm: 'အားကစား',
        code: '3',
        order: '3',
        status: 1,
        img: 'sportbook.png',
      },
      {
        name: 'Virtual Sport',
        name_mm: 'အားကစား',
        code: '4',
        order: '4',
        status: 1,
        img: 'sportbook.png',
      },
      {
        name: 'Lottery',
        name_mm: 'ထီ',
        code: '5',
        order: '5',
        status: 1,
        img: 'sportbook.png',
      },
      {
        name: 'Qipai',
        name_mm: 'Qipai',
        code: '6',
        order: '6',
        status: 0,
        img: 'sportbook.png',
      },
      {
        name: 'P2P',
        name_mm: 'အားကစား',
        code: '7',
        order: '7',
        status: 0,
        img: 'sportbook.png',
      },
      {
        name: 'Fishing',
        name_mm: 'ငါးဖမ်းခြင်း',
        code: '8',
        order: '8',
        status: 0,
        img: 'fishing.png',
      },
      {
        name: 'Other',
        name_mm: 'အခြားဂိမ်းများ',
        code: '9',
        order: '9',
        status: 0,
        img: 'other.png',
      },
      {
        name: 'Cock Fighting',
        name_mm: 'အခြားဂိမ်းများ',
        code: '10',
        order: '10',
        status: 0,
        img: 'other.png',
      },
      {
        name: 'Bonus',
        name_mm: 'အခြားဂိမ်းများ',
        code: '11',
        order: '11',
        status: 0,
        img: 'other.png',
      },
      {
        name: 'Jackpot',
        name_mm: 'အားကစား',
        code: '12',
        order: '12',
        status: 0,
        img: 'sportbook.png',
      },
      {
        name: 'ESport',
        name_mm: 'အားကစား',
        code: '13',
        order: '13',
        status: 0,
        img: 'sportbook.png',
      },
      {
        name: 'Card Game',
        name_mm: 'ကဒ်ဂိမ်း',
        code: '1',
        order: '14',
        status: 1,
        img: 'sportbook.png',
      },
      {
        name: 'Table Game',
        name_mm: 'Table ဂိမ်း',
        code: '1',
        order: '15',
        status: 1,
        img: 'sportbook.png',
      },
    ];

    // Delete existing game types
    await prisma.gameType.deleteMany();

    // Create game types
    for (const gameType of gameTypes) {
      await prisma.gameType.create({
        data: gameType,
      });
    }

    console.log('Game types seeded successfully');
  } catch (error) {
    console.error('Error seeding game types:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export default seedGameTypes;

// Run the seeder
seedGameTypes()
  .catch((error) => {
    console.error('Error in game type seeder:', error);
    process.exit(1);
  }); 