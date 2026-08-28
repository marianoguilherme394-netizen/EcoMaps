document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-cadastro');
  const mensagem = document.getElementById('mensagem-cadastro');
  const botao = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    ocultarMensagem(mensagem);

    const nome = document.getElementById('cadastro-nome').value.trim();
    const email = document.getElementById('cadastro-email').value.trim();
    const senha = document.getElementById('cadastro-senha').value;
    const confirmarSenha = document.getElementById('cadastro-confirmar-senha').value;

    if (senha !== confirmarSenha) {
      exibirMensagem(mensagem, 'As senhas não coincidem.');
      return;
    }

    botao.disabled = true;
    botao.textContent = 'Cadastrando...';

    try {
      const dados = await apiFetch('/usuarios/cadastro', {
        method: 'POST',
        body: JSON.stringify({ nome, email, senha })
      });

      salvarToken(dados.token);
      exibirMensagem(mensagem, dados.mensagem, 'sucesso');
      window.setTimeout(() => {
        window.location.href = 'perfil.html';
      }, 500);
    } catch (erro) {
      exibirMensagem(mensagem, erro.message);
    } finally {
      botao.disabled = false;
      botao.textContent = 'Cadastrar-se';
    }
  });
});
