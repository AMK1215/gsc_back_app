-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('SystemOwner', 'Owner', 'Agent', 'Sub_Agent', 'Player') NOT NULL DEFAULT 'Owner';
