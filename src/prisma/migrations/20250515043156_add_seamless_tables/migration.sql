-- CreateTable
CREATE TABLE `SeamlessEvent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `message_id` VARCHAR(191) NOT NULL,
    `provider_id` VARCHAR(191) NOT NULL,
    `raw_data` JSON NULL,
    `request_time` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SeamlessTransaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `seamless_event_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `game_type_id` INTEGER NOT NULL,
    `provider_id` INTEGER NOT NULL,
    `wager_id` BIGINT NULL,
    `valid_bet_amount` DECIMAL(65, 30) NOT NULL,
    `bet_amount` DECIMAL(65, 30) NOT NULL,
    `transaction_amount` DECIMAL(65, 30) NOT NULL,
    `transaction_id` VARCHAR(191) NOT NULL,
    `rate` DECIMAL(65, 30) NULL,
    `payout_amount` DECIMAL(65, 30) NOT NULL DEFAULT 0.00,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `wager_status` VARCHAR(191) NOT NULL DEFAULT 'Ongoing',
    `member_name` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SeamlessTransaction_transaction_id_key`(`transaction_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SeamlessEvent` ADD CONSTRAINT `SeamlessEvent_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SeamlessTransaction` ADD CONSTRAINT `SeamlessTransaction_seamless_event_id_fkey` FOREIGN KEY (`seamless_event_id`) REFERENCES `SeamlessEvent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SeamlessTransaction` ADD CONSTRAINT `SeamlessTransaction_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SeamlessTransaction` ADD CONSTRAINT `SeamlessTransaction_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `providers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
