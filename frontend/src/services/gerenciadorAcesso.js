import API_URL from './api';

// Função utilitária para limpar CNPJ (remover pontos, barras e traços)
function limparCNPJ(cnpj = '') {
  return String(cnpj).replace(/\D/g, '');
}

function obterEmailUsuario() {
  let emailUsuario = localStorage.getItem('emailUsuario') || '';
  try {
    emailUsuario = JSON.parse(localStorage.getItem('authUser') || 'null')?.email || emailUsuario;
  } catch {}
  return emailUsuario;
}

// Função para buscar dados do gerenciador por CNPJ
export async function getGerenciadorAcesso(cnpj) {
  const cnpjLimpo = limparCNPJ(cnpj);
  const res = await fetch(`${API_URL}/api/gerenciador-acesso/${cnpjLimpo}`);
  if (!res.ok) throw new Error('Erro ao buscar acesso do gerenciador');
  return res.json();
}

export async function getGerenciadorAcessoStatus(cnpj, competencia) {
  const cnpjLimpo = limparCNPJ(cnpj);
  const params = new URLSearchParams({ cnpj: cnpjLimpo });
  if (competencia) params.set('competencia', competencia);

  const emailUsuario = obterEmailUsuario();
  const res = await fetch(`${API_URL}/api/gerenciador-acesso/status?${params}`, {
    headers: emailUsuario ? { 'x-user-email': emailUsuario } : {}
  });
  if (!res.ok) throw new Error('Erro ao verificar os dados do gerenciador');
  return res.json();
}

export async function marcarDiciSolicitado(cnpj, competencia) {
  const cnpjLimpo = limparCNPJ(cnpj);
  const emailUsuario = obterEmailUsuario();
  const res = await fetch(`${API_URL}/api/gerenciador-acesso/${cnpjLimpo}/dici-solicitado`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(emailUsuario ? { 'x-user-email': emailUsuario } : {})
    },
    body: JSON.stringify({ competencia })
  });
  if (!res.ok) throw new Error('Erro ao registrar a solicitação de DICI');
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
