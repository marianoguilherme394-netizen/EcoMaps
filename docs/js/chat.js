const token = localStorage.getItem("ecomaps_token");

if (!token) {
    window.location.href = "login.html";
}

const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatSendButton = document.getElementById("chat-send-button");
const contadorCaracteres = document.getElementById("contador-caracteres");
const chatAlert = document.getElementById("chat-alert");
const statusChat = document.getElementById("status-chat");

let idsMensagensRenderizadas = new Set();
let carregamentoInicialConcluido = false;
let atualizandoMensagens = false;


function criarUrl(caminho) {
    return new URL(caminho, window.location.origin).href;
}


function mostrarAlerta(mensagem, tipo = "erro") {

    chatAlert.textContent = mensagem;
    chatAlert.className = `chat-alert ${tipo}`;
    chatAlert.style.display = "block";

    setTimeout(() => {
        chatAlert.style.display = "none";
    }, 4000);
}


async function requisicao(caminho, opcoes = {}) {

    const headers = {
        ...(opcoes.headers || {}),
        Authorization: `Bearer ${token}`
    };

    if (opcoes.body) {
        headers["Content-Type"] = "application/json";
    }

    const resposta = await fetch(
        criarUrl(caminho),
        {
            ...opcoes,
            headers
        }
    );

    let dados = {};

    try {
        dados = await resposta.json();
    } catch {
        dados = {};
    }

    if (resposta.status === 401) {

        localStorage.removeItem("ecomaps_token");

        window.location.href = "login.html";

        throw new Error(
            dados.mensagem ||
            "Sua sessão expirou."
        );
    }

    if (!resposta.ok) {

        throw new Error(
            dados.mensagem ||
            "Não foi possível concluir a operação."
        );
    }

    return dados;
}


function formatarHora(data) {

    if (!data) {
        return "";
    }

    const horario = new Date(data);

    if (Number.isNaN(horario.getTime())) {
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


function criarElementoMensagem(mensagem) {

    const elemento = document.createElement("div");

    const ehUsuario =
        mensagem.remetente_tipo === "usuario" ||
        mensagem.tipo_remetente === "usuario" ||
        mensagem.eh_admin === false ||
        mensagem.admin === false;

    elemento.className = ehUsuario
        ? "mensagem mensagem-usuario"
        : "mensagem mensagem-admin";

    elemento.dataset.mensagemId = mensagem.id;


    const conteudo =
        document.createElement("div");

    conteudo.className =
        "mensagem-conteudo";

    /*
        Usamos textContent em vez de innerHTML
        para não interpretar HTML enviado pelo usuário.
    */
    conteudo.textContent =
        mensagem.mensagem || "";


    const hora =
        document.createElement("span");

    hora.className =
        "mensagem-hora";

    hora.textContent =
        formatarHora(
            mensagem.criado_em
        );


    elemento.appendChild(conteudo);
    elemento.appendChild(hora);

    return elemento;
}


function rolarParaFinal() {

    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


function usuarioEstaPertoDoFinal() {

    const distanciaDoFinal =
        chatMessages.scrollHeight -
        chatMessages.scrollTop -
        chatMessages.clientHeight;

    return distanciaDoFinal < 120;
}


function renderizarMensagens(mensagens) {

    if (!Array.isArray(mensagens)) {
        mensagens = [];
    }


    /*
        PRIMEIRO CARREGAMENTO
        ---------------------
        Só limpamos a área uma vez.
    */

    if (!carregamentoInicialConcluido) {

        chatMessages.innerHTML = "";

        if (mensagens.length === 0) {

            const vazio =
                document.createElement("div");

            vazio.className =
                "chat-loading";

            vazio.id =
                "chat-sem-mensagens";

            vazio.textContent =
                "Nenhuma mensagem ainda.";

            chatMessages.appendChild(vazio);

            carregamentoInicialConcluido = true;

            return;
        }


        mensagens.forEach((mensagem) => {

            if (
                mensagem.id != null &&
                idsMensagensRenderizadas.has(
                    Number(mensagem.id)
                )
            ) {
                return;
            }

            chatMessages.appendChild(
                criarElementoMensagem(mensagem)
            );

            if (mensagem.id != null) {

                idsMensagensRenderizadas.add(
                    Number(mensagem.id)
                );
            }
        });


        carregamentoInicialConcluido = true;

        rolarParaFinal();

        return;
    }


    /*
        ATUALIZAÇÕES SEGUINTES
        ----------------------
        Não apagamos o chat.
        Só inserimos mensagens que ainda não existem.
    */

    const estavaPertoDoFinal =
        usuarioEstaPertoDoFinal();

    let adicionouMensagem = false;


    mensagens.forEach((mensagem) => {

        const id =
            Number(mensagem.id);

        if (
            mensagem.id != null &&
            idsMensagensRenderizadas.has(id)
        ) {
            return;
        }


        const avisoSemMensagens =
            document.getElementById(
                "chat-sem-mensagens"
            );

        if (avisoSemMensagens) {
            avisoSemMensagens.remove();
        }


        chatMessages.appendChild(
            criarElementoMensagem(mensagem)
        );


        if (mensagem.id != null) {

            idsMensagensRenderizadas.add(
                id
            );
        }


        adicionouMensagem = true;
    });


    /*
        Só move o scroll se realmente chegou
        mensagem nova e o usuário já estava
        perto do final da conversa.
    */

    if (
        adicionouMensagem &&
        estavaPertoDoFinal
    ) {
        rolarParaFinal();
    }
}


async function carregarMensagens() {

    /*
        Evita duas atualizações simultâneas.
    */

    if (atualizandoMensagens) {
        return;
    }

    atualizandoMensagens = true;


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


        if (
            !carregamentoInicialConcluido
        ) {

            chatMessages.innerHTML = "";

            const erroElemento =
                document.createElement("div");

            erroElemento.className =
                "chat-loading";

            erroElemento.textContent =
                erro.message;

            chatMessages.appendChild(
                erroElemento
            );
        }

    } finally {

        atualizandoMensagens = false;
    }
}


async function enviarMensagem(evento) {

    evento.preventDefault();


    const mensagem =
        chatInput.value.trim();


    if (!mensagem) {
        return;
    }


    if (mensagem.length > 2000) {

        mostrarAlerta(
            "A mensagem pode ter no máximo 2000 caracteres."
        );

        return;
    }


    chatSendButton.disabled = true;
    chatInput.disabled = true;


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


        chatInput.value = "";

        contadorCaracteres.textContent =
            "0 / 2000";


        /*
            Após enviar, buscamos novamente.
            Como os IDs antigos já estão salvos,
            apenas a mensagem nova será adicionada.
        */

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

        chatSendButton.disabled = false;
        chatInput.disabled = false;
    }
}


function atualizarContador() {

    const quantidade =
        chatInput.value.length;

    contadorCaracteres.textContent =
        `${quantidade} / 2000`;
}


function ajustarAlturaTextarea() {

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

        ajustarAlturaTextarea();
    }
);


chatForm.addEventListener(
    "submit",
    enviarMensagem
);


/*
    Enter envia.
    Shift + Enter quebra linha.
*/

chatInput.addEventListener(
    "keydown",
    (evento) => {

        if (
            evento.key === "Enter" &&
            !evento.shiftKey
        ) {

            evento.preventDefault();

            chatForm.requestSubmit();
        }
    }
);


/*
    Primeiro carregamento
*/

carregarMensagens();


/*
    Atualiza a conversa a cada 3 segundos.

    A diferença agora é que essa atualização
    NÃO apaga nem recria as mensagens antigas.
*/

const intervaloChat =
    setInterval(
        carregarMensagens,
        3000
    );


/*
    Se o usuário sair da página,
    paramos o intervalo.
*/

window.addEventListener(
    "beforeunload",
    () => {

        clearInterval(
            intervaloChat
        );
    }
);