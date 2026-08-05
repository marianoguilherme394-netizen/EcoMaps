const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  const authorization = req.headers.authorization || '';
  const [tipo, token] = authorization.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ mensagem: 'Faça login para continuar.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = Number(payload.sub);
    return next();
  } catch (erro) {
    return res.status(401).json({ mensagem: 'Sessão inválida ou expirada. Faça login novamente.' });
  }
}

module.exports = autenticar;
