document.addEventListener('DOMContentLoaded', async () => {
  if (!obterToken()) {
    window.location.replace('login.html');
    return;
  }

  const formPerfil = document.getElementById('form-perfil');
  const formSenha = document.getElementById('form-senha');
  const mensagemPerfil = document.getElementById('mensagem-perfil');
  const mensagemSenha = document.getElementById('mensagem-senha');
  const nomeTitulo = document.getElementById('perfil-nome-titulo');

  async function carregarPerfil() {
    try {
      const dados = await apiFetch('/usuarios/me');
      nomeTitulo.textContent = dados.usuario.nome;
      document.getElementById('perfil-nome').value = dados.usuario.nome;
      document.getElementById('perfil-email').value = dados.usuario.email;
    } catch (erro) {
      if (erro.status === 401) {
        removerToken();
        window.location.replace('login.html');
        return;
      }
      exibirMensagem(mensagemPerfil, erro.message);
    }
  }

  formPerfil.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    ocultarMensagem(mensagemPerfil);

    const botao = formPerfil.querySelector('button[type="submit"]');
    botao.disabled = true;

    try {
      const dados = await apiFetch('/usuarios/me', {
        method: 'PUT',
        body: JSON.stringify({
          nome: document.getElementById('perfil-nome').value.trim(),
          email: document.getElementById('perfil-email').value.trim()
        })
      });
      nomeTitulo.textContent = dados.usuario.nome;
      exibirMensagem(mensagemPerfil, dados.mensagem, 'sucesso');
    } catch (erro) {
      exibirMensagem(mensagemPerfil, erro.message);
    } finally {
      botao.disabled = false;
    }
  });

  formSenha.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    ocultarMensagem(mensagemSenha);

    const senhaAtual = document.getElementById('senha-atual').value;
    const novaSenha = document.getElementById('nova-senha').value;
    const confirmarSenha = document.getElementById('confirmar-nova-senha').value;

    if (novaSenha !== confirmarSenha) {
      exibirMensagem(mensagemSenha, 'As novas senhas não coincidem.');
      return;
    }

    const botao = formSenha.querySelector('button[type="submit"]');
    botao.disabled = true;

    try {
      const dados = await apiFetch('/usuarios/me/senha', {
        method: 'PUT',
        body: JSON.stringify({ senhaAtual, novaSenha })
      });
      formSenha.reset();
      exibirMensagem(mensagemSenha, dados.mensagem, 'sucesso');
    } catch (erro) {
      exibirMensagem(mensagemSenha, erro.message);
    } finally {
      botao.disabled = false;
    }
  });

  document.getElementById('botao-logout').addEventListener('click', () => {
    removerToken();
    window.location.href = 'login.html';
  });

  document.getElementById('botao-excluir-conta').addEventListener('click', async () => {
    const senha = window.prompt('Digite sua senha para confirmar a exclusão da conta:');
    if (!senha) return;

    const confirmou = window.confirm('Esta ação é permanente. Deseja realmente excluir sua conta?');
    if (!confirmou) return;

    try {
      const dados = await apiFetch('/usuarios/me', {
        method: 'DELETE',
        body: JSON.stringify({ senha })
      });
      removerToken();
      window.alert(dados.mensagem);
      window.location.href = 'cadastro.html';
    } catch (erro) {
      exibirMensagem(mensagemPerfil, erro.message);
    }
  });

  await carregarPerfil();
});
