const express = require('express');
const autenticar = require('../middleware/auth');
const verificarAdmin = require('../middleware/admin');

const router = express.Router();

router.get('/', autenticar, verificarAdmin, (req, res) => {
  return res.json({
    mensagem: 'Acesso autorizado à área administrativa.'
  });
});

module.exports = router;