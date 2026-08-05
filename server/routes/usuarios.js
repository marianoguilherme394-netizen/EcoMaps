const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const autenticar = require('../middleware/auth');

const router = express.Router();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function limparTexto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

function normalizarEmail(valor) {
  return limparTexto(valor).toLowerCase();
}

function usuarioPublico(usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    criadoEm: usuario.criado_em,
    atualizadoEm: usuario.atualizado_em
  };
}

function gerarToken(usuarioId) {
  return jwt.sign(
    {},
    process.env.JWT_SECRET,
    {
      subject: String(usuarioId),
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
}

router.post('/cadastro', async (req, res, next) => {
  try {
    const nome = limparTexto(req.body.nome);
    const email = normalizarEmail(req.body.email);
    const senha = typeof req.body.senha === 'string' ? req.body.senha : '';

    if (nome.length < 3 || nome.length > 120) {
      return res.status(400).json({ mensagem: 'Informe um nome com 3 a 120 caracteres.' });
    }

    if (!EMAIL_REGEX.test(email) || email.length > 190) {
      return res.status(400).json({ mensagem: 'Informe um e-mail válido.' });
    }

    if (senha.length < 6 || senha.length > 72) {
      return res.status(400).json({ mensagem: 'A senha deve ter entre 6 e 72 caracteres.' });
    }

    const [existentes] = await pool.execute(
      'SELECT id FROM usuarios WHERE email = ? LIMIT 1',
      [email]
    );

    if (existentes.length > 0) {
      return res.status(409).json({ mensagem: 'Este e-mail já está cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, 12);
    const [resultado] = await pool.execute(
      'INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)',
      [nome, email, senhaHash]
    );

    const [usuarios] = await pool.execute(
      'SELECT id, nome, email, criado_em, atualizado_em FROM usuarios WHERE id = ?',
      [resultado.insertId]
    );

    const usuario = usuarios[0];
    return res.status(201).json({
      mensagem: 'Cadastro realizado com sucesso!',
      token: gerarToken(usuario.id),
      usuario: usuarioPublico(usuario)
    });
  } catch (erro) {
    if (erro && erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mensagem: 'Este e-mail já está cadastrado.' });
    }
    return next(erro);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = normalizarEmail(req.body.email);
    const senha = typeof req.body.senha === 'string' ? req.body.senha : '';

    if (!email || !senha) {
      return res.status(400).json({ mensagem: 'Preencha o e-mail e a senha.' });
    }

    const [usuarios] = await pool.execute(
      'SELECT id, nome, email, senha_hash, criado_em, atualizado_em FROM usuarios WHERE email = ? LIMIT 1',
      [email]
    );

    const usuario = usuarios[0];
    const senhaCorreta = usuario
      ? await bcrypt.compare(senha, usuario.senha_hash)
      : false;

    if (!usuario || !senhaCorreta) {
      return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
    }

    return res.json({
      mensagem: 'Login realizado com sucesso!',
      token: gerarToken(usuario.id),
      usuario: usuarioPublico(usuario)
    });
  } catch (erro) {
    return next(erro);
  }
});

router.get('/me', autenticar, async (req, res, next) => {
  try {
    const [usuarios] = await pool.execute(
      'SELECT id, nome, email, criado_em, atualizado_em FROM usuarios WHERE id = ? LIMIT 1',
      [req.usuarioId]
    );

    if (!usuarios[0]) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }

    return res.json({ usuario: usuarioPublico(usuarios[0]) });
  } catch (erro) {
    return next(erro);
  }
});

router.put('/me', autenticar, async (req, res, next) => {
  try {
    const nome = limparTexto(req.body.nome);
    const email = normalizarEmail(req.body.email);

    if (nome.length < 3 || nome.length > 120) {
      return res.status(400).json({ mensagem: 'Informe um nome com 3 a 120 caracteres.' });
    }

    if (!EMAIL_REGEX.test(email) || email.length > 190) {
      return res.status(400).json({ mensagem: 'Informe um e-mail válido.' });
    }

    const [emailEmUso] = await pool.execute(
      'SELECT id FROM usuarios WHERE email = ? AND id <> ? LIMIT 1',
      [email, req.usuarioId]
    );

    if (emailEmUso.length > 0) {
      return res.status(409).json({ mensagem: 'Este e-mail já está em uso.' });
    }

    const [resultado] = await pool.execute(
      'UPDATE usuarios SET nome = ?, email = ? WHERE id = ?',
      [nome, email, req.usuarioId]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }

    const [usuarios] = await pool.execute(
      'SELECT id, nome, email, criado_em, atualizado_em FROM usuarios WHERE id = ?',
      [req.usuarioId]
    );

    return res.json({
      mensagem: 'Perfil atualizado com sucesso!',
      usuario: usuarioPublico(usuarios[0])
    });
  } catch (erro) {
    if (erro && erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mensagem: 'Este e-mail já está em uso.' });
    }
    return next(erro);
  }
});

router.put('/me/senha', autenticar, async (req, res, next) => {
  try {
    const senhaAtual = typeof req.body.senhaAtual === 'string' ? req.body.senhaAtual : '';
    const novaSenha = typeof req.body.novaSenha === 'string' ? req.body.novaSenha : '';

    if (!senhaAtual || novaSenha.length < 6 || novaSenha.length > 72) {
      return res.status(400).json({ mensagem: 'A nova senha deve ter entre 6 e 72 caracteres.' });
    }

    const [usuarios] = await pool.execute(
      'SELECT id, senha_hash FROM usuarios WHERE id = ? LIMIT 1',
      [req.usuarioId]
    );

    const usuario = usuarios[0];
    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }

    const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: 'A senha atual está incorreta.' });
    }

    const novaSenhaHash = await bcrypt.hash(novaSenha, 12);
    await pool.execute(
      'UPDATE usuarios SET senha_hash = ? WHERE id = ?',
      [novaSenhaHash, req.usuarioId]
    );

    return res.json({ mensagem: 'Senha alterada com sucesso!' });
  } catch (erro) {
    return next(erro);
  }
});

router.delete('/me', autenticar, async (req, res, next) => {
  try {
    const senha = typeof req.body.senha === 'string' ? req.body.senha : '';

    if (!senha) {
      return res.status(400).json({ mensagem: 'Informe sua senha para excluir a conta.' });
    }

    const [usuarios] = await pool.execute(
      'SELECT id, senha_hash FROM usuarios WHERE id = ? LIMIT 1',
      [req.usuarioId]
    );

    const usuario = usuarios[0];
    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: 'Senha incorreta. A conta não foi excluída.' });
    }

    await pool.execute('DELETE FROM usuarios WHERE id = ?', [req.usuarioId]);
    return res.json({ mensagem: 'Conta excluída com sucesso.' });
  } catch (erro) {
    return next(erro);
  }
});

module.exports = router;
