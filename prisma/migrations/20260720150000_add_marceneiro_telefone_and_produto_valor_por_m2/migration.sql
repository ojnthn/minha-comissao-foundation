-- AlterTable: marceneiro ganha telefone opcional
ALTER TABLE `marceneiro` ADD COLUMN `telefone` VARCHAR(20) NULL;

-- AlterTable: produto ganha valor_por_m2 obrigatório
ALTER TABLE `produto` ADD COLUMN `valor_por_m2` DOUBLE NULL;
UPDATE `produto` SET `valor_por_m2` = 0 WHERE `valor_por_m2` IS NULL;
ALTER TABLE `produto` MODIFY COLUMN `valor_por_m2` DOUBLE NOT NULL;
