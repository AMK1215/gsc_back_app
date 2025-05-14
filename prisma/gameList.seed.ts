import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function gameListSeeder() {
  const filePath = path.join(__dirname, '../json/data/ppModify.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const jsonData = JSON.parse(rawData);

  const gameListData = jsonData.ProviderGames.map((game: any) => ({
    code: game.GameCode,
    name: game.GameName,
    game_type_id: game.game_type_id,
    product_id: game.product_id,
    image_url: game.ImageUrl,
    click_count: 0,
    status: true,
    hot_status: false,
    provider_code: '1006',
    provider_name: "Pragmatic Play",
  }));

  console.log('Start seeding game lists...');

  for (const game of gameListData) {
    const createdGame = await prisma.gameList.create({
      data: game,
    });
    console.log(`Created game with code: ${createdGame.code}`);
  }

  console.log('Game list seeding finished.');
}

if (require.main === module) {
  gameListSeeder()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export default gameListSeeder; 