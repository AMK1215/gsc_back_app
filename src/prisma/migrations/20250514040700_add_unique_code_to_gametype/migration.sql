/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `game_types` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `game_types_code_key` ON `game_types`(`code`);
