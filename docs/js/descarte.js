const listaPontos = document.getElementById("lista-pontos");
const contador = document.getElementById("contador-pontos");
const campoBusca = document.getElementById("campoBusca");
const btnBuscar = document.getElementById("btnBuscar");
const filtroTodos = document.getElementById("filtro-todos");
const filtroAbertos = document.getElementById("filtro-abertos");

let ecopontos = [];
let filtroAtual = "todos";

async function carregarEcopontos() {
    try {
        const resposta = await fetch("/api/ecopontos");

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar os ecopontos.");
        }

        const dados = await resposta.json();
        ecopontos = dados.ecopontos || [];

        const parametros = new URLSearchParams(window.location.search);
        const buscaInicial = parametros.get("busca");

        if (buscaInicial) {
            campoBusca.value = buscaInicial;
        }

        aplicarFiltros();
    } catch (erro) {
        console.error(erro);
        contador.textContent = "Não foi possível carregar os ecopontos.";
        listaPontos.innerHTML = `
            <p>Ocorreu um erro ao carregar os pontos de descarte.</p>
        `;
    }
}

function escaparHTML(valor) {
    const div = document.createElement("div");
    div.textContent = valor ?? "";
    return div.innerHTML;
}

function normalizarTexto(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function horarioEmMinutos(hora, minuto = "0") {
    return Number(hora) * 60 + Number(minuto || 0);
}

function estaAbertoAgora(ecoponto) {
    const horarioOriginal = ecoponto.horario_funcionamento;

    if (!horarioOriginal) {
        return false;
    }

    const horario = normalizarTexto(horarioOriginal);
    const agora = new Date();
    const dia = agora.getDay();
    const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

    if (horario.includes("24 horas") || horario.includes("24h")) {
        return true;
    }

    if (horario.includes("fechado")) {
        return false;
    }

    const intervalos = [...horario.matchAll(/(\d{1,2})(?::(\d{2}))?h?\s*(?:as|a|ate|-)\s*(\d{1,2})(?::(\d{2}))?h/g)];

    if (intervalos.length === 0) {
        return false;
    }

    let intervalo;

    if (horario.includes("segunda a sabado") && (horario.includes("domingo") || horario.includes("feriado"))) {
        intervalo = dia === 0 && intervalos.length > 1 ? intervalos[1] : intervalos[0];
    } else if (horario.includes("segunda a sexta") && horario.includes("sabado")) {
        if (dia === 0) return false;
        intervalo = dia === 6 && intervalos.length > 1 ? intervalos[1] : intervalos[0];
    } else if (horario.includes("segunda a sexta") && (dia === 0 || dia === 6)) {
        return false;
    } else if (horario.includes("segunda a sabado") && dia === 0) {
        return false;
    } else {
        intervalo = intervalos[0];
    }

    const inicio = horarioEmMinutos(intervalo[1], intervalo[2]);
    const fim = horarioEmMinutos(intervalo[3], intervalo[4]);

    if (fim >= inicio) {
        return minutosAgora >= inicio && minutosAgora < fim;
    }

    return minutosAgora >= inicio || minutosAgora < fim;
}

function renderizarEcopontos(lista) {
    listaPontos.innerHTML = "";
    contador.textContent = `${lista.length} ${lista.length === 1 ? "ponto encontrado" : "pontos encontrados"}`;

    if (lista.length === 0) {
        listaPontos.innerHTML = `
            <div class="admin-empty">
                <span>♻️</span>
                <h3>Nenhum ecoponto encontrado</h3>
                <p>Tente pesquisar por outro material ou local.</p>
            </div>
        `;
        return;
    }

    lista.forEach(ecoponto => {
        const card = document.createElement("article");
        card.className = "ponto-card";

        const materiais = Array.isArray(ecoponto.materiais) ? ecoponto.materiais : [];
        const tags = materiais
            .map(material => `<span>${escaparHTML(material)}</span>`)
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
                    🕒 ${escaparHTML(ecoponto.horario_funcionamento)}
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
                <h2>${escaparHTML(ecoponto.nome)}</h2>
                <span class="avaliacao">★ ${Number(ecoponto.avaliacao).toFixed(1)}</span>
            </div>
            <p class="endereco">
                ${escaparHTML(ecoponto.endereco)} — ${escaparHTML(ecoponto.cidade)}
            </p>
            ${horario}
            <div class="tags">${tags}</div>
            <div class="acoes">${botaoEndereco}</div>
        `;

        listaPontos.appendChild(card);
    });
}

function correspondeBusca(ecoponto, termo) {
    if (!termo) return true;

    const nome = normalizarTexto(ecoponto.nome);
    const cidade = normalizarTexto(ecoponto.cidade);
    const endereco = normalizarTexto(ecoponto.endereco);
    const materiais = Array.isArray(ecoponto.materiais)
        ? normalizarTexto(ecoponto.materiais.join(" "))
        : "";

    return (
        nome.includes(termo) ||
        cidade.includes(termo) ||
        endereco.includes(termo) ||
        materiais.includes(termo)
    );
}

function aplicarFiltros() {
    const termo = normalizarTexto(campoBusca.value.trim());

    const resultado = ecopontos.filter(ecoponto => {
        const atendeBusca = correspondeBusca(ecoponto, termo);
        const atendeFiltro = filtroAtual !== "abertos" || estaAbertoAgora(ecoponto);
        return atendeBusca && atendeFiltro;
    });

    renderizarEcopontos(resultado);
}

function selecionarFiltro(filtro) {
    filtroAtual = filtro;
    filtroTodos.classList.toggle("ativo", filtro === "todos");
    filtroAbertos.classList.toggle("ativo", filtro === "abertos");
    aplicarFiltros();
}

btnBuscar.addEventListener("click", aplicarFiltros);

campoBusca.addEventListener("keydown", evento => {
    if (evento.key === "Enter") {
        aplicarFiltros();
    }
});

campoBusca.addEventListener("input", () => {
    if (campoBusca.value.trim() === "") {
        aplicarFiltros();
    }
});

filtroTodos.addEventListener("click", () => selecionarFiltro("todos"));
filtroAbertos.addEventListener("click", () => selecionarFiltro("abertos"));

carregarEcopontos();
