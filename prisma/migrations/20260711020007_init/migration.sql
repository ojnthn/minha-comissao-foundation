-- CreateTable
CREATE TABLE `usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(150) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `usuario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comissao_porcentagem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(150) NOT NULL,
    `valor` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(150) NOT NULL,
    `id_comissao_porcentagem_padrao` INTEGER NOT NULL,
    `log_data_cadastro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `log_id_usuario_cadastro` INTEGER NOT NULL,
    `log_data_exclusao` DATETIME NULL,
    `log_id_usuario_exclusao` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `marceneiro` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(150) NOT NULL,
    `log_data_cadastro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `log_id_usuario_cadastro` INTEGER NOT NULL,
    `log_data_exclusao` DATETIME NULL,
    `log_id_usuario_exclusao` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pedido` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `valor_porcentagem` DOUBLE NOT NULL,
    `id_produto` INTEGER NOT NULL,
    `id_marceneiro` INTEGER NOT NULL,
    `log_data_cadastro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `log_id_usuario_cadastro` INTEGER NOT NULL,
    `log_data_exclusao` DATETIME NULL,
    `log_id_usuario_exclusao` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `produto` ADD CONSTRAINT `fk_produto_comissao` FOREIGN KEY (`id_comissao_porcentagem_padrao`) REFERENCES `comissao_porcentagem`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `produto` ADD CONSTRAINT `fk_produto_usuario_cadastro` FOREIGN KEY (`log_id_usuario_cadastro`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `produto` ADD CONSTRAINT `fk_produto_usuario_exclusao` FOREIGN KEY (`log_id_usuario_exclusao`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `marceneiro` ADD CONSTRAINT `fk_marceneiro_usuario_cadastro` FOREIGN KEY (`log_id_usuario_cadastro`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `marceneiro` ADD CONSTRAINT `fk_marceneiro_usuario_exclusao` FOREIGN KEY (`log_id_usuario_exclusao`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pedido` ADD CONSTRAINT `fk_pedido_produto` FOREIGN KEY (`id_produto`) REFERENCES `produto`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pedido` ADD CONSTRAINT `fk_pedido_marceneiro` FOREIGN KEY (`id_marceneiro`) REFERENCES `marceneiro`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pedido` ADD CONSTRAINT `fk_pedido_usuario_cadastro` FOREIGN KEY (`log_id_usuario_cadastro`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pedido` ADD CONSTRAINT `fk_pedido_usuario_exclusao` FOREIGN KEY (`log_id_usuario_exclusao`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
