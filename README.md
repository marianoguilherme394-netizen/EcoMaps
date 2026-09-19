# EcoMaps

O EcoMaps é um projeto web para localizar pontos de descarte e ajudar o usuário a encontrar locais adequados para diferentes tipos de resíduos.

## Funcionalidades

- Busca de ecopontos por material, nome, endereço ou cidade.
- Atalhos de categorias na página inicial.
- Filtro de ecopontos abertos com base no horário cadastrado.
- Exibição de nome, endereço, cidade, materiais aceitos, avaliação, horário, imagem e link para o Maps.
- Cadastro e login de usuários.
- Autenticação com JWT e senhas protegidas com bcrypt.
- Consulta e edição do perfil.
- Alteração de senha e exclusão de conta.
- Área administrativa protegida por perfil de administrador.
- CRUD de ecopontos na área administrativa.

## Estrutura principal

```text
EcoMaps/
├── database/
│   └── schema.sql
├── docs/
│   ├── assets/
│   ├── css/
│   ├── js/
│   ├── index.html
│   ├── descarte.html
│   ├── sobre.html
│   ├── cadastro.html
│   ├── login.html
│   ├── perfil.html
│   └── admin.html
├── server/
│   ├── config/
│   ├── middleware/
│   └── routes/
├── .env.example
├── docker-compose.yml
├── package.json
└── server.js
```

## Banco de dados

Execute o arquivo:

```text
database/schema.sql
```

O banco utilizado pelo projeto é `ecomaps`.

## Configuração

Crie um arquivo `.env` com base no `.env.example` e configure os dados do MySQL e a chave JWT.

Exemplo:

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

## Executar o projeto

```bash
npm install
npm start
```

Depois acesse:

```text
http://localhost:3005
```

## Principais rotas da API

| Método | Rota | Função |
|---|---|---|
| POST | `/api/usuarios/cadastro` | Cadastrar usuário |
| POST | `/api/usuarios/login` | Fazer login |
| GET | `/api/usuarios/me` | Consultar perfil |
| PUT | `/api/usuarios/me` | Atualizar perfil |
| PUT | `/api/usuarios/me/senha` | Alterar senha |
| DELETE | `/api/usuarios/me` | Excluir conta |
| GET | `/api/ecopontos` | Listar ecopontos ativos |
| GET | `/api/admin/ecopontos` | Listar ecopontos na área administrativa |
| POST | `/api/admin/ecopontos` | Cadastrar ecoponto |
| PUT | `/api/admin/ecopontos/:id` | Editar ecoponto |
| DELETE | `/api/admin/ecopontos/:id` | Remover ecoponto |
| GET | `/api/health` | Testar API e banco |
