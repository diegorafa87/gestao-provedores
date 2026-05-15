import API_URL from './api';

// Função utilitária para limpar CNPJ (apenas números)
function limparCNPJ(cnpj) {
  return cnpj.replace(/\D/g, '');
}

export async function getMesesComDados(cnpj) {
  const cnpjLimpo = limparCNPJ(cnpj);
  try {
    const res = await fetch(`${API_URL}/api/logs/meses/${cnpjLimpo}`);
    if (!res.ok) throw new Error('Erro ao buscar meses');
    return res.json();
  } catch (error) {
    console.error('Erro ao buscar meses com dados:', error);
    return {
      'SCM': [],
      'TVpA': [],
      'STFC': [],
      'Postes': [],
      'Relatório Econômico': []
    };
  }
}
