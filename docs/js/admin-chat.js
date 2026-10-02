const token =
    localStorage.getItem(
        "ecomaps_token"
    );


if (!token) {

    window.location.href =
        "login.html";
}


const listaConversas =
    document.getElementById(
        "admin-chat-conversas"
    );

const contadorConversas =
    document.getElementById(
        "contador-conversas"
    );

const campoBusca =
    document.getElementById(
        "busca-conversa"
    );

const btnAtualizar =
    document.getElementById(
        "btn-atualizar-conversas"
    );

const areaSemConversa =
    document.getElementById(
        "admin-chat-sem-conversa"
    );

const areaConversa =
    document.getElementById(
        "admin-chat-conversa"
    );

const nomeUsuario =
    document.getElementById(
        "admin-chat-usuario-nome"
    );

const emailUsuario =
    document.getElementById(
        "admin-chat-usuario-email"
    );

const statusConversa =
    document.getElementById(
        "admin-chat-status"
    );

const mensagensContainer =
    document.getElementById(
        "admin-chat-mensagens"
    );

const formResposta =
    document.getElementById(
        "admin-chat-form"
    );

const inputResposta =
    document.getElementById(
        "admin-chat-input"
    );

const btnEnviar =
    document.getElementById(
        "admin-chat-enviar"
    );

const btnFechar =
    document.getElementById(
        "btn-fechar-conversa"
    );

const contadorCaracteres =
    document.getElementById(
        "admin-chat-contador"
    );

const alerta =
    document.getElementById(
        "admin-chat-alert"
    );


let adminId =
    null;

let conversaSelecionada =
    null;

let conversas =
    [];

let mensagensRenderizadas =
    new Set();

let carregandoMensagens =
    false;


function criarUrl(
    caminho
) {

    return new URL(
        caminho,
        window.location.origin
    ).href;
}


async function requisicao(
    caminho,
    opcoes = {}
) {

    const headers = {
        ...(opcoes.headers || {}),
        Authorization: `Bearer ${token}`
    };


    if (opcoes.body) {

        headers["Content-Type"] =
            "application/json";
    }


    const resposta =
        await fetch(
            criarUrl(caminho),
            {
                ...opcoes,
                headers
            }
        );


    let dados = {};

    try {

        dados =
            await resposta.json();

    } catch {

        dados = {};
    }


    if (resposta.status === 401) {

        localStorage.removeItem(
            "ecomaps_token"
        );

        window.location.href =
            "login.html";

        throw new Error(
            "Sessão expirada."
        );
    }


    if (
        resposta.status === 403
    ) {

        window.location.href =
            "index.html";

        throw new Error(
            "Acesso permitido somente para administradores."
        );
    }


    if (!resposta.ok) {

        throw new Error(
            dados.mensagem ||
            "Erro ao realizar operação."
        );
    }


    return dados;
}


function mostrarAlerta(
    mensagem,
    tipo = "erro"
) {

    if (!alerta) {
        return;
    }


    alerta.textContent =
        mensagem;

    alerta.className =
        `chat-alert ${tipo}`;

    alerta.style.display =
        "block";


    setTimeout(
        () => {

            alerta.style.display =
                "none";
        },
        4000
    );
}


function formatarHora(
    data
) {

    if (!data) {
        return "";
    }


    const horario =
        new Date(data);


    if (
        Number.isNaN(
            horario.getTime()
        )
    ) {

        return "";
    }


    return horario.toLocaleTimeString(
        "pt-BR",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


async function carregarAdmin() {

    const dados =
        await requisicao(
            "/api/usuarios/me"
        );


    if (
        dados.usuario.perfil !==
        "admin"
    ) {

        window.location.href =
            "index.html";

        return;
    }


    adminId =
        Number(
            dados.usuario.id
        );
}


function criarElementoMensagem(
    mensagem
) {

    const remetenteId =
        Number(
            mensagem.remetente_id
        );


    /*
        Na tela do administrador:

        mensagem enviada pelo ADM
        = verde

        mensagem enviada pelo usuário
        = branca
    */

    const minhaMensagem =
        remetenteId === adminId;


    const elemento =
        document.createElement(
            "div"
        );


    /*
        Reutilizamos as mesmas classes visuais.

        Verde = mensagem-usuario
        Branco = mensagem-admin
    */

    elemento.className =
        minhaMensagem
            ? "mensagem mensagem-usuario"
            : "mensagem mensagem-admin";


    elemento.dataset.mensagemId =
        mensagem.id;


    const conteudo =
        document.createElement(
            "div"
        );


    conteudo.className =
        "mensagem-conteudo";


    conteudo.textContent =
        mensagem.mensagem || "";


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
        conteudo
    );


    elemento.appendChild(
        hora
    );


    return elemento;
}


function rolarParaFinal() {

    mensagensContainer.scrollTop =
        mensagensContainer.scrollHeight;
}


function pertoDoFinal() {

    const distancia =
        mensagensContainer.scrollHeight -
        mensagensContainer.scrollTop -
        mensagensContainer.clientHeight;


    return distancia < 120;
}


async function carregarConversas() {

    try {

        const dados =
            await requisicao(
                "/api/chat/admin/conversas"
            );


        conversas =
            Array.isArray(dados)
                ? dados
                : dados.conversas || [];


        renderizarConversas(
            conversas
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar conversas:",
            erro
        );


        listaConversas.innerHTML =
            `
                <div class="admin-chat-loading">
                    ${erro.message}
                </div>
            `;
    }
}


function renderizarConversas(
    lista
) {

    listaConversas.innerHTML =
        "";


    const busca =
        campoBusca.value
            .trim()
            .toLowerCase();


    const filtradas =
        lista.filter(
            conversa => {

                const nome =
                    String(
                        conversa.usuario_nome ||
                        conversa.nome ||
                        ""
                    ).toLowerCase();


                const email =
                    String(
                        conversa.usuario_email ||
                        conversa.email ||
                        ""
                    ).toLowerCase();


                return (
                    nome.includes(busca) ||
                    email.includes(busca)
                );
            }
        );


    contadorConversas.textContent =
        `${filtradas.length} ${
            filtradas.length === 1
                ? "conversa"
                : "conversas"
        }`;


    if (
        filtradas.length === 0
    ) {

        listaConversas.innerHTML =
            `
                <div class="admin-chat-loading">
                    Nenhuma conversa encontrada.
                </div>
            `;

        return;
    }


    filtradas.forEach(
        conversa => {

            const item =
                document.createElement(
                    "button"
                );


            item.type =
                "button";


            item.className =
                "admin-chat-conversa-item";


            if (
                conversaSelecionada &&
                Number(
                    conversaSelecionada.id
                ) ===
                Number(
                    conversa.id
                )
            ) {

                item.classList.add(
                    "ativo"
                );
            }


            const nome =
                conversa.usuario_nome ||
                conversa.nome ||
                "Usuário";


            const email =
                conversa.usuario_email ||
                conversa.email ||
                "";


            item.innerHTML =
                `
                    <strong></strong>
                    <span></span>
                `;


            item.querySelector(
                "strong"
            ).textContent =
                nome;


            item.querySelector(
                "span"
            ).textContent =
                email;


            item.addEventListener(
                "click",
                () => {

                    selecionarConversa(
                        conversa
                    );
                }
            );


            listaConversas.appendChild(
                item
            );
        }
    );
}


async function selecionarConversa(
    conversa
) {

    conversaSelecionada =
        conversa;


    mensagensRenderizadas =
        new Set();


    mensagensContainer.innerHTML =
        "";


    areaSemConversa.style.display =
        "none";


    areaConversa.style.display =
        "flex";


    nomeUsuario.textContent =
        conversa.usuario_nome ||
        conversa.nome ||
        "Usuário";


    emailUsuario.textContent =
        conversa.usuario_email ||
        conversa.email ||
        "";


    statusConversa.textContent =
        conversa.status === "fechada"
            ? "Fechada"
            : "Aberta";


    const fechada =
        conversa.status ===
        "fechada";


    inputResposta.disabled =
        fechada;


    btnEnviar.disabled =
        fechada;


    btnFechar.disabled =
        fechada;


    btnFechar.textContent =
        fechada
            ? "Conversa fechada"
            : "Fechar conversa";


    renderizarConversas(
        conversas
    );


    await carregarMensagensConversa(
        true
    );
}


async function carregarMensagensConversa(
    primeiroCarregamento = false
) {

    if (
        !conversaSelecionada ||
        carregandoMensagens
    ) {

        return;
    }


    carregandoMensagens =
        true;


    try {

        const id =
            Number(
                conversaSelecionada.id
            );


        const dados =
            await requisicao(
                `/api/chat/admin/conversas/${id}/mensagens`
            );


        const mensagens =
            Array.isArray(dados)
                ? dados
                : dados.mensagens || [];


        const estavaNoFinal =
            pertoDoFinal();


        if (primeiroCarregamento) {

            mensagensContainer.innerHTML =
                "";

            mensagensRenderizadas =
                new Set();
        }


        mensagens.forEach(
            mensagem => {

                const mensagemId =
                    Number(
                        mensagem.id
                    );


                if (
                    mensagensRenderizadas.has(
                        mensagemId
                    )
                ) {

                    return;
                }


                mensagensContainer.appendChild(
                    criarElementoMensagem(
                        mensagem
                    )
                );


                mensagensRenderizadas.add(
                    mensagemId
                );
            }
        );


        if (
            primeiroCarregamento ||
            estavaNoFinal
        ) {

            rolarParaFinal();
        }

    } catch (erro) {

        console.error(
            "Erro ao carregar mensagens:",
            erro
        );

    } finally {

        carregandoMensagens =
            false;
    }
}


async function enviarResposta(
    evento
) {

    evento.preventDefault();


    if (!conversaSelecionada) {
        return;
    }


    const mensagem =
        inputResposta.value.trim();


    if (!mensagem) {
        return;
    }


    btnEnviar.disabled =
        true;


    inputResposta.disabled =
        true;


    try {

        const id =
            Number(
                conversaSelecionada.id
            );


        await requisicao(
            `/api/chat/admin/conversas/${id}/mensagens`,
            {
                method: "POST",

                body: JSON.stringify({
                    mensagem
                })
            }
        );


        inputResposta.value =
            "";


        inputResposta.style.height =
            "auto";


        contadorCaracteres.textContent =
            "0 / 2000";


        await carregarMensagensConversa();


        rolarParaFinal();


        inputResposta.focus();

    } catch (erro) {

        mostrarAlerta(
            erro.message
        );

    } finally {

        if (
            conversaSelecionada.status !==
            "fechada"
        ) {

            btnEnviar.disabled =
                false;

            inputResposta.disabled =
                false;
        }
    }
}


async function fecharConversa() {

    if (!conversaSelecionada) {
        return;
    }


    try {

        const id =
            Number(
                conversaSelecionada.id
            );


        await requisicao(
            `/api/chat/admin/conversas/${id}/fechar`,
            {
                method: "PUT"
            }
        );


        conversaSelecionada.status =
            "fechada";


        statusConversa.textContent =
            "Fechada";


        inputResposta.disabled =
            true;


        btnEnviar.disabled =
            true;


        btnFechar.disabled =
            true;


        btnFechar.textContent =
            "Conversa fechada";


        await carregarConversas();


        mostrarAlerta(
            "Conversa fechada com sucesso.",
            "sucesso"
        );

    } catch (erro) {

        mostrarAlerta(
            erro.message
        );
    }
}


campoBusca.addEventListener(
    "input",
    () => {

        renderizarConversas(
            conversas
        );
    }
);


btnAtualizar.addEventListener(
    "click",
    carregarConversas
);


formResposta.addEventListener(
    "submit",
    enviarResposta
);


btnFechar.addEventListener(
    "click",
    fecharConversa
);


inputResposta.addEventListener(
    "input",
    () => {

        contadorCaracteres.textContent =
            `${inputResposta.value.length} / 2000`;


        inputResposta.style.height =
            "auto";


        inputResposta.style.height =
            `${Math.min(
                inputResposta.scrollHeight,
                140
            )}px`;
    }
);


inputResposta.addEventListener(
    "keydown",
    evento => {

        if (
            evento.key === "Enter" &&
            !evento.shiftKey
        ) {

            evento.preventDefault();

            formResposta.requestSubmit();
        }
    }
);


async function iniciarAdminChat() {

    try {

        await carregarAdmin();

        await carregarConversas();

    } catch (erro) {

        console.error(
            "Erro ao iniciar chat ADM:",
            erro
        );
    }
}


iniciarAdminChat();


const intervaloAdmin =
    setInterval(
        async () => {

            await carregarConversas();


            if (
                conversaSelecionada
            ) {

                await carregarMensagensConversa();
            }
        },
        3000
    );


window.addEventListener(
    "beforeunload",
    () => {

        clearInterval(
            intervaloAdmin
        );
    }
);