import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedProviders() {
  try {
    // Delete existing providers to avoid unique constraint errors
    await prisma.provider.deleteMany();
    const providers = [
      { code: '1006', name: 'Pragmatic Play', short_name: 'PP', order: 1, status: 1, game_list_status: true },
      { code: '1012', name: 'SBO', short_name: 'SBO', order: 11, status: 1, game_list_status: true },
      { code: '1013', name: 'Joker', short_name: 'Joker', order: 12, status: 1, game_list_status: true },
      { code: '1016', name: 'YEE Bet', short_name: 'YEE Bet', order: 13, status: 1, game_list_status: true },
      { code: '1020', name: 'WM Casino', short_name: 'WM Casino', order: 14, status: 1, game_list_status: true },
      { code: '1027', name: 'Yggdrasil', short_name: 'Yggdrasil', order: 15, status: 1, game_list_status: true },
      { code: '1034', name: 'Spade Gaming', short_name: 'SG', order: 16, status: 1, game_list_status: true },
      { code: '1035', name: 'Vivo Gaming', short_name: 'VG', order: 17, status: 1, game_list_status: true },
      { code: '1050', name: 'PlayStar', short_name: 'PlayStar', order: 6, status: 1, game_list_status: true },
      { code: '1056', name: 'TrueLab', short_name: 'TL', order: 18, status: 1, game_list_status: true },
      { code: '1058', name: 'BGaming', short_name: 'BGaming', order: 19, status: 1, game_list_status: true },
      { code: '1060', name: 'Wazdan', short_name: 'Wazdan', order: 20, status: 1, game_list_status: true },
      { code: '1062', name: 'Fazi', short_name: 'FAZI', order: 21, status: 1, game_list_status: true },
      { code: '1063', name: 'Play Pearls', short_name: 'Play Pearls', order: 22, status: 1, game_list_status: true },
      { code: '1064', name: 'Net Game', short_name: 'Net Game', order: 23, status: 1, game_list_status: true },
      { code: '1065', name: 'Kiron', short_name: 'Kiron', order: 24, status: 1, game_list_status: true },
      { code: '1067', name: 'Red Rake', short_name: 'Red Rake', order: 25, status: 1, game_list_status: true },
      { code: '1070', name: 'Boongo', short_name: 'Boongo', order: 26, status: 1, game_list_status: true },
      { code: '1077', name: 'Skywind', short_name: 'SW', order: 29, status: 1, game_list_status: true },
      { code: '1085', name: 'JDB', short_name: 'JDB', order: 4, status: 1, game_list_status: true },
      { code: '1086', name: 'GENESIS', short_name: 'GENESIS', order: 30, status: 1, game_list_status: true },
      { code: '1097', name: 'Funta Gaming', short_name: 'FG', order: 31, status: 1, game_list_status: true },
      { code: '1098', name: 'Felix Gaming', short_name: 'FelixGaming', order: 32, status: 1, game_list_status: true },
      { code: '1101', name: 'ZeusPlay', short_name: 'ZeusPlay', order: 33, status: 1, game_list_status: true },
      { code: '1102', name: 'KA Gaming', short_name: 'KA', order: 7, status: 1, game_list_status: true },
      { code: '1109', name: 'Netent', short_name: 'Netent', order: 34, status: 1, game_list_status: true },
      { code: '1111', name: 'Gaming World', short_name: 'GamingWorld', order: 35, status: 1, game_list_status: true },
      { code: '1001', name: 'Asia Gaming', short_name: 'AsiaGaming', order: 36, status: 1, game_list_status: true },
      { code: '1002', name: 'Evolution Gaming', short_name: 'EG', order: 37, status: 1, game_list_status: true },
      { code: '1004', name: 'Big Gaming', short_name: 'BG', order: 10, status: 1, game_list_status: true },
      { code: '1007', name: 'PG Soft', short_name: 'PGSoft', order: 2, status: 1, game_list_status: true },
      { code: '1009', name: 'CQ9', short_name: 'CQ9', order: 8, status: 1, game_list_status: true },
      { code: '1022', name: 'Sexy Gaming', short_name: 'SexyGaming', order: 38, status: 1, game_list_status: true },
      { code: '1023', name: 'Real Time Gaming', short_name: 'RealTimeGaming', order: 39, status: 1, game_list_status: true },
      { code: '1091', name: 'Jili', short_name: 'JILI', order: 3, status: 1, game_list_status: true },
      { code: '1038', name: 'King 855', short_name: 'K855', order: 40, status: 1, game_list_status: true },
      { code: '1041', name: 'Habanero', short_name: 'Habanero', order: 41, status: 1, game_list_status: true },
      { code: '1150', name: 'Live22SM', short_name: 'Live22', order: 42, status: 1, game_list_status: true },
      { code: '1132', name: 'YesGetRich', short_name: 'YesgetRich', order: 43, status: 1, game_list_status: true },
      { code: '1089', name: 'Simple Play', short_name: 'SP', order: 44, status: 1, game_list_status: true },
      { code: '1084', name: 'Advant Play', short_name: 'AP', order: 45, status: 1, game_list_status: true },
      { code: '1104', name: 'SSports', short_name: 'Sport', order: 46, status: 1, game_list_status: true },
      { code: '1055', name: 'Mr Slotty', short_name: 'MrSlotty', order: 48, status: 1, game_list_status: true },
      { code: '1110', name: 'Red Tiger', short_name: 'RedTiger', order: 50, status: 1, game_list_status: true },
      { code: '1100', name: 'SmartSoft', short_name: 'SmartSoft', order: 9, status: 1, game_list_status: true },
    ];

    // Create providers
    for (const provider of providers) {
      try {
        await prisma.provider.create({
          data: provider,
        });
      } catch (error) {
        console.error('Failed to insert provider:', provider, error);
      }
    }

    console.log('Providers seeded successfully');
  } catch (error) {
    console.error('Error seeding providers:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
seedProviders()
  .catch((error) => {
    console.error('Error in provider seeder:', error);
    process.exit(1);
  });

export default seedProviders; 