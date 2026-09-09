const express = require("express");

const pool = require("../config/database");

const autenticar = require("../middleware/auth");
const verificarAdmin = require("../middleware/admin");

const router = express.Router();


// Todas as rotas abaixo exigem:
// 1. usuário logado
// 2. usuário administrador

router.use(autenticar);
router.use(verificarAdmin);


// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function limparTexto(valor) {
    return typeof valor === "string"
        ? valor.trim()
        : "";
}


function tratarMateriais(materiais) {

    if (Array.isArray(materiais)) {

        return materiais
            .map(material => limparTexto(material))
            .filter(Boolean);

    }

    if (typeof materiais === "string") {

        return materiais
            .split(",")
            .map(material => material.trim())
            .filter(Boolean);

    }

    return [];
}


function materiaisParaArray(materiais) {

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
// VERIFICAR ACESSO ADMIN
// ============================================

router.get("/", (req, res) => {

    return res.json({
        mensagem: "Acesso autorizado à área administrativa."
    });

});


// ============================================
// LISTAR TODOS OS ECOPONTOS
// ============================================

router.get("/ecopontos", async (req, res, next) => {

    try {

        const [ecopontos] = await pool.execute(`
            SELECT *
            FROM ecopontos
            ORDER BY criado_em DESC
        `);

        const resultado = ecopontos.map(ecoponto => ({
            ...ecoponto,

            avaliacao: Number(ecoponto.avaliacao),

            materiais: materiaisParaArray(
                ecoponto.materiais
            ),

            ativo: Boolean(ecoponto.ativo)
        }));

        return res.json({
            ecopontos: resultado
        });

    } catch (erro) {

        return next(erro);

    }

});


// ============================================
// CADASTRAR ECOPONTO
// ============================================

router.post("/ecopontos", async (req, res, next) => {

    try {

        const nome = limparTexto(req.body.nome);
        const endereco = limparTexto(req.body.endereco);
        const cidade = limparTexto(req.body.cidade);

        const materiais =
            tratarMateriais(req.body.materiais);

        const horario =
            limparTexto(req.body.horario_funcionamento);

        const linkMaps =
            limparTexto(req.body.link_maps);

        const imagemUrl =
            limparTexto(req.body.imagem_url);

        let avaliacao =
            Number(req.body.avaliacao || 0);

        const ativo =
            req.body.ativo !== false;


        if (!nome) {

            return res.status(400).json({
                mensagem: "Informe o nome do ecoponto."
            });

        }


        if (!endereco) {

            return res.status(400).json({
                mensagem: "Informe o endereço."
            });

        }


        if (!cidade) {

            return res.status(400).json({
                mensagem: "Informe a cidade."
            });

        }


        if (materiais.length === 0) {

            return res.status(400).json({
                mensagem:
                    "Informe pelo menos um material aceito."
            });

        }


        if (
            Number.isNaN(avaliacao) ||
            avaliacao < 0 ||
            avaliacao > 5
        ) {

            return res.status(400).json({
                mensagem:
                    "A avaliação deve estar entre 0 e 5."
            });

        }


        const [resultado] = await pool.execute(
            `
            INSERT INTO ecopontos
            (
                nome,
                endereco,
                cidade,
                materiais,
                avaliacao,
                horario_funcionamento,
                link_maps,
                imagem_url,
                ativo
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                nome,
                endereco,
                cidade,
                JSON.stringify(materiais),
                avaliacao,
                horario || null,
                linkMaps || null,
                imagemUrl || null,
                ativo
            ]
        );


        return res.status(201).json({

            mensagem:
                "Ecoponto cadastrado com sucesso!",

            id: resultado.insertId

        });

    } catch (erro) {

        return next(erro);

    }

});


// ============================================
// EDITAR ECOPONTO
// ============================================

router.put("/ecopontos/:id", async (req, res, next) => {

    try {

        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {

            return res.status(400).json({
                mensagem: "Ecoponto inválido."
            });

        }


        const nome =
            limparTexto(req.body.nome);

        const endereco =
            limparTexto(req.body.endereco);

        const cidade =
            limparTexto(req.body.cidade);

        const materiais =
            tratarMateriais(req.body.materiais);

        const horario =
            limparTexto(req.body.horario_funcionamento);

        const linkMaps =
            limparTexto(req.body.link_maps);

        const imagemUrl =
            limparTexto(req.body.imagem_url);

        const avaliacao =
            Number(req.body.avaliacao || 0);

        const ativo =
            req.body.ativo !== false;


        if (!nome || !endereco || !cidade) {

            return res.status(400).json({
                mensagem:
                    "Preencha nome, endereço e cidade."
            });

        }


        if (materiais.length === 0) {

            return res.status(400).json({
                mensagem:
                    "Informe pelo menos um material."
            });

        }


        if (
            Number.isNaN(avaliacao) ||
            avaliacao < 0 ||
            avaliacao > 5
        ) {

            return res.status(400).json({
                mensagem:
                    "A avaliação deve estar entre 0 e 5."
            });

        }


        const [resultado] = await pool.execute(
            `
            UPDATE ecopontos

            SET
                nome = ?,
                endereco = ?,
                cidade = ?,
                materiais = ?,
                avaliacao = ?,
                horario_funcionamento = ?,
                link_maps = ?,
                imagem_url = ?,
                ativo = ?

            WHERE id = ?
            `,
            [
                nome,
                endereco,
                cidade,
                JSON.stringify(materiais),
                avaliacao,
                horario || null,
                linkMaps || null,
                imagemUrl || null,
                ativo,
                id
            ]
        );


        if (resultado.affectedRows === 0) {

            return res.status(404).json({
                mensagem:
                    "Ecoponto não encontrado."
            });

        }


        return res.json({
            mensagem:
                "Ecoponto atualizado com sucesso!"
        });

    } catch (erro) {

        return next(erro);

    }

});


// ============================================
// EXCLUIR ECOPONTO
// ============================================

router.delete(
    "/ecopontos/:id",
    async (req, res, next) => {

        try {

            const id = Number(req.params.id);


            if (!Number.isInteger(id) || id <= 0) {

                return res.status(400).json({
                    mensagem:
                        "Ecoponto inválido."
                });

            }


            const [resultado] =
                await pool.execute(
                    `
                    DELETE FROM ecopontos
                    WHERE id = ?
                    `,
                    [id]
                );


            if (resultado.affectedRows === 0) {

                return res.status(404).json({
                    mensagem:
                        "Ecoponto não encontrado."
                });

            }


            return res.json({
                mensagem:
                    "Ecoponto removido com sucesso!"
            });


        } catch (erro) {

            return next(erro);

        }

    }
);


module.exports = router;