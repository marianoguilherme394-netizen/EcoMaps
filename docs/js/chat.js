const token = localStorage.getItem("ecomaps_token");

if (!token) {
    window.location.href = "login.html";
}

const chatMessages =
    document.getElementById("chat-messages");

const chatForm =
    document.getElementById("chat-form");

const chatInput =
    document.getElementById("chat-input");

const chatSendButton =
    document.getElementById("chat-send-button");

const contadorCaracteres =
    document.getElementById("contador-caracteres");

const chatAlert =
    document.getElementById("chat-alert");

const statusChat =
    document.getElementById("status-chat");


let usuarioLogadoId = null;

let mensagensRenderizadas =
    new Set();

let carregamentoInicial =
    true;

let carregandoMensagens =
    false;


function criarUrl(caminho) {

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

    if (!chatAlert) {
        return;
    }


    chatAlert.textContent =
        mensagem;

    chatAlert.className =
        `chat-alert ${tipo}`;

    chatAlert.style.display =
        "block";


    setTimeout(
        () => {

            chatAlert.style.display =
                "none";
        },
        4000
    );
}


function formatarHora(data) {

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


async function carregarUsuarioLogado() {

    const dados =
        await requisicao(
            "/api/usuarios/me"
        );


    usuarioLogadoId =
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
        Na tela do usuário:

        mensagem enviada pelo próprio usuário
        = verde

        mensagem enviada pelo ADM
        = branca
    */

    const minhaMensagem =
        remetenteId === usuarioLogadoId;


    const elemento =
        document.createElement(
            "div"
        );


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


function estaPertoDoFinal() {

    const distancia =
        chatMessages.scrollHeight -
        chatMessages.scrollTop -
        chatMessages.clientHeight;


    return distancia < 120;
}


function rolarParaFinal() {

    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


function renderizarMensagens(
    mensagens
) {

    if (
        !Array.isArray(
            mensagens
        )
    ) {

        mensagens = [];
    }


    /*
        Primeiro carregamento:
        limpa somente uma vez.
    */

    if (carregamentoInicial) {

        chatMessages.innerHTML =
            "";


        if (
            mensagens.length === 0
        ) {

            const vazio =
                document.createElement(
                    "div"
                );


            vazio.id =
                "chat-sem-mensagens";

            vazio.className =
                "chat-loading";

            vazio.textContent =
                "Nenhuma mensagem ainda.";


            chatMessages.appendChild(
                vazio
            );


            carregamentoInicial =
                false;

            return;
        }


        mensagens.forEach(
            mensagem => {

                const id =
                    Number(
                        mensagem.id
                    );


                chatMessages.appendChild(
                    criarElementoMensagem(
                        mensagem
                    )
                );


                mensagensRenderizadas.add(
                    id
                );
            }
        );


        carregamentoInicial =
            false;


        rolarParaFinal();

        return;
    }


    /*
        Depois do primeiro carregamento,
        adiciona apenas mensagens novas.
    */

    const estavaNoFinal =
        estaPertoDoFinal();


    let adicionouNovaMensagem =
        false;


    mensagens.forEach(
        mensagem => {

            const id =
                Number(
                    mensagem.id
                );


            if (
                mensagensRenderizadas.has(
                    id
                )
            ) {

                return;
            }


            const aviso =
                document.getElementById(
                    "chat-sem-mensagens"
                );


            if (aviso) {

                aviso.remove();
            }


            chatMessages.appendChild(
                criarElementoMensagem(
                    mensagem
                )
            );


            mensagensRenderizadas.add(
                id
            );


            adicionouNovaMensagem =
                true;
        }
    );


    if (
        adicionouNovaMensagem &&
        estavaNoFinal
    ) {

        rolarParaFinal();
    }
}


async function carregarMensagens() {

    if (carregandoMensagens) {
        return;
    }


    carregandoMensagens =
        true;


    try {

        const dados =
            await requisicao(
                "/api/chat/mensagens"
            );


        const mensagens =
            Array.isArray(dados)
                ? dados
                : dados.mensagens || [];


        renderizarMensagens(
            mensagens
        );


        if (statusChat) {

            statusChat.textContent =
                "Atendimento";
        }

    } catch (erro) {

        console.error(
            "Erro ao carregar mensagens:",
            erro
        );


        if (carregamentoInicial) {

            chatMessages.innerHTML =
                "";


            const erroElemento =
                document.createElement(
                    "div"
                );


            erroElemento.className =
                "chat-loading";


            erroElemento.textContent =
                erro.message;


            chatMessages.appendChild(
                erroElemento
            );
        }

    } finally {

        carregandoMensagens =
            false;
    }
}


async function enviarMensagem(
    evento
) {

    evento.preventDefault();


    const mensagem =
        chatInput.value.trim();


    if (!mensagem) {
        return;
    }


    if (
        mensagem.length > 2000
    ) {

        mostrarAlerta(
            "A mensagem pode ter no máximo 2000 caracteres."
        );

        return;
    }


    chatSendButton.disabled =
        true;

    chatInput.disabled =
        true;


    try {

        await requisicao(
            "/api/chat/mensagens",
            {
                method: "POST",

                body: JSON.stringify({
                    mensagem
                })
            }
        );


        chatInput.value =
            "";


        contadorCaracteres.textContent =
            "0 / 2000";


        chatInput.style.height =
            "auto";


        await carregarMensagens();


        rolarParaFinal();


        chatInput.focus();

    } catch (erro) {

        console.error(
            "Erro ao enviar mensagem:",
            erro
        );


        mostrarAlerta(
            erro.message
        );

    } finally {

        chatSendButton.disabled =
            false;

        chatInput.disabled =
            false;
    }
}


function atualizarContador() {

    contadorCaracteres.textContent =
        `${chatInput.value.length} / 2000`;
}


function ajustarTextarea() {

    chatInput.style.height =
        "auto";


    chatInput.style.height =
        `${Math.min(
            chatInput.scrollHeight,
            140
        )}px`;
}


chatInput.addEventListener(
    "input",
    () => {

        atualizarContador();

        ajustarTextarea();
    }
);


chatInput.addEventListener(
    "keydown",
    evento => {

        if (
            evento.key === "Enter" &&
            !evento.shiftKey
        ) {

            evento.preventDefault();

            chatForm.requestSubmit();
        }
    }
);


chatForm.addEventListener(
    "submit",
    enviarMensagem
);


async function iniciarChat() {

    try {

        await carregarUsuarioLogado();

        await carregarMensagens();

    } catch (erro) {

        console.error(
            "Erro ao iniciar chat:",
            erro
        );
    }
}


iniciarChat();


const intervaloChat =
    setInterval(
        carregarMensagens,
        3000
    );


window.addEventListener(
    "beforeunload",
    () => {

        clearInterval(
            intervaloChat
        );
    }
);