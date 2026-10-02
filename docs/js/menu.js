// =========================================================
// ELEMENTOS DO MENU MOBILE
// =========================================================

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");


// =========================================================
// ABRIR MENU MOBILE
// =========================================================

function abrirMenu() {

    if (sidebar) {
        sidebar.classList.add("active");
    }

    if (overlay) {
        overlay.classList.add("active");
    }

}


// =========================================================
// FECHAR MENU MOBILE
// =========================================================

function fecharMenu() {

    if (sidebar) {
        sidebar.classList.remove("active");
    }

    if (overlay) {
        overlay.classList.remove("active");
    }

}


// =========================================================
// VERIFICA ACESSOS DO USUÁRIO
// =========================================================

async function verificarAcessos() {

    const token = localStorage.getItem("ecomaps_token");


    // =====================================================
    // LINKS DA ÁREA ADMINISTRATIVA
    // =====================================================

    const linkAdmin =
        document.getElementById("link-admin");

    const linkAdminMobile =
        document.getElementById("link-admin-mobile");


    // =====================================================
    // LINKS DO CHAT NORMAL
    // =====================================================

    const linkChat =
        document.getElementById("link-chat");

    const linkChatMobile =
        document.getElementById("link-chat-mobile");


    // =====================================================
    // LINKS DO CHAT ADMINISTRATIVO
    // =====================================================

    const linkAdminChat =
        document.getElementById("link-admin-chat");

    const linkAdminChatMobile =
        document.getElementById("link-admin-chat-mobile");


    // =====================================================
    // ESCONDE LINKS RESTRITOS INICIALMENTE
    // =====================================================

    if (linkAdmin) {
        linkAdmin.style.display = "none";
    }

    if (linkAdminMobile) {
        linkAdminMobile.style.display = "none";
    }

    if (linkChat) {
        linkChat.style.display = "none";
    }

    if (linkChatMobile) {
        linkChatMobile.style.display = "none";
    }

    if (linkAdminChat) {
        linkAdminChat.style.display = "none";
    }

    if (linkAdminChatMobile) {
        linkAdminChatMobile.style.display = "none";
    }


    // =====================================================
    // USUÁRIO NÃO ESTÁ LOGADO
    // =====================================================

    if (!token) {
        return;
    }


    // =====================================================
    // BUSCA OS DADOS DO USUÁRIO LOGADO
    // =====================================================

    try {

        const urlUsuario = new URL(
    "/api/usuarios/me",
    window.location.origin
);

const resposta = await fetch(
    urlUsuario.href,
    {
        method: "GET",

        headers: {
            Authorization: `Bearer ${token}`
        }
    }
);


        // Token expirado ou inválido
        if (resposta.status === 401) {

            localStorage.removeItem("ecomaps_token");

            return;
        }


        if (!resposta.ok) {

            console.error(
                "Não foi possível verificar o usuário."
            );

            return;
        }


        const dados = await resposta.json();


        // A API do EcoMaps retorna:
        //
        // {
        //     usuario: {
        //         id,
        //         nome,
        //         email,
        //         perfil
        //     }
        // }

        if (!dados.usuario) {

            console.error(
                "Resposta da API de usuário inválida."
            );

            return;
        }


        const usuario = dados.usuario;


        // =================================================
        // TODO USUÁRIO LOGADO PODE VER O CHAT
        // =================================================

        if (linkChat) {
            linkChat.style.display = "flex";
        }

        if (linkChatMobile) {
            linkChatMobile.style.display = "flex";
        }


        // =================================================
        // SOMENTE ADMINISTRADORES
        // =================================================

        if (usuario.perfil === "admin") {


            // Área ADM normal

            if (linkAdmin) {
                linkAdmin.style.display = "flex";
            }

            if (linkAdminMobile) {
                linkAdminMobile.style.display = "flex";
            }


            // Chat ADM

            if (linkAdminChat) {
                linkAdminChat.style.display = "flex";
            }

            if (linkAdminChatMobile) {
                linkAdminChatMobile.style.display = "flex";
            }

        }


    } catch (erro) {

        console.error(
            "Erro ao verificar acessos do usuário:",
            erro
        );

    }

}


// =========================================================
// FECHA MENU AO CLICAR EM UM LINK MOBILE
// =========================================================

if (sidebar) {

    const linksSidebar =
        sidebar.querySelectorAll("a");

    linksSidebar.forEach((link) => {

        link.addEventListener(
            "click",
            fecharMenu
        );

    });

}


// =========================================================
// FECHA MENU COM A TECLA ESC
// =========================================================

document.addEventListener(
    "keydown",
    function (evento) {

        if (evento.key === "Escape") {
            fecharMenu();
        }

    }
);


// =========================================================
// INICIALIZA VERIFICAÇÃO DE ACESSO
// =========================================================

verificarAcessos();