CREATE DATABASE IF NOT EXISTS ecomaps
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ecomaps;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_email (email)
) ENGINE=InnoDB;

ALTER TABLE usuarios
ADD COLUMN perfil ENUM('usuario', 'admin') NOT NULL DEFAULT 'usuario'
AFTER senha_hash;

UPDATE usuarios
SET perfil = 'admin'
WHERE email = 'eu@gmail.com';


CREATE TABLE IF NOT EXISTS ecopontos (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,

    nome VARCHAR(150) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    cidade VARCHAR(120) NOT NULL,

    materiais JSON NOT NULL,

    avaliacao DECIMAL(2,1) NOT NULL DEFAULT 0.0,

    horario_funcionamento VARCHAR(150) NULL,

    link_maps VARCHAR(500) NULL,
    imagem_url VARCHAR(500) NULL,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    atualizado_em TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id)

) ENGINE=InnoDB;

/*CREATE DATABASE IF NOT EXISTS ecomaps
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ecomaps;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_email (email)
) ENGINE=InnoDB;

ALTER TABLE usuarios
ADD COLUMN perfil ENUM('usuario', 'admin') NOT NULL DEFAULT 'usuario'
AFTER senha_hash;

UPDATE usuarios
SET perfil = 'admin'
WHERE email = 'eu@gmail.com';


CREATE TABLE IF NOT EXISTS ecopontos (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,

    nome VARCHAR(150) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    cidade VARCHAR(120) NOT NULL,

    materiais JSON NOT NULL,

    avaliacao DECIMAL(2,1) NOT NULL DEFAULT 0.0,

    horario_funcionamento VARCHAR(150) NULL,

    link_maps VARCHAR(500) NULL,
    imagem_url VARCHAR(500) NULL,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    atualizado_em TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id)

) ENGINE=InnoDB;


INSERT INTO ecopontos
(nome, endereco, cidade, materiais, avaliacao, horario_funcionamento, link_maps, imagem_url, ativo)
VALUES

(
'Ecoponto Viaduto Engenheiro Alberto Badra',
'Avenida Aricanduva, 200 - Praça Lúcia Mekhitarian - Aricanduva',
'São Paulo',
JSON_ARRAY('Plásticos', 'Vidros', 'Móveis', 'Metais', 'Entulho', 'Papelão', 'Gesso'),
0.0,
'Segunda a sábado: 6h às 22h; domingos e feriados: 6h às 18h',
'https://www.google.com/maps/search/?api=1&query=Avenida+Aricanduva+200+Sao+Paulo',
NULL,
TRUE
),

(
'Ecoponto Astarte',
'Rua Astarte, 500 - Vila Carrão',
'São Paulo',
JSON_ARRAY('Plásticos', 'Vidros', 'Móveis', 'Metais', 'Entulho', 'Papelão', 'Gesso'),
0.0,
'Segunda a sábado: 6h às 22h; domingos e feriados: 6h às 18h',
'https://www.google.com/maps/search/?api=1&query=Rua+Astarte+500+Sao+Paulo',
NULL,
TRUE
),

(
'Ecoponto Nova York',
'Rua Amélia Vanso Magnoli, 480 - Conjunto Habitacional Barreira Grande',
'São Paulo',
JSON_ARRAY('Plásticos', 'Vidros', 'Móveis', 'Metais', 'Entulho', 'Papelão'),
0.0,
'Segunda a sábado: 6h às 22h; domingos e feriados: 6h às 18h',
'https://www.google.com/maps/search/?api=1&query=Rua+Amelia+Vanso+Magnoli+480+Sao+Paulo',
NULL,
TRUE
),

(
'Ecoponto Aricanduva I',
'Rua Professor Alzira de Oliveira Gilioli, 400 - Jardim Nice',
'São Paulo',
JSON_ARRAY('Plásticos', 'Vidros', 'Móveis', 'Metais', 'Entulho', 'Papelão', 'Gesso'),
0.0,
'Segunda a sábado: 6h às 22h; domingos e feriados: 6h às 18h',
'https://www.google.com/maps/search/?api=1&query=Rua+Professor+Alzira+de+Oliveira+Gilioli+400+Sao+Paulo',
NULL,
TRUE
),

(
'Ecoponto Jardim Maria do Carmo',
'Rua Caminho do Engenho, 800 - Ferreira',
'São Paulo',
JSON_ARRAY('Plásticos', 'Vidros', 'Móveis', 'Metais', 'Entulho', 'Papelão'),
0.0,
'Segunda a sábado: 6h às 22h; domingos e feriados: 6h às 18h',
'https://www.google.com/maps/search/?api=1&query=Rua+Caminho+do+Engenho+800+Sao+Paulo',
NULL,
TRUE
),

(
'Ecoponto Jardim Jaqueline',
'Rua Walter Brito Belletti, s/n - Vila Albano',
'São Paulo',
JSON_ARRAY('Plásticos', 'Vidros', 'Móveis', 'Metais', 'Entulho', 'Papelão', 'Gesso'),
0.0,
'Segunda a sábado: 6h às 22h; domingos e feriados: 6h às 18h',
'https://www.google.com/maps/search/?api=1&query=Rua+Walter+Brito+Belletti+Sao+Paulo',
NULL,
TRUE
),

(
'Ecoponto Politécnica',
'Rua Paulino Baptista Conti, 2 - Jardim Sarah',
'São Paulo',
JSON_ARRAY('Plásticos', 'Vidros', 'Móveis', 'Metais', 'Entulho', 'Papelão'),
0.0,
'Segunda a sábado: 6h às 22h; domingos e feriados: 6h às 18h',
'https://www.google.com/maps/search/?api=1&query=Rua+Paulino+Baptista+Conti+2+Sao+Paulo',
NULL,
TRUE
),

(
'Ecoponto Giovani Gronchi',
'Avenida Giovani Gronchi, 3413 - Morumbi',
'São Paulo',
JSON_ARRAY('Plásticos', 'Vidros', 'Móveis', 'Metais', 'Entulho', 'Papelão'),
0.0,
'Segunda a sábado: 6h às 22h; domingos e feriados: 6h às 18h',
'https://www.google.com/maps/search/?api=1&query=Avenida+Giovani+Gronchi+3413+Sao+Paulo',
NULL,
TRUE
),

(
'Ecoponto Santo Dias',
'Travessa Rosifloras, 301 - Conjunto Habitacional Instituto Adventista',
'São Paulo',
JSON_ARRAY('Plásticos', 'Vidros', 'Móveis', 'Metais', 'Entulho', 'Papelão'),
0.0,
'Segunda a sábado: 6h às 22h; domingos e feriados: 6h às 18h',
'https://www.google.com/maps/search/?api=1&query=Travessa+Rosifloras+301+Sao+Paulo',
NULL,
TRUE
),

(
'Ecoponto Parque Fernanda',
'Avenida Doutor Salvador Rocco, 261 - Parque Fernanda',
'São Paulo',
JSON_ARRAY('Plásticos', 'Vidros', 'Móveis', 'Metais', 'Entulho', 'Papelão'),
0.0,
'Segunda a sábado: 6h às 22h; domingos e feriados: 6h às 18h',
'https://www.google.com/maps/search/?api=1&query=Avenida+Doutor+Salvador+Rocco+261+Sao+Paulo',
NULL,
TRUE
),

(
'Ecoponto Vila das Belezas',
'Rua Campo Novo do Sul, 500 - Vila Andrade',
'São Paulo',
JSON_ARRAY('Plásticos', 'Vidros', 'Móveis', 'Metais', 'Entulho', 'Papelão', 'Gesso'),
0.0,
'Segunda a sábado: 6h às 22h; domingos e feriados: 6h às 18h',
'https://www.google.com/maps/search/?api=1&query=Rua+Campo+Novo+do+Sul+500+Sao+Paulo',
NULL,
TRUE
),

(
'Ecoponto Tereza Cristina',
'Rua Tereza Cristina, 10 - Vila Monumento',
'São Paulo',
JSON_ARRAY('Plásticos', 'Vidros', 'Móveis', 'Metais', 'Entulho', 'Papelão', 'Gesso'),
0.0,
'Segunda a sábado: 6h às 22h; domingos e feriados: 6h às 18h',
'https://www.google.com/maps/search/?api=1&query=Rua+Tereza+Cristina+10+Sao+Paulo',
NULL,
TRUE
),

(
'Ecoponto Santa Cruz',
'Rua Santa Cruz, 1452 - Vila Mariana',
'São Paulo',
JSON_ARRAY('Plásticos', 'Vidros', 'Móveis', 'Metais', 'Entulho', 'Papelão'),
0.0,
'Segunda a sábado: 6h às 22h; domingos e feriados: 6h às 18h',
'https://www.google.com/maps/search/?api=1&query=Rua+Santa+Cruz+1452+Sao+Paulo',
NULL,
TRUE
),

(
'Ecoponto Pinheiros',
'Praça do Cancioneiro, 15 - Cidade Monções',
'São Paulo',
JSON_ARRAY('Plásticos', 'Vidros', 'Móveis', 'Metais', 'Entulho', 'Papelão', 'Gesso'),
0.0,
'Segunda a sábado: 6h às 22h; domingos e feriados: 6h às 18h',
'https://www.google.com/maps/search/?api=1&query=Praca+do+Cancioneiro+15+Sao+Paulo',
NULL,
TRUE
),

(
'Ecoponto Vila Madalena',
'Rua Girassol, 15 - Vila Madalena',
'São Paulo',
JSON_ARRAY('Plásticos', 'Vidros', 'Móveis', 'Metais', 'Entulho', 'Papelão'),
0.0,
'Segunda a sábado: 6h às 22h; domingos e feriados: 6h às 18h',
'https://www.google.com/maps/search/?api=1&query=Rua+Girassol+15+Vila+Madalena+Sao+Paulo',
NULL,
TRUE
),

(
'Ecoponto Glicério',
'Praça Ministro Francisco Sá Carneiro, 6 - Liberdade',
'São Paulo',
JSON_ARRAY('Plásticos', 'Vidros', 'Móveis', 'Metais', 'Entulho', 'Papelão', 'Gesso'),
0.0,
'Segunda a sábado: 6h às 22h; domingos e feriados: 6h às 18h',
'https://www.google.com/maps/search/?api=1&query=Praca+Ministro+Francisco+Sa+Carneiro+6+Sao+Paulo',
NULL,
TRUE
),

(
'Ecoponto Liberdade',
'Rua Jaceguai, 67 - Bela Vista',
'São Paulo',
JSON_ARRAY('Plásticos', 'Vidros', 'Móveis', 'Metais', 'Entulho', 'Papelão'),
0.0,
'Segunda a sábado: 6h às 22h; domingos e feriados: 6h às 18h',
'https://www.google.com/maps/search/?api=1&query=Rua+Jaceguai+67+Sao+Paulo',
NULL,
TRUE
),

(
'Ecoponto Vila Mariana',
'Rua Mauricio Francisco Klabin, 37 - Vila Mariana',
'São Paulo',
JSON_ARRAY('Plásticos', 'Vidros', 'Móveis', 'Metais', 'Entulho', 'Papelão', 'Gesso'),
0.0,
'Segunda a sábado: 6h às 22h; domingos e feriados: 6h às 18h',
'https://www.google.com/maps/search/?api=1&query=Rua+Mauricio+Francisco+Klabin+37+Sao+Paulo',
NULL,
TRUE
);
*/