-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_agent_id_fkey`;

-- DropIndex
DROP INDEX `users_agent_id_key` ON `users`;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_agent_id_fkey` FOREIGN KEY (`agent_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
