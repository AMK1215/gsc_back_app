-- CreateTable
CREATE TABLE `game_lists` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `click_count` BIGINT NOT NULL DEFAULT 0,
    `game_type_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `image_url` VARCHAR(191) NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `hot_status` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `game_lists` ADD CONSTRAINT `game_lists_game_type_id_fkey` FOREIGN KEY (`game_type_id`) REFERENCES `game_types`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `game_lists` ADD CONSTRAINT `game_lists_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `providers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
