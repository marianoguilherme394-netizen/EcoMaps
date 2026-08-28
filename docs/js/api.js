const TOKEN_KEY = 'ecomaps_token';

function obterToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function salvarToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function removerToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function apiFetch(caminho, opcoes = {}) {
  const headers = new Headers(opcoes.headers || {});
  const token = obterToken();

  if (opcoes.body && !(opcoes.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const resposta = await fetch(`/api${caminho}`, {
    ...opcoes,
    headers
  });

  let dados = {};
  try {
    dados = await resposta.json();
  } catch (erro) {
    dados = { mensagem: 'O servidor retornou uma resposta inválida.' };
  }

  if (!resposta.ok) {
    const erro = new Error(dados.mensagem || 'Não foi possível concluir a solicitação.');
    erro.status = resposta.status;
    throw erro;
  }

  return dados;
}

function exibirMensagem(elemento, texto, tipo = 'erro') {
  elemento.textContent = texto;
  elemento.className = `mensagem-form ${tipo}`;
  elemento.hidden = false;
}

function ocultarMensagem(elemento) {
  elemento.hidden = true;
  elemento.textContent = '';
}
