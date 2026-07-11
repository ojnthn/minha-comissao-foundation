-- =========================================
-- Banco de dados: controle de comissões / marcenaria
-- =========================================

CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL -- armazenar hash (bcrypt, argon2, etc), nunca texto puro
) ENGINE=InnoDB;

CREATE TABLE comissao_porcentagem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    valor DOUBLE NOT NULL
) ENGINE=InnoDB;

CREATE TABLE produto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    id_comissao_porcentagem_padrao INT NOT NULL,

    log_data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    log_id_usuario_cadastro INT NOT NULL,
    log_data_exclusao DATETIME NULL,
    log_id_usuario_exclusao INT NULL,

    CONSTRAINT fk_produto_comissao
        FOREIGN KEY (id_comissao_porcentagem_padrao) REFERENCES comissao_porcentagem(id),

    CONSTRAINT fk_produto_usuario_cadastro
        FOREIGN KEY (log_id_usuario_cadastro) REFERENCES usuario(id),

    CONSTRAINT fk_produto_usuario_exclusao
        FOREIGN KEY (log_id_usuario_exclusao) REFERENCES usuario(id)
) ENGINE=InnoDB;

CREATE TABLE marceneiro (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,

    log_data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    log_id_usuario_cadastro INT NOT NULL,
    log_data_exclusao DATETIME NULL,
    log_id_usuario_exclusao INT NULL,

    CONSTRAINT fk_marceneiro_usuario_cadastro
        FOREIGN KEY (log_id_usuario_cadastro) REFERENCES usuario(id),

    CONSTRAINT fk_marceneiro_usuario_exclusao
        FOREIGN KEY (log_id_usuario_exclusao) REFERENCES usuario(id)
) ENGINE=InnoDB;

CREATE TABLE pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    valor_porcentagem DOUBLE NOT NULL,
    id_produto INT NOT NULL,
    id_marceneiro INT NOT NULL,

    log_data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    log_id_usuario_cadastro INT NOT NULL,
    log_data_exclusao DATETIME NULL,
    log_id_usuario_exclusao INT NULL,

    CONSTRAINT fk_pedido_produto
        FOREIGN KEY (id_produto) REFERENCES produto(id),

    CONSTRAINT fk_pedido_marceneiro
        FOREIGN KEY (id_marceneiro) REFERENCES marceneiro(id),

    CONSTRAINT fk_pedido_usuario_cadastro
        FOREIGN KEY (log_id_usuario_cadastro) REFERENCES usuario(id),

    CONSTRAINT fk_pedido_usuario_exclusao
        FOREIGN KEY (log_id_usuario_exclusao) REFERENCES usuario(id)
) ENGINE=InnoDB;