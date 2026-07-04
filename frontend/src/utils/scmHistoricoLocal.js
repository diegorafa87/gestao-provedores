function normalizarCnpj(valor = '') {
  return String(valor || '').replace(/\D/g, '');
}

function obterNomeArquivo(item = {}) {
  return String(item?.nome || item?.detalhes?.nomeArquivo || '').trim();
}

function obterChaveItem(item = {}) {
  const nome = obterNomeArquivo(item).toLowerCase();
  const usuario = normalizarCnpj(item?.usuario || item?.cnpj || '');
  const data = String(item?.data || '').trim();
  return `${nome}|${usuario}|${data}`;
}

function deduplicarHistorico(lista = []) {
  const vistos = new Set();
  return (lista || []).filter(item => {
    const chave = obterChaveItem(item);
    if (!chave || vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
}

function getStorageKey(cnpj = '') {
  const cnpjLimpo = normalizarCnpj(cnpj);
  return cnpjLimpo ? `historicoSCM_${cnpjLimpo}` : null;
}

function normalizarItem(item = {}, cnpj = '') {
  const cnpjLimpo = normalizarCnpj(cnpj || item?.usuario || item?.cnpj || '');
  return {
    ...item,
    nome: item?.nome || item?.detalhes?.nomeArquivo,
    usuario: item?.usuario || cnpjLimpo,
    cnpj: cnpjLimpo,
    detalhes: {
      ...(item?.detalhes || {}),
      nomeArquivo: item?.detalhes?.nomeArquivo || item?.nome || 'scm.csv'
    }
  };
}

export function carregarHistoricoSCMLocal(cnpj = '') {
  const chave = getStorageKey(cnpj);
  if (!chave) return [];

  try {
    const salvo = localStorage.getItem(chave);
    const lista = salvo ? JSON.parse(salvo) : [];
    const cnpjLimpo = normalizarCnpj(cnpj);
    return deduplicarHistorico(
      (Array.isArray(lista) ? lista : [])
        .map(item => normalizarItem(item, cnpjLimpo))
        .filter(item => normalizarCnpj(item?.usuario || item?.cnpj) === cnpjLimpo)
    );
  } catch {
    return [];
  }
}

export function salvarHistoricoSCMLocal(lista = [], cnpj = '') {
  const chave = getStorageKey(cnpj);
  if (!chave) return [];

  const cnpjLimpo = normalizarCnpj(cnpj);
  const normalizada = deduplicarHistorico(
    (lista || [])
      .map(item => normalizarItem(item, cnpjLimpo))
      .filter(item => normalizarCnpj(item?.usuario || item?.cnpj) === cnpjLimpo)
  );

  localStorage.setItem(chave, JSON.stringify(normalizada));
  return normalizada;
}

export function mesclarHistoricoSCM(remoto = [], cnpj = '') {
  const local = carregarHistoricoSCMLocal(cnpj);
  const cnpjLimpo = normalizarCnpj(cnpj);
  const remotoFiltrado = (Array.isArray(remoto) ? remoto : [])
    .map(item => normalizarItem(item, cnpjLimpo))
    .filter(item => normalizarCnpj(item?.usuario || item?.cnpj) === cnpjLimpo);

  return salvarHistoricoSCMLocal([...remotoFiltrado, ...local], cnpjLimpo);
}

export function adicionarHistoricoSCMLocal(item, cnpj = '') {
  const atual = carregarHistoricoSCMLocal(cnpj);
  return salvarHistoricoSCMLocal([normalizarItem(item, cnpj), ...atual], cnpj);
}

export function removerHistoricoSCMLocal(item, cnpj = '') {
  const atual = carregarHistoricoSCMLocal(cnpj);
  const chaveAlvo = obterChaveItem(normalizarItem(item, cnpj));
  const novo = atual.filter(entry => obterChaveItem(entry) !== chaveAlvo);
  return salvarHistoricoSCMLocal(novo, cnpj);
}
