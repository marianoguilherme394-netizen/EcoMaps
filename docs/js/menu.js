const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

function abrirMenu(){
    sidebar.classList.add("active");
    overlay.classList.add("active");
}

function fecharMenu(){
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
}

async function verificarAdministrador() {
    const linkAdmin = document.getElementById("link-admin");
    const linkAdminMobile = document.getElementById("link-admin-mobile");

    const token = localStorage.getItem("ecomaps_token");

    if (linkAdmin) {
        linkAdmin.style.display = "none";
    }

    if (linkAdminMobile) {
        linkAdminMobile.style.display = "none";
    }

    if (!token) {
        return;
    }

    try {
        const resposta = await fetch("/api/usuarios/me", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!resposta.ok) {
            return;
        }

        const dados = await resposta.json();

        console.log("Usuário:", dados.usuario);

        if (dados.usuario && dados.usuario.perfil === "admin") {

            if (linkAdmin) {
                linkAdmin.style.display = "flex";
            }

            if (linkAdminMobile) {
                linkAdminMobile.style.display = "flex";
            }
        }

    } catch (erro) {
        console.error("Erro ao verificar administrador:", erro);
    }
}

verificarAdministrador();