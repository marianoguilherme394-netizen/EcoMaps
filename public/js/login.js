document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-login');
  const mensagem = document.getElementById('mensagem-login');
  const botao = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    ocultarMensagem(mensagem);

    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-senha').value;

    botao.disabled = true;
    botao.textContent = 'Entrando...';

    try {
      const dados = await apiFetch('/usuarios/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha })
      });

      salvarToken(dados.token);
      exibirMensagem(mensagem, dados.mensagem, 'sucesso');
      window.setTimeout(() => {
        window.location.href = 'perfil.html';
      }, 400);
    } catch (erro) {
      exibirMensagem(mensagem, erro.message);
    } finally {
      botao.disabled = false;
      botao.textContent = 'Entrar';
    }
  });
});
