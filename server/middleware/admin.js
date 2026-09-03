const pool = require('../config/database');

async function verificarAdmin(req, res, next) {
  try {
    const [usuarios] = await pool.execute(
      'SELECT perfil FROM usuarios WHERE id = ? LIMIT 1',
      [req.usuarioId]
    );

    const usuario = usuarios[0];

    if (!usuario) {
      return res.status(404).json({
        mensagem: 'Usuário não encontrado.'
      });
    }

    if (usuario.perfil !== 'admin') {
      return res.status(403).json({
        mensagem: 'Acesso permitido somente para administradores.'
      });
    }

    return next();
  } catch (erro) {
    return next(erro);
  }
}

module.exports = verificarAdmin;