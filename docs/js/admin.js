const modal =
    document.getElementById("modal-ecoponto");

const btnAdicionar =
    document.getElementById("btn-adicionar-ecoponto");

const btnFechar =
    document.getElementById("fechar-modal");

const btnCancelar =
    document.getElementById("cancelar-modal");

const formulario =
    document.getElementById("form-ecoponto");

const lista =
    document.getElementById("lista-ecopontos");

const mensagemVazia =
    document.getElementById("mensagem-sem-ecopontos");

const totalEcopontos =
    document.getElementById("total-ecopontos");

const tituloModal =
    document.getElementById("titulo-modal");


let ecopontos = [];


// ============================================
// TOKEN
// ============================================

function obterToken() {

    return localStorage.getItem(
        "ecomaps_token"
    );

}


// ============================================
// REQUISIÇÕES
// ============================================

async function requisicao(
    url,
    opcoes = {}
) {

    const token = obterToken();

    const headers = {
        ...(opcoes.headers || {})
    };


    if (token) {

        headers.Authorization =
            `Bearer ${token}`;

    }


    if (opcoes.body) {

        headers["Content-Type"] =
            "application/json";

    }


    const resposta =
        await fetch(url, {
            ...opcoes,
            headers
        });


    let dados = {};

    try {

        dados = await resposta.json();

    } catch {

        dados = {};

    }


    if (!resposta.ok) {

        throw new Error(
            dados.mensagem ||
            "Não foi possível concluir a operação."
        );

    }


    return dados;

}


// ============================================
// PROTEGER TELA ADMIN
// ============================================

async function protegerPagina() {

    const token = obterToken();


    if (!token) {

        window.location.href =
            "login.html";

        return false;

    }


    try {

        const dados =
            await requisicao(
                "/api/usuarios/me"
            );


        if (
            !dados.usuario ||
            dados.usuario.perfil !== "admin"
        ) {

            alert(
                "Você não possui permissão para acessar esta página."
            );

            window.location.href =
                "index.html";

            return false;

        }


        return true;


    } catch (erro) {

        window.location.href =
            "login.html";

        return false;

    }

}


// ============================================
// CARREGAR ECOPONTOS
// ============================================

async function carregarEcopontos() {

    try {

        const dados =
            await requisicao(
                "/api/admin/ecopontos"
            );


        ecopontos =
            dados.ecopontos || [];


        renderizarEcopontos();


    } catch (erro) {

        alert(erro.message);

    }

}


// ============================================
// RENDERIZAR
// ============================================

function renderizarEcopontos() {

    lista.innerHTML = "";


    totalEcopontos.textContent =
        ecopontos.length;


    if (ecopontos.length === 0) {

        mensagemVazia.style.display =
            "block";

        return;

    }


    mensagemVazia.style.display =
        "none";


    ecopontos.forEach(ecoponto => {

        const linha =
            document.createElement("tr");


        const materiais =
            Array.isArray(ecoponto.materiais)
                ? ecoponto.materiais.join(", ")
                : "";


        linha.innerHTML = `

            <td>
                <strong>
                    ${escaparHTML(ecoponto.nome)}
                </strong>
            </td>

            <td>
                ${escaparHTML(ecoponto.cidade)}
            </td>

            <td>
                ${escaparHTML(materiais)}
            </td>

            <td>
                ${escaparHTML(ecoponto.endereco)}
            </td>

            <td>

                <div class="admin-actions">

                    <button
                        class="btn-edit"
                        data-id="${ecoponto.id}"
                    >
                        Editar
                    </button>

                    <button
                        class="btn-delete"
                        data-id="${ecoponto.id}"
                    >
                        Remover
                    </button>

                </div>

            </td>

        `;


        lista.appendChild(linha);

    });


    document
        .querySelectorAll(".btn-edit")
        .forEach(botao => {

            botao.addEventListener(
                "click",
                () => editarEcoponto(
                    Number(botao.dataset.id)
                )
            );

        });


    document
        .querySelectorAll(".btn-delete")
        .forEach(botao => {

            botao.addEventListener(
                "click",
                () => removerEcoponto(
                    Number(botao.dataset.id)
                )
            );

        });

}


// ============================================
// EVITAR HTML MALICIOSO
// ============================================

function escaparHTML(valor) {

    const div =
        document.createElement("div");

    div.textContent =
        valor ?? "";

    return div.innerHTML;

}


// ============================================
// ABRIR MODAL
// ============================================

function abrirModalNovo() {

    formulario.reset();

    document
        .getElementById("ecoponto-id")
        .value = "";


    document
        .getElementById("ativo")
        .checked = true;


    document
        .getElementById("avaliacao")
        .value = "0";


    tituloModal.textContent =
        "Adicionar ecoponto";


    modal.classList.add("active");

}


// ============================================
// FECHAR MODAL
// ============================================

function fecharModal() {

    modal.classList.remove("active");

}


// ============================================
// EDITAR
// ============================================

function editarEcoponto(id) {

    const ecoponto =
        ecopontos.find(
            item => item.id === id
        );


    if (!ecoponto) {
        return;
    }


    document
        .getElementById("ecoponto-id")
        .value =
        ecoponto.id;


    document
        .getElementById("nome")
        .value =
        ecoponto.nome || "";


    document
        .getElementById("cidade")
        .value =
        ecoponto.cidade || "";


    document
        .getElementById("endereco")
        .value =
        ecoponto.endereco || "";


    document
        .getElementById("materiais")
        .value =
        Array.isArray(ecoponto.materiais)
            ? ecoponto.materiais.join(", ")
            : "";


    document
        .getElementById("avaliacao")
        .value =
        ecoponto.avaliacao ?? 0;


    document
        .getElementById("horario")
        .value =
        ecoponto.horario_funcionamento || "";


    document
        .getElementById("link-maps")
        .value =
        ecoponto.link_maps || "";


    document
        .getElementById("imagem")
        .value =
        ecoponto.imagem_url || "";


    document
        .getElementById("ativo")
        .checked =
        Boolean(ecoponto.ativo);


    tituloModal.textContent =
        "Editar ecoponto";


    modal.classList.add("active");

}


// ============================================
// SALVAR / EDITAR
// ============================================

formulario.addEventListener(
    "submit",
    async evento => {

        evento.preventDefault();


        const id =
            document
                .getElementById("ecoponto-id")
                .value;


        const materiais =
            document
                .getElementById("materiais")
                .value

                .split(",")

                .map(material =>
                    material.trim()
                )

                .filter(Boolean);


        const dados = {

            nome:
                document
                    .getElementById("nome")
                    .value,

            cidade:
                document
                    .getElementById("cidade")
                    .value,

            endereco:
                document
                    .getElementById("endereco")
                    .value,

            materiais,

            avaliacao:
                Number(
                    document
                        .getElementById("avaliacao")
                        .value
                ),

            horario_funcionamento:
                document
                    .getElementById("horario")
                    .value,

            link_maps:
                document
                    .getElementById("link-maps")
                    .value,

            imagem_url:
                document
                    .getElementById("imagem")
                    .value,

            ativo:
                document
                    .getElementById("ativo")
                    .checked

        };


        try {

            if (id) {

                await requisicao(
                    `/api/admin/ecopontos/${id}`,
                    {
                        method: "PUT",

                        body:
                            JSON.stringify(dados)
                    }
                );


                alert(
                    "Ecoponto atualizado com sucesso!"
                );


            } else {


                await requisicao(
                    "/api/admin/ecopontos",
                    {
                        method: "POST",

                        body:
                            JSON.stringify(dados)
                    }
                );


                alert(
                    "Ecoponto cadastrado com sucesso!"
                );

            }


            fecharModal();

            await carregarEcopontos();


        } catch (erro) {

            alert(erro.message);

        }

    }
);


// ============================================
// REMOVER
// ============================================

async function removerEcoponto(id) {

    const ecoponto =
        ecopontos.find(
            item => item.id === id
        );


    if (!ecoponto) {
        return;
    }


    const confirmar =
        window.confirm(
            `Deseja realmente remover "${ecoponto.nome}"?`
        );


    if (!confirmar) {
        return;
    }


    try {

        await requisicao(
            `/api/admin/ecopontos/${id}`,
            {
                method: "DELETE"
            }
        );


        alert(
            "Ecoponto removido com sucesso!"
        );


        await carregarEcopontos();


    } catch (erro) {

        alert(erro.message);

    }

}


// ============================================
// EVENTOS DO MODAL
// ============================================

btnAdicionar.addEventListener(
    "click",
    abrirModalNovo
);


btnFechar.addEventListener(
    "click",
    fecharModal
);


btnCancelar.addEventListener(
    "click",
    fecharModal
);


modal.addEventListener(
    "click",
    evento => {

        if (evento.target === modal) {

            fecharModal();

        }

    }
);


// ============================================
// INICIAR
// ============================================

async function iniciarAdmin() {

    const autorizado =
        await protegerPagina();


    if (!autorizado) {
        return;
    }


    await carregarEcopontos();

}


iniciarAdmin();