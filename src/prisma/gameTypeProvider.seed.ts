import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const providerCodeMap = {
  'Pragmatic Play': '1006',
  'SBO': '1012',
  'Joker': '1013',
  'YEE Bet': '1016',
  'WM Casino': '1020',
  'Yggdrasil': '1027',
  'Spade Gaming': '1034',
  'Vivo Gaming': '1035',
  'PlayStar': '1050',
  'TrueLab': '1056',
  'BGaming': '1058',
  'Wazdan': '1060',
  'Fazi': '1062',
  'Play Pearls': '1063',
  'Net Game': '1064',
  'Kiron': '1065',
  'Red Rake': '1067',
  'Boongo': '1070',
  'Skywind': '1077',
  'JDB': '1085',
  'GENESIS': '1086',
  'Funta Gaming': '1097',
  'Felix Gaming': '1098',
  'ZeusPlay': '1101',
  'KA Gaming': '1102',
  'Netent': '1109',
  'Gaming World': '1111',
  'Asia Gaming': '1001',
  'Evolution Gaming': '1002',
  'Big Gaming': '1004',
  'PG Soft': '1007',
  'CQ9': '1009',
  'Sexy Gaming': '1022',
  'Real Time Gaming': '1023',
  'Jili': '1091',
  'King 855': '1038',
  'Habanero': '1041',
  'Live22SM': '1150',
  'YesGetRich': '1132',
  'Simple Play': '1089',
  'Advant Play': '1084',
  'SSports': '1104',
  'Mr Slotty': '1055',
  'Red Tiger': '1110',
  'SmartSoft': '1100',
};

async function getProviderIdByOrder(order: number) {
  const provider = await prisma.provider.findFirst({ where: { order } });
  return provider?.id;
}

async function getGameTypeIdByOrder(order: number) {
  const gameType = await prisma.gameType.findFirst({ where: { order: order.toString() } });
  return gameType?.id;
}

async function seedGameTypeProviders() {
  try {
    const gameTypeProviders = [
      { providerCode: '1006', gameTypeCode: '1', image: 'pragmatic_play.png', rate: '1.0000' },
      { providerCode: '1006', gameTypeCode: '2', image: 'pragmatic_casino.png', rate: '1.0000' },
      { providerCode: '1012', gameTypeCode: '3', image: 'sbo_sport.png', rate: '1.0000' },
      { providerCode: '1013', gameTypeCode: '1', image: 'Joker.png', rate: '1.0000' },
      { providerCode: '1013', gameTypeCode: '4', image: 'Joker.png', rate: '1.0000' },
      { providerCode: '1016', gameTypeCode: '2', image: 'YEE_BET.png', rate: '1.0000' },
      { providerCode: '1020', gameTypeCode: '2', image: 'WM.png', rate: '1.0000' },
      { providerCode: '1027', gameTypeCode: '1', image: 'YGG.png', rate: '1.0000' },
      { providerCode: '1034', gameTypeCode: '1', image: 'Space_gaming.png', rate: '1.0000' },
      { providerCode: '1034', gameTypeCode: '4', image: 'Space_gaming.png', rate: '1.0000' },
      { providerCode: '1035', gameTypeCode: '2', image: 'vivo_gaming.png', rate: '1.0000' },
      { providerCode: '1050', gameTypeCode: '1', image: 'playstar.png', rate: '1.0000' },
      { providerCode: '1050', gameTypeCode: '4', image: 'vivo_gaming.png', rate: '1.0000' },
      { providerCode: '1056', gameTypeCode: '1', image: 'True_Lap.png', rate: '1.0000' },
      { providerCode: '1058', gameTypeCode: '1', image: 'Bgaming.png', rate: '1.0000' },
      { providerCode: '1060', gameTypeCode: '1', image: 'Wazdan.png', rate: '1.0000' },
      { providerCode: '1062', gameTypeCode: '1', image: 'Fazi.png', rate: '1.0000' },
      { providerCode: '1063', gameTypeCode: '1', image: 'playpearl.png', rate: '1.0000' },
      { providerCode: '1064', gameTypeCode: '1', image: 'Net_Game.png', rate: '1.0000' },
      { providerCode: '1065', gameTypeCode: '5', image: 'KIRON.png', rate: '1.0000' },
      { providerCode: '1067', gameTypeCode: '1', image: 'Redrakt.png', rate: '1.0000' },
      { providerCode: '1070', gameTypeCode: '1', image: 'Bcocon.png', rate: '1.0000' },
      { providerCode: '1077', gameTypeCode: '1', image: 'Sky_Wind.png', rate: '1.0000' },
      { providerCode: '1085', gameTypeCode: '1', image: 'jdb.png', rate: '100.0000' },
      { providerCode: '1086', gameTypeCode: '1', image: 'Genesis.png', rate: '1.0000' },
      { providerCode: '1097', gameTypeCode: '1', image: 'FUNTA_gaming.png', rate: '1.0000' },
      { providerCode: '1098', gameTypeCode: '1', image: 'Felix_gaming.png', rate: '1.0000' },
      { providerCode: '1101', gameTypeCode: '1', image: 'Zeus.png', rate: '1.0000' },
      { providerCode: '1102', gameTypeCode: '1', image: 'KA_Gaming.png', rate: '1.0000' },
      { providerCode: '1109', gameTypeCode: '1', image: 'Netent.png', rate: '1.0000' },
      { providerCode: '1111', gameTypeCode: '1', image: 'Gaming_World.png', rate: '1.0000' },
      { providerCode: '1001', gameTypeCode: '1', image: 'Asia_Gaming.png', rate: '100.0000' },
      { providerCode: '1001', gameTypeCode: '2', image: 'Asia_Gaming_Casino.png', rate: '100.0000' },
      { providerCode: '1002', gameTypeCode: '2', image: 'Evolotion.png', rate: '1.0000' },
      { providerCode: '1004', gameTypeCode: '1', image: 'Big_Gaming.png', rate: '1000.0000' },
      { providerCode: '1004', gameTypeCode: '2', image: 'Big_Gaming.png', rate: '1000.0000' },
      { providerCode: '1007', gameTypeCode: '1', image: 'pg_soft.png', rate: '1.0000' },
      { providerCode: '1009', gameTypeCode: '1', image: 'cq9_slot.png', rate: '1.0000' },
      { providerCode: '1009', gameTypeCode: '8', image: 'cq9.png', rate: '1.0000' },
      { providerCode: '1022', gameTypeCode: '2', image: 'Sexy_gaming.png', rate: '1.0000' },
      { providerCode: '1023', gameTypeCode: '1', image: 'Real_Time_Gaming.png', rate: '1.0000' },
      { providerCode: '1091', gameTypeCode: '1', image: 'jili.png', rate: '1.0000' },
      { providerCode: '1038', gameTypeCode: '2', image: 'King_855.png', rate: '1.0000' },
      { providerCode: '1041', gameTypeCode: '1', image: 'Hanbanero.png', rate: '1.0000' },
      { providerCode: '1150', gameTypeCode: '1', image: 'live22.png', rate: '1.0000' },
      { providerCode: '1132', gameTypeCode: '1', image: 'yesgetrich.png', rate: '1.0000' },
      { providerCode: '1089', gameTypeCode: '1', image: 'Simpleplay.png', rate: '1000.0000' },
      { providerCode: '1084', gameTypeCode: '1', image: 'Advant_Play.png', rate: '1.0000' },
      { providerCode: '1104', gameTypeCode: '3', image: 'S_Sport.png', rate: '1.0000' },
      { providerCode: '1055', gameTypeCode: '1', image: 'Mr_Slotty.png', rate: '1.0000' },
      { providerCode: '1100', gameTypeCode: '1', image: 'Smartsoft.png', rate: '1.0000' },
    ];

    // Delete existing game type providers
    await prisma.gameTypeProvider.deleteMany();

    let inserted = 0;
    let skipped = 0;

    for (const entry of gameTypeProviders) {
      console.log('Trying:', entry);
      const provider = await prisma.provider.findUnique({ where: { code: entry.providerCode } });
      const gameType = await prisma.gameType.findUnique({ where: { code: entry.gameTypeCode } });
      if (!provider) {
        console.warn(`Provider with code ${entry.providerCode} not found`);
        skipped++;
        continue;
      }
      if (!gameType) {
        console.warn(`GameType with code ${entry.gameTypeCode} not found`);
        skipped++;
        continue;
      }
      await prisma.gameTypeProvider.create({
        data: {
          provider_id: provider.id,
          game_type_id: gameType.id,
          image: entry.image,
          rate: entry.rate,
        },
      });
      inserted++;
    }

    console.log(`Game type providers seeded successfully. Inserted: ${inserted}, Skipped: ${skipped}`);
  } catch (error) {
    console.error('Error seeding game type providers:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedGameTypeProviders()
    .then(() => {
      console.log('Seeder finished running');
    })
    .catch((err) => {
      console.error('Seeder error:', err);
    });
}

export default seedGameTypeProviders; 