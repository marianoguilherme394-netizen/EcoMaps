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

  if (!linkAdmin) {
    return;
  }

  const token = localStorage.getItem("ecomaps_token");

  if (!token) {
    linkAdmin.hidden = true;
    return;
  }

  try {
    const resposta = await fetch("/api/usuarios/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!resposta.ok) {
      linkAdmin.hidden = true;
      return;
    }

    const dados = await resposta.json();

    if (dados.usuario && dados.usuario.perfil === "admin") {
      linkAdmin.hidden = false;
    } else {
      linkAdmin.hidden = true;
    }
  } catch (erro) {
    console.error("Não foi possível verificar o perfil do usuário.", erro);
    linkAdmin.hidden = true;
  }
}

verificarAdministrador();