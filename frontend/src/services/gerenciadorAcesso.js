// Função utilitária para limpar CNPJ (remover pontos, barras e traços)
function limparCNPJ(cnpj) {
  return cnpj.replace(/\D/g, '');
}

// Função para buscar dados do gerenciador por CNPJ
export async function getGerenciadorAcesso(cnpj) {
  const cnpjLimpo = limparCNPJ(cnpj);
  const res = await fetch(`${API_URL}/api/gerenciador-acesso/${cnpjLimpo}`);
  if (!res.ok) throw new Error('Erro ao buscar acesso do gerenciador');
  return res.json();
}

export async function getGerenciadorAcessosPendentes(cnpj = '') {
  const cnpjLimpo = limparCNPJ(cnpj);
  const query = cnpjLimpo ? `?cnpj=${encodeURIComponent(cnpjLimpo)}` : '';
  let emailUsuario = localStorage.getItem('emailUsuario') || '';
  try {
    emailUsuario = JSON.parse(localStorage.getItem('authUser') || 'null')?.email || emailUsuario;
  } catch {}

  const res = await fetch(`${API_URL}/api/gerenciador-acesso/status${query}`, {
    headers: emailUsuario ? { 'x-user-email': emailUsuario } : {}
  });
  if (!res.ok) throw new Error('Erro ao verificar os dados do gerenciador');
  return res.json();
}

// Função para salvar dados do gerenciador por CNPJ
export async function saveGerenciadorAcesso(cnpj, data, atualizadoPor) {
  const cnpjLimpo = limparCNPJ(cnpj);
  const res = await fetch(`${API_URL}/api/gerenciador-acesso/${cnpjLimpo}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, atualizadoPor })
    }
  );
  if (!res.ok) throw new Error('Erro ao salvar acesso do gerenciador');
  return res.json();
}
import API_URL from './api';
