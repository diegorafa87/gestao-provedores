import API_URL from './api';

// Função utilitária para limpar CNPJ (apenas números)
function limparCNPJ(cnpj) {
  return cnpj.replace(/\D/g, '');
}

export async function getAcompanhamento(tipo, cnpj) {
  const cnpjLimpo = limparCNPJ(cnpj);
  const res = await fetch(`${API_URL}/api/acompanhamento/${tipo}/${cnpjLimpo}`);
  if (!res.ok) throw new Error('Erro ao buscar acompanhamento');
  return res.json();
}

export async function saveAcompanhamento(tipo, cnpj, data, atualizadoPor) {
  const cnpjLimpo = limparCNPJ(cnpj);
  const res = await fetch(`${API_URL}/api/acompanhamento/${tipo}/${cnpjLimpo}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, atualizadoPor })
    }
  );
  if (!res.ok) throw new Error('Erro ao salvar acompanhamento');
  return res.json();
}
