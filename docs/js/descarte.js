const listaPontos =
    document.getElementById("lista-pontos");

const contador =
    document.getElementById("contador-pontos");

const campoBusca =
    document.getElementById("campoBusca");

const btnBuscar =
    document.getElementById("btnBuscar");


let ecopontos = [];


// ============================================
// CARREGAR ECOPONTOS
// ============================================

async function carregarEcopontos() {

    try {

        const resposta =
            await fetch("/api/ecopontos");


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível carregar os ecopontos."
            );

        }


        const dados =
            await resposta.json();


        ecopontos =
            dados.ecopontos || [];


        renderizarEcopontos(
            ecopontos
        );


    } catch (erro) {

        console.error(erro);


        contador.textContent =
            "Não foi possível carregar os ecopontos.";


        listaPontos.innerHTML = `
            <p>
                Ocorreu um erro ao carregar os pontos de descarte.
            </p>
        `;

    }

}


// ============================================
// SEGURANÇA HTML
// ============================================

function escaparHTML(valor) {

    const div =
        document.createElement("div");

    div.textContent =
        valor ?? "";

    return div.innerHTML;

}


// ============================================
// RENDERIZAR
// ============================================

function renderizarEcopontos(lista) {

    listaPontos.innerHTML = "";


    contador.textContent =
        `${lista.length} ${
            lista.length === 1
                ? "ponto encontrado"
                : "pontos encontrados"
        }`;


    if (lista.length === 0) {

        listaPontos.innerHTML = `

            <div class="admin-empty">

                <span>♻️</span>

                <h3>
                    Nenhum ecoponto encontrado
                </h3>

                <p>
                    Tente pesquisar por outro material ou local.
                </p>

            </div>

        `;

        return;

    }


    lista.forEach(ecoponto => {

        const card =
            document.createElement("article");


        card.className =
            "ponto-card";


        const materiais =
            Array.isArray(ecoponto.materiais)
                ? ecoponto.materiais
                : [];


        const tags =
            materiais
                .map(material => `
                    <span>
                        ${escaparHTML(material)}
                    </span>
                `)
                .join("");


        let imagem = "";


        if (ecoponto.imagem_url) {

            imagem = `

                <img
                    class="ponto-imagem"
                    src="${escaparHTML(ecoponto.imagem_url)}"
                    alt="${escaparHTML(ecoponto.nome)}"
                    loading="lazy"
                >

            `;

        }


        let horario = "";


        if (ecoponto.horario_funcionamento) {

            horario = `

                <p class="ponto-horario">
                    🕒
                    ${escaparHTML(
                        ecoponto.horario_funcionamento
                    )}
                </p>

            `;

        }


        let botaoEndereco = "";


        if (ecoponto.link_maps) {

            botaoEndereco = `

                <a
                    class="btn-principal"
                    href="${escaparHTML(ecoponto.link_maps)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Como chegar
                </a>

            `;

        }


        card.innerHTML = `

            ${imagem}

            <div class="ponto-topo">

                <h2>
                    ${escaparHTML(ecoponto.nome)}
                </h2>

                <span class="avaliacao">
                    ★ ${Number(ecoponto.avaliacao).toFixed(1)}
                </span>

            </div>


            <p class="endereco">

                ${escaparHTML(ecoponto.endereco)}

                —

                ${escaparHTML(ecoponto.cidade)}

            </p>


            ${horario}


            <div class="tags">

                ${tags}

            </div>


            <div class="acoes">

                ${botaoEndereco}

            </div>

        `;


        listaPontos.appendChild(card);

    });

}


// ============================================
// PESQUISAR
// ============================================

function pesquisar() {

    const termo =
        campoBusca
            .value
            .trim()
            .toLowerCase();


    if (!termo) {

        renderizarEcopontos(
            ecopontos
        );

        return;

    }


    const resultado =
        ecopontos.filter(ecoponto => {

            const nome =
                String(
                    ecoponto.nome || ""
                ).toLowerCase();


            const cidade =
                String(
                    ecoponto.cidade || ""
                ).toLowerCase();


            const endereco =
                String(
                    ecoponto.endereco || ""
                ).toLowerCase();


            const materiais =
                Array.isArray(ecoponto.materiais)
                    ? ecoponto.materiais
                        .join(" ")
                        .toLowerCase()

                    : "";


            return (
                nome.includes(termo) ||
                cidade.includes(termo) ||
                endereco.includes(termo) ||
                materiais.includes(termo)
            );

        });


    renderizarEcopontos(
        resultado
    );

}


// ============================================
// EVENTOS
// ============================================

btnBuscar.addEventListener(
    "click",
    pesquisar
);


campoBusca.addEventListener(
    "keydown",
    evento => {

        if (evento.key === "Enter") {

            pesquisar();

        }

    }
);


campoBusca.addEventListener(
    "input",
    () => {

        if (
            campoBusca.value.trim() === ""
        ) {

            renderizarEcopontos(
                ecopontos
            );

        }

    }
);


// ============================================
// INICIAR
// ============================================

carregarEcopontos();