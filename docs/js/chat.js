const token = localStorage.getItem("ecomaps_token");

const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatLoading = document.getElementById("chat-loading");
const chatAlert = document.getElementById("chat-alert");
const contadorCaracteres = document.getElementById("contador-caracteres");
const chatSendButton = document.getElementById("chat-send-button");


// =========================================================
// VERIFICA LOGIN
// =========================================================

if (!token) {
    window.location.href = "login.html";
}


// =========================================================
// MOSTRA ALERTA
// =========================================================

function mostrarAlerta(mensagem, tipo = "erro") {

    chatAlert.textContent = mensagem;
    chatAlert.style.display = "block";

    chatAlert.classList.remove("erro", "sucesso");
    chatAlert.classList.add(tipo);

    setTimeout(() => {
        chatAlert.style.display = "none";
    }, 4000);
}


// =========================================================
// FORMATA DATA/HORA
// =========================================================

function formatarHora(data) {

    const dataMensagem = new Date(data);

    return dataMensagem.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
    });
}


// =========================================================
// CRIA ELEMENTO DE MENSAGEM
// =========================================================

function criarMensagem(mensagem) {

    const divMensagem = document.createElement("div");

    const perfil = mensagem.remetente_perfil;

    if (perfil === "admin") {
        divMensagem.className = "mensagem mensagem-admin";
    } else {
        divMensagem.className = "mensagem mensagem-usuario";
    }


    const conteudo = document.createElement("div");

    conteudo.className = "mensagem-conteudo";

    // textContent evita que alguém envie HTML malicioso
    conteudo.textContent = mensagem.mensagem;


    const hora = document.createElement("span");

    hora.className = "mensagem-hora";

    hora.textContent = formatarHora(mensagem.criado_em);


    divMensagem.appendChild(conteudo);
    divMensagem.appendChild(hora);

    return divMensagem;
}


// =========================================================
// CARREGA MENSAGENS
// =========================================================

async function carregarMensagens() {

    try {

        const urlMensagens = new URL(
    "/api/chat/mensagens",
    window.location.origin
);

const resposta = await fetch(
    urlMensagens.href,
    {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
);

        // Token inválido ou expirado
        if (resposta.status === 401 || resposta.status === 403) {

            localStorage.removeItem("ecomaps_token");

            window.location.href = "login.html";

            return;
        }


        if (!resposta.ok) {

            throw new Error("Erro ao carregar mensagens.");

        }


        const dados = await resposta.json();


        chatMessages.innerHTML = "";


        if (!dados.mensagens || dados.mensagens.length === 0) {

            const vazio = document.createElement("div");

            vazio.className = "chat-vazio";

            vazio.innerHTML = `
                <p>Nenhuma mensagem ainda.</p>
                <span>
                    Envie uma mensagem para iniciar a conversa
                    com a equipe EcoMaps.
                </span>
            `;

            chatMessages.appendChild(vazio);

            return;
        }


        dados.mensagens.forEach((mensagem) => {

            const elemento = criarMensagem(mensagem);

            chatMessages.appendChild(elemento);

        });


        // Vai automaticamente para a última mensagem
        chatMessages.scrollTop = chatMessages.scrollHeight;


    } catch (erro) {

        console.error("Erro ao carregar chat:", erro);

        if (chatLoading) {
            chatLoading.textContent =
                "Não foi possível carregar a conversa.";
        }

    }
}


// =========================================================
// ENVIA MENSAGEM
// =========================================================

async function enviarMensagem(evento) {

    evento.preventDefault();


    const mensagem = chatInput.value.trim();


    if (!mensagem) {

        mostrarAlerta(
            "Digite uma mensagem antes de enviar."
        );

        return;
    }


    if (mensagem.length > 2000) {

        mostrarAlerta(
            "A mensagem deve possuir no máximo 2000 caracteres."
        );

        return;
    }


    try {

        chatSendButton.disabled = true;

        chatSendButton.textContent = "Enviando...";


        const urlEnviarMensagem = new URL(
    "/api/chat/mensagens",
    window.location.origin
);

const resposta = await fetch(
    urlEnviarMensagem.href,
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            mensagem
        })
    }
);


        if (resposta.status === 401 || resposta.status === 403) {

            localStorage.removeItem("ecomaps_token");

            window.location.href = "login.html";

            return;
        }


        const dados = await resposta.json();


        if (!resposta.ok) {

            mostrarAlerta(
                dados.mensagem ||
                "Não foi possível enviar a mensagem."
            );

            return;
        }


        chatInput.value = "";

        atualizarContador();


        // Recarrega imediatamente depois do envio
        await carregarMensagens();


        // Mantém o cursor no campo
        chatInput.focus();


    } catch (erro) {

        console.error("Erro ao enviar mensagem:", erro);

        mostrarAlerta(
            "Não foi possível enviar a mensagem."
        );


    } finally {

        chatSendButton.disabled = false;

        chatSendButton.innerHTML = `
            Enviar
            <span>➤</span>
        `;

    }
}


// =========================================================
// CONTADOR DE CARACTERES
// =========================================================

function atualizarContador() {

    if (!contadorCaracteres) {
        return;
    }

    contadorCaracteres.textContent =
        `${chatInput.value.length} / 2000`;
}


chatInput.addEventListener(
    "input",
    atualizarContador
);


// =========================================================
// ENTER PARA ENVIAR
// =========================================================

chatInput.addEventListener(
    "keydown",
    function (evento) {

        // Enter envia
        // Shift + Enter quebra a linha

        if (
            evento.key === "Enter" &&
            !evento.shiftKey
        ) {

            evento.preventDefault();

            chatForm.requestSubmit();

        }

    }
);


// =========================================================
// ENVIO DO FORMULÁRIO
// =========================================================

chatForm.addEventListener(
    "submit",
    enviarMensagem
);


// =========================================================
// INICIALIZA CHAT
// =========================================================

async function iniciarChat() {

    try {

        // Garante que exista uma conversa
        const urlConversa = new URL(
    "/api/chat/conversa",
    window.location.origin
);

const resposta = await fetch(
    urlConversa.href,
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
);


        if (resposta.status === 401 || resposta.status === 403) {

            localStorage.removeItem("ecomaps_token");

            window.location.href = "login.html";

            return;
        }


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível iniciar a conversa."
            );

        }


        await carregarMensagens();


    } catch (erro) {

        console.error(
            "Erro ao iniciar chat:",
            erro
        );

        mostrarAlerta(
            "Não foi possível conectar ao chat."
        );

    }

}


// Inicia ao abrir a página
iniciarChat();


// =========================================================
// ATUALIZAÇÃO AUTOMÁTICA
// =========================================================

// Verifica mensagens novas a cada 3 segundos

setInterval(
    carregarMensagens,
    3000
);