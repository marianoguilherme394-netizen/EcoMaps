# EcoMaps

O EcoMaps é um projeto de TCC que ajuda a encontrar ecopontos para o descarte de resíduos. O usuário pode pesquisar locais, consultar os materiais aceitos e abrir o endereço no Google Maps.

## Funcionalidades

- Busca de ecopontos por material, nome, endereço ou cidade.
- Atalhos de materiais na página inicial.
- Filtro de ecopontos abertos conforme o horário cadastrado.
- Exibição de endereço, materiais aceitos, horário, avaliação e imagem do local.
- Cadastro e login de usuários.
- Consulta e edição do perfil, alteração de senha e exclusão da conta.
- Área administrativa para cadastrar, editar e remover ecopontos.

## Tecnologias utilizadas

| Parte do projeto | Tecnologias |
|---|---|
| Interface | HTML, CSS e JavaScript |
| Servidor e API | Node.js e Express |
| Banco de dados | MySQL |
| Autenticação | JWT e bcryptjs |
| Containers | Docker Compose e Nginx |

O front está na pasta `docs/`. O servidor está em `server.js` e na pasta `server/`. O arquivo `database/schema.sql` contém a estrutura do banco e os ecopontos iniciais.

## Como executar o projeto completo localmente

É necessário ter Node.js e MySQL instalados.

1. Crie o banco importando `database/schema.sql` no MySQL.
2. Copie `.env.example` para um arquivo chamado `.env`.
3. No `.env`, configure os dados de conexão com o MySQL e substitua `JWT_SECRET` por uma chave longa e aleatória.
4. Na pasta do projeto, execute:

```bash
npm install
npm start
```

Acesse `http://localhost:3005`. Nesse endereço, o Express disponibiliza tanto as páginas quanto as rotas da API.

## Prévia do front com Docker

Com o Docker em execução, use:

```bash
docker compose up -d
```

Acesse `http://localhost:8080`.

O `docker-compose.yml` atual configura o Nginx para exibir os arquivos da pasta `docs/`. Essa prévia mostra a interface, mas as funções que consultam a API, como login e busca de ecopontos, precisam que o servidor Node.js e o MySQL também estejam configurados e acessíveis.

## Estrutura do projeto

```text
EcoMaps/
├── database/          # Estrutura e dados iniciais do MySQL
├── docs/              # Páginas, estilos, scripts e imagens
├── server/            # Configuração, autenticação e rotas da API
├── .env.example       # Modelo das variáveis de ambiente
├── docker-compose.yml # Prévia do front com Nginx
├── package.json       # Dependências e comandos do Node.js
└── server.js          # Inicialização do servidor
```

## API

Entre as rotas disponíveis estão:

- `GET /api/ecopontos` — lista os ecopontos ativos.
- `POST /api/usuarios/cadastro` — cadastra um usuário.
- `POST /api/usuarios/login` — autentica um usuário.
- `GET /api/usuarios/me` — consulta o perfil autenticado.
- `/api/admin/ecopontos` — permite ao administrador gerenciar ecopontos.
- `GET /api/health` — verifica a conexão da API com o banco.