const token =
    localStorage.getItem(
        "ecomaps_token"
    );


const listaConversas =
    document.getElementById(
        "admin-chat-conversas"
    );

const areaSemConversa =
    document.getElementById(
        "admin-chat-sem-conversa"
    );

const areaConversa =
    document.getElementById(
        "admin-chat-conversa"
    );

const mensagensContainer =
    document.getElementById(
        "admin-chat-mensagens"
    );

const usuarioNome =
    document.getElementById(
        "admin-chat-usuario-nome"
    );

const usuarioEmail =
    document.getElementById(
        "admin-chat-usuario-email"
    );

const statusConversa =
    document.getElementById(
        "admin-chat-status"
    );

const formulario =
    document.getElementById(
        "admin-chat-form"
    );

const inputMensagem =
    document.getElementById(
        "admin-chat-input"
    );

const botaoEnviar =
    document.getElementById(
        "admin-chat-enviar"
    );

const botaoFechar =
    document.getElementById(
        "btn-fechar-conversa"
    );

const botaoAtualizar =
    document.getElementById(
        "btn-atualizar-conversas"
    );

const campoBusca =
    document.getElementById(
        "busca-conversa"
    );

const contadorConversas =
    document.getElementById(
        "contador-conversas"
    );

const contadorCaracteres =
    document.getElementById(
        "admin-chat-contador"
    );

const alerta =
    document.getElementById(
        "admin-chat-alert"
    );


let conversaSelecionadaId = null;
let conversasCarregadas = [];


// =========================================================
// VERIFICA LOGIN
// =========================================================

if (!token) {

    window.location.href =
        "login.html";

}


// =========================================================
// MONTA URL ABSOLUTA
// =========================================================

function criarUrl(caminho) {

    return new URL(
        caminho,
        window.location.origin
    ).href;

}


// =========================================================
// ALERTA
// =========================================================

function mostrarAlerta(
    mensagem,
    tipo = "erro"
) {

    alerta.textContent =
        mensagem;

    alerta.style.display =
        "block";

    alerta.classList.remove(
        "erro",
        "sucesso"
    );

    alerta.classList.add(
        tipo
    );


    setTimeout(
        () => {

            alerta.style.display =
                "none";

        },
        4000
    );

}


// =========================================================
// FORMATA HORÁRIO
// =========================================================

function formatarHora(data) {

    const dataMensagem =
        new Date(data);

    return dataMensagem
        .toLocaleTimeString(
            "pt-BR",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

}


// =========================================================
// FORMATA DATA
// =========================================================

function formatarData(data) {

    const dataMensagem =
        new Date(data);

    return dataMensagem
        .toLocaleDateString(
            "pt-BR"
        );

}


// =========================================================
// TRATA NÃO AUTORIZADO
// =========================================================

function tratarNaoAutorizado(status) {

    if (status === 401) {

        localStorage.removeItem(
            "ecomaps_token"
        );

        window.location.href =
            "login.html";

        return true;

    }


    if (status === 403) {

        alert(
            "Você não possui permissão de administrador."
        );

        window.location.href =
            "index.html";

        return true;

    }


    return false;

}


// =========================================================
// CARREGA TODAS AS CONVERSAS
// =========================================================

async function carregarConversas() {

    try {

        const url =
            criarUrl(
                "/api/chat/admin/conversas"
            );


        const resposta =
            await fetch(
                url,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        if (
            tratarNaoAutorizado(
                resposta.status
            )
        ) {
            return;
        }


        if (!resposta.ok) {

            throw new Error(
                "Erro ao carregar conversas."
            );

        }


        const dados =
            await resposta.json();


        conversasCarregadas =
            dados.conversas || [];


        renderizarConversas(
            conversasCarregadas
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar conversas:",
            erro
        );


        listaConversas.innerHTML = `
            <div class="admin-chat-loading">
                Não foi possível carregar as conversas.
            </div>
        `;

    }

}


// =========================================================
// RENDERIZA LISTA DE CONVERSAS
// =========================================================

function renderizarConversas(
    conversas
) {

    listaConversas.innerHTML =
        "";


    contadorConversas.textContent =
        `${conversas.length} ${
            conversas.length === 1
                ? "conversa"
                : "conversas"
        }`;


    if (
        conversas.length === 0
    ) {

        listaConversas.innerHTML = `
            <div class="admin-chat-loading">
                Nenhuma conversa encontrada.
            </div>
        `;

        return;

    }


    conversas.forEach(
        (conversa) => {

            const item =
                document.createElement(
                    "button"
                );


            item.type =
                "button";

            item.className =
                "admin-chat-item";


            if (
                Number(conversa.id) ===
                Number(
                    conversaSelecionadaId
                )
            ) {

                item.classList.add(
                    "ativo"
                );

            }


            const naoLidas =
                Number(
                    conversa
                        .mensagens_nao_lidas
                ) || 0;


            item.innerHTML = `

                <div class="admin-chat-item-topo">

                    <strong>
                        ${escaparHTML(
                            conversa.usuario_nome
                        )}
                    </strong>

                    ${
                        naoLidas > 0
                            ? `
                                <span class="admin-chat-badge">
                                    ${naoLidas}
                                </span>
                              `
                            : ""
                    }

                </div>


                <div class="admin-chat-item-email">
                    ${escaparHTML(
                        conversa.usuario_email
                    )}
                </div>


                <div class="admin-chat-item-preview">

                    ${
                        conversa
                            .ultima_mensagem
                            ? escaparHTML(
                                conversa
                                    .ultima_mensagem
                            )
                            : "Nenhuma mensagem"
                    }

                </div>


                <div class="admin-chat-item-rodape">

                    <span>
                        ${formatarData(
                            conversa
                                .atualizado_em
                        )}
                    </span>

                    <span>
                        ${
                            conversa.status ===
                            "aberta"
                                ? "Aberta"
                                : "Fechada"
                        }
                    </span>

                </div>
            `;


            item.addEventListener(
                "click",
                () => {

                    abrirConversa(
                        conversa.id
                    );

                }
            );


            listaConversas
                .appendChild(
                    item
                );

        }
    );

}


// =========================================================
// EVITA HTML MALICIOSO
// =========================================================

function escaparHTML(valor) {

    const elemento =
        document.createElement(
            "div"
        );

    elemento.textContent =
        valor ?? "";

    return elemento.innerHTML;

}


// =========================================================
// ABRE UMA CONVERSA
// =========================================================

async function abrirConversa(
    conversaId
) {

    conversaSelecionadaId =
        conversaId;


    try {

        const url =
            criarUrl(
                `/api/chat/admin/conversas/${conversaId}/mensagens`
            );


        const resposta =
            await fetch(
                url,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        if (
            tratarNaoAutorizado(
                resposta.status
            )
        ) {
            return;
        }


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível abrir a conversa."
            );

        }


        const dados =
            await resposta.json();


        areaSemConversa.style.display =
            "none";

        areaConversa.style.display =
            "flex";


        usuarioNome.textContent =
            dados.conversa
                .usuario_nome;


        usuarioEmail.textContent =
            dados.conversa
                .usuario_email;


        atualizarStatus(
            dados.conversa.status
        );


        renderizarMensagens(
            dados.mensagens || []
        );


        await carregarConversas();


    } catch (erro) {

        console.error(
            "Erro ao abrir conversa:",
            erro
        );


        mostrarAlerta(
            "Não foi possível abrir a conversa."
        );

    }

}


// =========================================================
// RENDERIZA MENSAGENS
// =========================================================

function renderizarMensagens(
    mensagens
) {

    mensagensContainer.innerHTML =
        "";


    if (
        mensagens.length === 0
    ) {

        mensagensContainer.innerHTML = `
            <div class="chat-vazio">

                <p>
                    Nenhuma mensagem.
                </p>

                <span>
                    O usuário ainda não enviou mensagens.
                </span>

            </div>
        `;

        return;

    }


    mensagens.forEach(
        (mensagem) => {

            const elemento =
                document.createElement(
                    "div"
                );


            if (
                mensagem
                    .remetente_perfil ===
                "admin"
            ) {

                elemento.className =
                    "mensagem mensagem-usuario";

            } else {

                elemento.className =
                    "mensagem mensagem-admin";

            }


            const conteudo =
                document.createElement(
                    "div"
                );

            conteudo.className =
                "mensagem-conteudo";

            conteudo.textContent =
                mensagem.mensagem;


            const remetente =
                document.createElement(
                    "span"
                );

            remetente.className =
                "mensagem-remetente";

            remetente.textContent =
                mensagem
                    .remetente_perfil ===
                "admin"
                    ? "Administrador"
                    : mensagem
                        .remetente_nome;


            const hora =
                document.createElement(
                    "span"
                );

            hora.className =
                "mensagem-hora";

            hora.textContent =
                formatarHora(
                    mensagem.criado_em
                );


            elemento.appendChild(
                remetente
            );

            elemento.appendChild(
                conteudo
            );

            elemento.appendChild(
                hora
            );


            mensagensContainer
                .appendChild(
                    elemento
                );

        }
    );


    mensagensContainer.scrollTop =
        mensagensContainer
            .scrollHeight;

}


// =========================================================
// ENVIA RESPOSTA DO ADMIN
// =========================================================

async function enviarMensagem(
    evento
) {

    evento.preventDefault();


    if (
        !conversaSelecionadaId
    ) {

        mostrarAlerta(
            "Selecione uma conversa."
        );

        return;

    }


    const mensagem =
        inputMensagem
            .value
            .trim();


    if (!mensagem) {

        mostrarAlerta(
            "Digite uma mensagem antes de enviar."
        );

        return;

    }


    if (
        mensagem.length > 2000
    ) {

        mostrarAlerta(
            "A mensagem deve possuir no máximo 2000 caracteres."
        );

        return;

    }


    try {

        botaoEnviar.disabled =
            true;

        botaoEnviar.textContent =
            "Enviando...";


        const url =
            criarUrl(
                `/api/chat/admin/conversas/${conversaSelecionadaId}/mensagens`
            );


        const resposta =
            await fetch(
                url,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({
                            mensagem
                        })

                }
            );


        if (
            tratarNaoAutorizado(
                resposta.status
            )
        ) {
            return;
        }


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            mostrarAlerta(
                dados.mensagem ||
                "Não foi possível enviar a mensagem."
            );

            return;

        }


        inputMensagem.value =
            "";


        atualizarContador();


        await abrirConversa(
            conversaSelecionadaId
        );


    } catch (erro) {

        console.error(
            "Erro ao enviar mensagem:",
            erro
        );


        mostrarAlerta(
            "Não foi possível enviar a mensagem."
        );


    } finally {

        botaoEnviar.disabled =
            false;

        botaoEnviar.innerHTML = `
            Enviar
            <span>➤</span>
        `;

    }

}


// =========================================================
// FECHA CONVERSA
// =========================================================

async function fecharConversa() {

    if (
        !conversaSelecionadaId
    ) {
        return;
    }


    const confirmar =
        confirm(
            "Deseja realmente fechar esta conversa?"
        );


    if (!confirmar) {
        return;
    }


    try {

        const url =
            criarUrl(
                `/api/chat/admin/conversas/${conversaSelecionadaId}/fechar`
            );


        const resposta =
            await fetch(
                url,
                {
                    method: "PUT",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }

                }
            );


        if (
            tratarNaoAutorizado(
                resposta.status
            )
        ) {
            return;
        }


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            mostrarAlerta(
                dados.mensagem ||
                "Não foi possível fechar a conversa."
            );

            return;

        }


        mostrarAlerta(
            "Conversa fechada com sucesso.",
            "sucesso"
        );


        await abrirConversa(
            conversaSelecionadaId
        );


    } catch (erro) {

        console.error(
            "Erro ao fechar conversa:",
            erro
        );


        mostrarAlerta(
            "Não foi possível fechar a conversa."
        );

    }

}


// =========================================================
// STATUS DA CONVERSA
// =========================================================

function atualizarStatus(
    status
) {

    if (
        status === "aberta"
    ) {

        statusConversa.textContent =
            "Aberta";

        statusConversa.classList
            .remove(
                "fechada"
            );

        statusConversa.classList
            .add(
                "aberta"
            );


        inputMensagem.disabled =
            false;

        botaoEnviar.disabled =
            false;

        botaoFechar.disabled =
            false;

        botaoFechar.style.display =
            "inline-flex";


    } else {

        statusConversa.textContent =
            "Fechada";

        statusConversa.classList
            .remove(
                "aberta"
            );

        statusConversa.classList
            .add(
                "fechada"
            );


        inputMensagem.disabled =
            true;

        botaoEnviar.disabled =
            true;

        botaoFechar.disabled =
            true;

        botaoFechar.style.display =
            "none";

    }

}


// =========================================================
// BUSCA DE USUÁRIO
// =========================================================

function buscarConversas() {

    const busca =
        campoBusca
            .value
            .trim()
            .toLowerCase();


    if (!busca) {

        renderizarConversas(
            conversasCarregadas
        );

        return;

    }


    const filtradas =
        conversasCarregadas
            .filter(
                (conversa) => {

                    const nome =
                        conversa
                            .usuario_nome
                            ?.toLowerCase() ||
                        "";

                    const email =
                        conversa
                            .usuario_email
                            ?.toLowerCase() ||
                        "";


                    return (
                        nome.includes(
                            busca
                        ) ||
                        email.includes(
                            busca
                        )
                    );

                }
            );


    renderizarConversas(
        filtradas
    );

}


// =========================================================
// CONTADOR DE CARACTERES
// =========================================================

function atualizarContador() {

    contadorCaracteres.textContent =
        `${inputMensagem.value.length} / 2000`;

}


// =========================================================
// ENTER ENVIA
// =========================================================

inputMensagem.addEventListener(
    "keydown",
    function (evento) {

        if (
            evento.key === "Enter" &&
            !evento.shiftKey
        ) {

            evento.preventDefault();

            formulario
                .requestSubmit();

        }

    }
);


// =========================================================
// EVENTOS
// =========================================================

formulario.addEventListener(
    "submit",
    enviarMensagem
);


botaoFechar.addEventListener(
    "click",
    fecharConversa
);


botaoAtualizar.addEventListener(
    "click",
    carregarConversas
);


campoBusca.addEventListener(
    "input",
    buscarConversas
);


inputMensagem.addEventListener(
    "input",
    atualizarContador
);


// =========================================================
// ATUALIZAÇÃO AUTOMÁTICA
// =========================================================

setInterval(
    async () => {

        await carregarConversas();


        if (
            conversaSelecionadaId
        ) {

            await atualizarConversaSelecionada();

        }

    },
    3000
);


// =========================================================
// ATUALIZA CONVERSA SEM ALTERAR SELEÇÃO
// =========================================================

async function atualizarConversaSelecionada() {

    if (
        !conversaSelecionadaId
    ) {
        return;
    }


    try {

        const url =
            criarUrl(
                `/api/chat/admin/conversas/${conversaSelecionadaId}/mensagens`
            );


        const resposta =
            await fetch(
                url,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        if (
            tratarNaoAutorizado(
                resposta.status
            )
        ) {
            return;
        }


        if (!resposta.ok) {
            return;
        }


        const dados =
            await resposta.json();


        renderizarMensagens(
            dados.mensagens || []
        );


        atualizarStatus(
            dados.conversa.status
        );


    } catch (erro) {

        console.error(
            "Erro ao atualizar conversa:",
            erro
        );

    }

}


// =========================================================
// INICIALIZA
// =========================================================

carregarConversas();