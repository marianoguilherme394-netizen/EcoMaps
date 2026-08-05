# EcoMaps — usuários com Node.js e MySQL

Este projeto integra as telas de cadastro, login e perfil do EcoMaps a uma API em Node.js/Express e a um banco MySQL.

## Funcionalidades

- Cadastro de usuário com nome, e-mail e senha.
- E-mail único no banco de dados.
- Senha protegida com hash `bcrypt` — a senha original não é salva.
- Login com token JWT.
- Consulta dos dados do usuário autenticado.
- Atualização de nome e e-mail.
- Alteração de senha, exigindo a senha atual.
- Logout no navegador.
- Exclusão da conta, exigindo confirmação da senha.
- Consultas parametrizadas para evitar SQL Injection.

## Estrutura principal

```text
Ecomaps-TCC-com-banco/
├── database/
│   └── schema.sql
├── public/
│   ├── css/
│   ├── js/
│   ├── cadastro.html
│   ├── login.html
│   └── perfil.html
├── server/
│   ├── config/database.js
│   ├── middleware/auth.js
│   └── routes/usuarios.js
├── .env.example
├── package.json
└── server.js
```

## 1. Criar o banco

Abra o MySQL Workbench, phpMyAdmin ou o terminal do MySQL e execute o arquivo:

```text
database/schema.sql
```

Ele cria o banco `ecomaps` e a tabela `usuarios`.

## 2. Configurar as variáveis

Duplique o arquivo `.env.example`, renomeie a cópia para `.env` e preencha os dados do seu MySQL:

```env
PORT=3005
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=ecomaps
JWT_SECRET=coloque_aqui_uma_chave_com_mais_de_32_caracteres
JWT_EXPIRES_IN=7d
```

## 3. Instalar e executar

No terminal, dentro da pasta do projeto:

```bash
npm install
npm start
```

Depois, acesse:

```text
http://localhost:3005
```

Não abra os arquivos HTML diretamente com `file://`, pois o login depende da API Node.js.

## Rotas da API

| Método | Rota | Função |
|---|---|---|
| POST | `/api/usuarios/cadastro` | Cadastrar usuário |
| POST | `/api/usuarios/login` | Fazer login |
| GET | `/api/usuarios/me` | Consultar perfil |
| PUT | `/api/usuarios/me` | Atualizar nome e e-mail |
| PUT | `/api/usuarios/me/senha` | Alterar senha |
| DELETE | `/api/usuarios/me` | Excluir conta |
| GET | `/api/health` | Testar conexão com o banco |

## Observação sobre imagens

O arquivo original enviado não continha a pasta `assets`. Por isso, referências como `assets/logo.png` e outras imagens do site continuam dependendo dos arquivos visuais originais serem adicionados em `public/assets/`.
