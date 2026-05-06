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

export async function getGerenciadorAcesso(cnpj) {
  const res = await fetch(`${API_URL}/api/gerenciador-acesso/${cnpj}`);
  if (!res.ok) throw new Error('Erro ao buscar acesso do gerenciador');
  return res.json();
}

export async function saveGerenciadorAcesso(cnpj, data, atualizadoPor) {
  const res = await fetch(`${API_URL}/api/gerenciador-acesso/${cnpj}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, atualizadoPor })
    }
  );
  if (!res.ok) throw new Error('Erro ao salvar acesso do gerenciador');
  return res.json();
}
