const express = require("express");
const pool = require("../config/database");

const router = express.Router();

function tratarMateriais(materiais) {
    if (Array.isArray(materiais)) {
        return materiais;
    }

    try {
        return JSON.parse(materiais || "[]");
    } catch {
        return [];
    }
}


// ============================================
// LISTAR ECOPONTOS PARA OS USUÁRIOS
// ============================================

router.get("/", async (req, res, next) => {

    try {

        const [ecopontos] = await pool.execute(`
            SELECT
                id,
                nome,
                endereco,
                cidade,
                materiais,
                avaliacao,
                horario_funcionamento,
                link_maps,
                imagem_url
            FROM ecopontos
            WHERE ativo = TRUE
            ORDER BY nome ASC
        `);

        const resultado = ecopontos.map(ecoponto => ({
            ...ecoponto,

            avaliacao: Number(ecoponto.avaliacao),

            materiais: tratarMateriais(
                ecoponto.materiais
            )
        }));

        return res.json({
            ecopontos: resultado
        });

    } catch (erro) {

        return next(erro);

    }

});


module.exports = router;