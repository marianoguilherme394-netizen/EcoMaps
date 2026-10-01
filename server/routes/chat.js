const express = require('express');
const pool = require('../config/database');
const autenticar = require('../middleware/auth');
const verificarAdmin = require('../middleware/admin');

const router = express.Router();


// =========================================================
// USUÁRIO LOGADO
// =========================================================


// Buscar ou criar a conversa do usuário
router.get('/conversa', autenticar, async (req, res, next) => {
  try {

    const usuarioId = req.usuarioId;

    // Procura uma conversa aberta do usuário
    const [conversas] = await pool.execute(
      `
      SELECT
        id,
        usuario_id,
        status,
        criado_em,
        atualizado_em
      FROM conversas
      WHERE usuario_id = ?
        AND status = 'aberta'
      ORDER BY criado_em DESC
      LIMIT 1
      `,
      [usuarioId]
    );

    // Se já existir, retorna a conversa
    if (conversas.length > 0) {
      return res.json({
        conversa: conversas[0]
      });
    }

    // Caso não exista, cria uma nova conversa
    const [resultado] = await pool.execute(
      `
      INSERT INTO conversas
      (usuario_id)
      VALUES (?)
      `,
      [usuarioId]
    );

    const [novaConversa] = await pool.execute(
      `
      SELECT
        id,
        usuario_id,
        status,
        criado_em,
        atualizado_em
      FROM conversas
      WHERE id = ?
      `,
      [resultado.insertId]
    );

    return res.status(201).json({
      conversa: novaConversa[0]
    });

  } catch (erro) {
    return next(erro);
  }
});


// Buscar mensagens da conversa do usuário
router.get('/mensagens', autenticar, async (req, res, next) => {
  try {

    const usuarioId = req.usuarioId;

    // Procura a conversa aberta do usuário
    const [conversas] = await pool.execute(
      `
      SELECT id
      FROM conversas
      WHERE usuario_id = ?
        AND status = 'aberta'
      ORDER BY criado_em DESC
      LIMIT 1
      `,
      [usuarioId]
    );

    // Usuário ainda não possui conversa
    if (conversas.length === 0) {
      return res.json({
        mensagens: []
      });
    }

    const conversaId = conversas[0].id;

    // Busca todas as mensagens da conversa
    const [mensagens] = await pool.execute(
      `
      SELECT
        m.id,
        m.conversa_id,
        m.remetente_id,
        m.mensagem,
        m.lida,
        m.criado_em,

        u.nome AS remetente_nome,
        u.perfil AS remetente_perfil

      FROM mensagens m

      INNER JOIN usuarios u
        ON u.id = m.remetente_id

      WHERE m.conversa_id = ?

      ORDER BY m.criado_em ASC, m.id ASC
      `,
      [conversaId]
    );

    return res.json({
      conversaId,
      mensagens
    });

  } catch (erro) {
    return next(erro);
  }
});


// Usuário envia uma mensagem
router.post('/mensagens', autenticar, async (req, res, next) => {
  try {

    const usuarioId = req.usuarioId;

    const mensagem =
      typeof req.body.mensagem === 'string'
        ? req.body.mensagem.trim()
        : '';

    // Impede mensagens vazias
    if (!mensagem) {
      return res.status(400).json({
        mensagem: 'Digite uma mensagem.'
      });
    }

    // Limite simples para impedir mensagens gigantes
    if (mensagem.length > 2000) {
      return res.status(400).json({
        mensagem: 'A mensagem deve possuir no máximo 2000 caracteres.'
      });
    }

    // Procura conversa aberta
    const [conversas] = await pool.execute(
      `
      SELECT id
      FROM conversas
      WHERE usuario_id = ?
        AND status = 'aberta'
      ORDER BY criado_em DESC
      LIMIT 1
      `,
      [usuarioId]
    );

    let conversaId;

    // Se ainda não existir conversa, cria automaticamente
    if (conversas.length === 0) {

      const [resultadoConversa] = await pool.execute(
        `
        INSERT INTO conversas
        (usuario_id)
        VALUES (?)
        `,
        [usuarioId]
      );

      conversaId = resultadoConversa.insertId;

    } else {

      conversaId = conversas[0].id;

    }

    // Salva a mensagem
    const [resultadoMensagem] = await pool.execute(
      `
      INSERT INTO mensagens
      (
        conversa_id,
        remetente_id,
        mensagem
      )
      VALUES (?, ?, ?)
      `,
      [
        conversaId,
        usuarioId,
        mensagem
      ]
    );

    // Atualiza a data da conversa
    await pool.execute(
      `
      UPDATE conversas
      SET atualizado_em = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [conversaId]
    );

    return res.status(201).json({
      mensagem: 'Mensagem enviada com sucesso.',
      id: resultadoMensagem.insertId,
      conversaId
    });

  } catch (erro) {
    return next(erro);
  }
});


// =========================================================
// ADMINISTRADORES
// =========================================================


// Admin lista todas as conversas
router.get(
  '/admin/conversas',
  autenticar,
  verificarAdmin,
  async (req, res, next) => {

    try {

      const [conversas] = await pool.execute(
        `
        SELECT
          c.id,
          c.usuario_id,
          c.status,
          c.criado_em,
          c.atualizado_em,

          u.nome AS usuario_nome,
          u.email AS usuario_email,

          (
            SELECT COUNT(*)
            FROM mensagens m
            WHERE m.conversa_id = c.id
              AND m.lida = FALSE
              AND m.remetente_id = c.usuario_id
          ) AS mensagens_nao_lidas,

          (
            SELECT m2.mensagem
            FROM mensagens m2
            WHERE m2.conversa_id = c.id
            ORDER BY m2.criado_em DESC, m2.id DESC
            LIMIT 1
          ) AS ultima_mensagem

        FROM conversas c

        INNER JOIN usuarios u
          ON u.id = c.usuario_id

        ORDER BY
          c.status = 'aberta' DESC,
          c.atualizado_em DESC
        `
      );

      return res.json({
        conversas
      });

    } catch (erro) {
      return next(erro);
    }
  }
);


// Admin busca as mensagens de uma conversa específica
router.get(
  '/admin/conversas/:id/mensagens',
  autenticar,
  verificarAdmin,
  async (req, res, next) => {

    try {

      const conversaId = Number(req.params.id);

      if (!Number.isInteger(conversaId) || conversaId <= 0) {
        return res.status(400).json({
          mensagem: 'Conversa inválida.'
        });
      }

      // Confere se a conversa existe
      const [conversas] = await pool.execute(
        `
        SELECT
          c.id,
          c.usuario_id,
          c.status,
          c.criado_em,
          c.atualizado_em,
          u.nome AS usuario_nome,
          u.email AS usuario_email

        FROM conversas c

        INNER JOIN usuarios u
          ON u.id = c.usuario_id

        WHERE c.id = ?

        LIMIT 1
        `,
        [conversaId]
      );

      if (conversas.length === 0) {
        return res.status(404).json({
          mensagem: 'Conversa não encontrada.'
        });
      }

      const [mensagens] = await pool.execute(
        `
        SELECT
          m.id,
          m.conversa_id,
          m.remetente_id,
          m.mensagem,
          m.lida,
          m.criado_em,

          u.nome AS remetente_nome,
          u.perfil AS remetente_perfil

        FROM mensagens m

        INNER JOIN usuarios u
          ON u.id = m.remetente_id

        WHERE m.conversa_id = ?

        ORDER BY m.criado_em ASC, m.id ASC
        `,
        [conversaId]
      );

      // Marca como lidas as mensagens enviadas pelo usuário
      await pool.execute(
        `
        UPDATE mensagens
        SET lida = TRUE

        WHERE conversa_id = ?
          AND remetente_id = ?
        `,
        [
          conversaId,
          conversas[0].usuario_id
        ]
      );

      return res.json({
        conversa: conversas[0],
        mensagens
      });

    } catch (erro) {
      return next(erro);
    }
  }
);


// Admin responde uma conversa
router.post(
  '/admin/conversas/:id/mensagens',
  autenticar,
  verificarAdmin,
  async (req, res, next) => {

    try {

      const adminId = req.usuarioId;
      const conversaId = Number(req.params.id);

      const mensagem =
        typeof req.body.mensagem === 'string'
          ? req.body.mensagem.trim()
          : '';

      if (!Number.isInteger(conversaId) || conversaId <= 0) {
        return res.status(400).json({
          mensagem: 'Conversa inválida.'
        });
      }

      if (!mensagem) {
        return res.status(400).json({
          mensagem: 'Digite uma mensagem.'
        });
      }

      if (mensagem.length > 2000) {
        return res.status(400).json({
          mensagem: 'A mensagem deve possuir no máximo 2000 caracteres.'
        });
      }

      // Confere se a conversa existe
      const [conversas] = await pool.execute(
        `
        SELECT
          id,
          status
        FROM conversas
        WHERE id = ?
        LIMIT 1
        `,
        [conversaId]
      );

      if (conversas.length === 0) {
        return res.status(404).json({
          mensagem: 'Conversa não encontrada.'
        });
      }

      if (conversas[0].status === 'fechada') {
        return res.status(400).json({
          mensagem: 'Esta conversa está fechada.'
        });
      }

      // Salva a resposta do administrador
      const [resultado] = await pool.execute(
        `
        INSERT INTO mensagens
        (
          conversa_id,
          remetente_id,
          mensagem
        )
        VALUES (?, ?, ?)
        `,
        [
          conversaId,
          adminId,
          mensagem
        ]
      );

      await pool.execute(
        `
        UPDATE conversas
        SET atualizado_em = CURRENT_TIMESTAMP
        WHERE id = ?
        `,
        [conversaId]
      );

      return res.status(201).json({
        mensagem: 'Mensagem enviada com sucesso.',
        id: resultado.insertId
      });

    } catch (erro) {
      return next(erro);
    }
  }
);


// Admin fecha uma conversa
router.put(
  '/admin/conversas/:id/fechar',
  autenticar,
  verificarAdmin,
  async (req, res, next) => {

    try {

      const conversaId = Number(req.params.id);

      if (!Number.isInteger(conversaId) || conversaId <= 0) {
        return res.status(400).json({
          mensagem: 'Conversa inválida.'
        });
      }

      const [resultado] = await pool.execute(
        `
        UPDATE conversas
        SET status = 'fechada'
        WHERE id = ?
        `,
        [conversaId]
      );

      if (resultado.affectedRows === 0) {
        return res.status(404).json({
          mensagem: 'Conversa não encontrada.'
        });
      }

      return res.json({
        mensagem: 'Conversa fechada com sucesso.'
      });

    } catch (erro) {
      return next(erro);
    }
  }
);


module.exports = router;