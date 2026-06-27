// Utilitário para persistir o histórico de arquivos de postes no localStorage

// Agora cada cliente tem sua própria chave de histórico, baseada no CNPJ
function getStorageKey(cnpj) {
  const cnpjNormalizado = String(cnpj || '').replace(/\D/g, '');
  return `historicoArquivosCompartilhamentoPostes_${cnpjNormalizado || 'semcnpj'}`;
}

export function normalizarConteudoCSV(conteudo = '') {
  let texto = String(conteudo).replace(/^\s+/, '');
  texto = texto.replace(/([^\r])\n/g, '$1\r\n');
  texto = texto.replace(/(\r\n)+$/g, '');
  return texto + '\r\n';
}

export function criarBlobCSV(conteudo = '') {
  const BOM = '\uFEFF';
  return new Blob([BOM + normalizarConteudoCSV(conteudo)], { type: 'text/csv;charset=utf-8;' });
}

export function salvarHistoricoPostesNoStorage(historico, cnpj) {
  try {
    localStorage.setItem(getStorageKey(cnpj), JSON.stringify(historico));
  } catch (e) {}
}

export function carregarHistoricoPostesDoStorage(cnpj) {
  try {
    const data = localStorage.getItem(getStorageKey(cnpj));
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}
