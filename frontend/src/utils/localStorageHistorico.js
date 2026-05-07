// Utilitário para persistir o histórico de arquivos no localStorage

// Agora cada cliente tem sua própria chave de histórico, baseada no CNPJ
function getStorageKey(cnpj) {
  return `historicoArquivosEnlacesContratados_${cnpj || 'semcnpj'}`;
}

export function salvarHistoricoNoStorage(historico, cnpj) {
  try {
    localStorage.setItem(getStorageKey(cnpj), JSON.stringify(historico));
  } catch (e) {}
}

export function carregarHistoricoDoStorage(cnpj) {
  try {
    const data = localStorage.getItem(getStorageKey(cnpj));
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}
