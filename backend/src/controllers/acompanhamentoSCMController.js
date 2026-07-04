const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../db_logs.json');

function lerConteudoLogs() {
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (e) {
    return [];
  }
}

function extrairLogs(conteudo) {
  if (Array.isArray(conteudo)) return conteudo;
  if (conteudo && Array.isArray(conteudo.logs)) return conteudo.logs;
  return [];
}

function salvarConteudoLogs(conteudoOriginal, logs) {
  if (Array.isArray(conteudoOriginal)) {
    fs.writeFileSync(dbPath, JSON.stringify(logs, null, 2));
    return;
  }

  if (conteudoOriginal && typeof conteudoOriginal === 'object') {
    const novoConteudo = { ...conteudoOriginal, logs };
    fs.writeFileSync(dbPath, JSON.stringify(novoConteudo, null, 2));
    return;
  }

  fs.writeFileSync(dbPath, JSON.stringify(logs, null, 2));
}

function parseDataHistorico(valor) {
  if (!valor) return null;
  if (valor instanceof Date && !Number.isNaN(valor.getTime())) return valor;

  const texto = String(valor).trim();
  const dataIso = new Date(texto);
  if (!Number.isNaN(dataIso.getTime())) return dataIso;

  const matchPtBr = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,\s*(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!matchPtBr) return null;

  const [, dia, mes, ano, hora = '0', minuto = '0', segundo = '0'] = matchPtBr;
  const data = new Date(Number(ano), Number(mes) - 1, Number(dia), Number(hora), Number(minuto), Number(segundo));
  return Number.isNaN(data.getTime()) ? null : data;
}

function obterChaveSCM(item = {}) {
  const nomeArquivo = String(item?.nome || item?.detalhes?.nomeArquivo || '').trim().toLowerCase();
  const usuario = String(item?.usuario || '').replace(/\D/g, '');
  const data = parseDataHistorico(item?.data);
  return `${nomeArquivo}|${usuario}|${data ? data.toISOString() : String(item?.data || '')}`;
}

function deduplicarLogsSCM(logs = []) {
  const vistos = new Set();
  return (Array.isArray(logs) ? logs : []).filter(item => {
    if (item?.acao !== 'GERAR_CSV_SCM') return true;

    const chave = obterChaveSCM(item);
    if (vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
}

function lerAcompanhamentoSCM() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    const json = JSON.parse(data);
    return json.acompanhamentoSCM || {};
  } catch (e) {
    return {};
  }
}

function salvarAcompanhamentoSCM(obj) {
  let data = {};
  try {
    data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (e) {}
  data.acompanhamentoSCM = obj;
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// Excluir entrada do histórico de geração de CSV SCM por nome, data e usuario
exports.deleteSCMHistoricoCSV = (req, res) => {
  const { nome, nomeDetalhes, data, usuario } = req.body;

  const normalizarTexto = (valor = '') => String(valor).trim().toLowerCase();
  const normalizarCnpj = (valor = '') => String(valor).replace(/\D/g, '');
  const obterNomeArquivo = (item = {}) => item.nome || item?.detalhes?.nomeArquivo || '';

  const nomeAlvo = normalizarTexto(nome || nomeDetalhes || '');
  const dataAlvo = normalizarTexto(data || '');
  const usuarioAlvo = normalizarTexto(usuario || '');
  const cnpjAlvo = normalizarCnpj(usuario || '');

  const conteudoOriginal = lerConteudoLogs();
  const logs = extrairLogs(conteudoOriginal);

  const novaLista = logs.filter(item => {
    if (item.acao !== 'GERAR_CSV_SCM') return true;

    if (!nomeAlvo && !dataAlvo && !usuarioAlvo) {
      return true;
    }

    const nomeItem = normalizarTexto(obterNomeArquivo(item));
    const dataItem = normalizarTexto(item.data || '');
    const usuarioItem = normalizarTexto(item.usuario || '');
    const cnpjItem = normalizarCnpj(item.usuario || '');

    const mesmoNome = nomeAlvo ? nomeItem === nomeAlvo : false;
    const mesmaData = dataAlvo ? dataItem === dataAlvo : true;
    const mesmoUsuario = usuarioAlvo ? usuarioItem === usuarioAlvo : true;
    const mesmoCnpj = cnpjAlvo ? cnpjItem === cnpjAlvo : false;

    const removerExato = mesmoNome && mesmaData && mesmoUsuario;
    const removerDuplicadoMesmoArquivo = mesmoNome && (mesmoUsuario || mesmoCnpj);

    return !(removerExato || removerDuplicadoMesmoArquivo);
  });

  try {
    salvarConteudoLogs(conteudoOriginal, deduplicarLogsSCM(novaLista));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Erro ao excluir histórico' });
  }
};

exports.getSCMStatus = (req, res) => {
  const { cnpj } = req.params;
  const dados = lerAcompanhamentoSCM();
  res.json(dados[cnpj] || { anosDesligados: {}, anosOcultos: {} });
};


exports.setSCMStatus = (req, res) => {
  const { cnpj } = req.params;
  const { anosDesligados, anosOcultos } = req.body;
  const dados = lerAcompanhamentoSCM();
  dados[cnpj] = { anosDesligados, anosOcultos };
  salvarAcompanhamentoSCM(dados);
  res.json({ success: true });
};

// Novo: Listar histórico de geração de CSV SCM
exports.getSCMHistoricoCSV = (req, res) => {
  let historico = [];
  try {
    const conteudoOriginal = lerConteudoLogs();
    const logs = deduplicarLogsSCM(extrairLogs(conteudoOriginal));
    historico = logs
      .filter((item) => item.acao === 'GERAR_CSV_SCM')
      .sort((a, b) => new Date(b?.data || 0).getTime() - new Date(a?.data || 0).getTime());
  } catch (e) {}
  res.json(historico);
};

// Novo: Adicionar entrada ao histórico de geração de CSV SCM
exports.addSCMHistoricoCSV = (req, res) => {
  const conteudoOriginal = lerConteudoLogs();
  const logs = extrairLogs(conteudoOriginal);
  const novaEntrada = {
    ...req.body,
    acao: req.body?.acao || 'GERAR_CSV_SCM',
    data: new Date().toISOString()
  };
  // Mantém entradas mais recentes no topo para compatibilidade com o logger global.
  logs.unshift(novaEntrada);
  try {
    salvarConteudoLogs(conteudoOriginal, deduplicarLogsSCM(logs));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Erro ao salvar histórico' });
  }
};
