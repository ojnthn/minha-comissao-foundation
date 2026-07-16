-- DropForeignKey
ALTER TABLE `pedido` DROP FOREIGN KEY `fk_pedido_produto`;

-- DropIndex
DROP INDEX `fk_pedido_produto` ON `pedido`;

-- AlterTable
ALTER TABLE `marceneiro` MODIFY `log_data_cadastro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    MODIFY `log_data_exclusao` DATETIME NULL;

-- AlterTable
ALTER TABLE `pedido` DROP COLUMN `id_produto`,
    DROP COLUMN `valor_porcentagem`,
    ADD COLUMN `valor` DOUBLE NOT NULL,
    MODIFY `log_data_cadastro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    MODIFY `log_data_exclusao` DATETIME NULL;

-- AlterTable
ALTER TABLE `produto` MODIFY `log_data_cadastro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    MODIFY `log_data_exclusao` DATETIME NULL;

-- CreateTable
CREATE TABLE `pedido_produto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_pedido` INTEGER NOT NULL,
    `id_produto` INTEGER NOT NULL,
    `valor_produto` DOUBLE NOT NULL,
    `valor_porcentagem` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pedido_produto` ADD CONSTRAINT `fk_pedido_produto_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedido`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pedido_produto` ADD CONSTRAINT `fk_pedido_produto_produto` FOREIGN KEY (`id_produto`) REFERENCES `produto`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
