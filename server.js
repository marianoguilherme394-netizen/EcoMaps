require('dotenv').config();

const path = require('path');
const express = require('express');
const pool = require('./server/config/database');
const usuariosRouter = require('./server/routes/usuarios');

const app = express();
const PORT = Number(process.env.PORT || 3005);
const publicDir = path.join(__dirname, 'public');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('Erro: configure JWT_SECRET no arquivo .env com pelo menos 32 caracteres.');
  process.exit(1);
}

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false }));

app.get('/api/health', async (req, res, next) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ status: 'ok', banco: 'conectado' });
  } catch (erro) {
    return next(erro);
  }
});

app.use('/api/usuarios', usuariosRouter);
app.use(express.static(publicDir));

app.use('/api', (req, res) => {
  res.status(404).json({ mensagem: 'Rota da API não encontrada.' });
});

app.use((erro, req, res, next) => {
  console.error(erro);
  if (res.headersSent) return next(erro);
  return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
});

async function iniciar() {
  try {
    await pool.query('SELECT 1');
    app.listen(PORT, () => {
      console.log(`EcoMaps disponível em http://localhost:${PORT}`);
    });
  } catch (erro) {
    console.error('Não foi possível conectar ao MySQL. Confira o arquivo .env e execute database/schema.sql.');
    console.error(erro.message);
    process.exit(1);
  }
}

iniciar();
