// Excluir entrada do histórico de geração de CSV SCM por nome, data e usuario
exports.deleteSCMHistoricoCSV = (req, res) => {
  const dbPath = path.join(__dirname, '../db_logs.json');
  const { nome, nomeDetalhes, data, usuario } = req.body;

  const normalizarTexto = (valor = '') => String(valor).trim().toLowerCase();
  const normalizarCnpj = (valor = '') => String(valor).replace(/\D/g, '');
  const obterNomeArquivo = (item = {}) => item.nome || item?.detalhes?.nomeArquivo || '';

  const nomeAlvo = normalizarTexto(nome || nomeDetalhes || '');
  const dataAlvo = normalizarTexto(data || '');
  const usuarioAlvo = normalizarTexto(usuario || '');
  const cnpjAlvo = normalizarCnpj(usuario || '');

  let logs = [];
  try {
    const fileData = fs.readFileSync(dbPath, 'utf8');
    const json = JSON.parse(fileData);
    logs = sanitizarLogsSCM(Array.isArray(json) ? json : (json.logs || []));
  } catch (e) {}

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

    // Remove o item exato e também entradas duplicadas do mesmo arquivo
    // com suporte a legado (nome em item.nome ou em item.detalhes.nomeArquivo).
    return !(removerExato || removerDuplicadoMesmoArquivo);
  });
  try {
    fs.writeFileSync(dbPath, JSON.stringify(novaLista, null, 2));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Erro ao excluir histórico' });
  }
};
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../db_logs.json');

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

function ehDoMesAtual(valorData) {
  const data = parseDataHistorico(valorData);
  if (!data) return false;
  const agora = new Date();
  return data.getFullYear() === agora.getFullYear() && data.getMonth() === agora.getMonth();
}

function obterChaveSCM(item = {}) {
  const nomeArquivo = String(item?.nome || item?.detalhes?.nomeArquivo || '').trim().toLowerCase();
  const usuario = String(item?.usuario || '').replace(/\D/g, '');
  const data = parseDataHistorico(item?.data);
  return `${nomeArquivo}|${usuario}|${data ? data.toISOString() : String(item?.data || '')}`;
}

function sanitizarLogsSCM(logs = []) {
  const vistos = new Set();
  return (Array.isArray(logs) ? logs : []).filter(item => {
    if (item?.acao !== 'GERAR_CSV_SCM') return true;
    if (!ehDoMesAtual(item?.data)) return false;

    const chave = obterChaveSCM(item);
    if (vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
}

function persistirLogsSanitizados(logs = []) {
  const logsSanitizados = sanitizarLogsSCM(logs);
  fs.writeFileSync(dbPath, JSON.stringify(logsSanitizados, null, 2));
  return logsSanitizados;
}

function persistirConteudoSanitizado(conteudo) {
  if (Array.isArray(conteudo)) {
    return persistirLogsSanitizados(conteudo);
  }

  const obj = conteudo && typeof conteudo === 'object' ? { ...conteudo } : {};
  const logsOriginais = Array.isArray(obj.logs) ? obj.logs : [];
  obj.logs = sanitizarLogsSCM(logsOriginais);
  fs.writeFileSync(dbPath, JSON.stringify(obj, null, 2));
  return obj.logs;
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
  const dbPath = path.join(__dirname, '../db_logs.json');
  let historico = [];
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    const json = JSON.parse(data);
    // Suporta tanto array quanto objeto (compatibilidade)
    const logs = persistirConteudoSanitizado(json);
    historico = logs
      .filter((item) => item.acao === 'GERAR_CSV_SCM')
      .sort((a, b) => new Date(b?.data || 0).getTime() - new Date(a?.data || 0).getTime());
  } catch (e) {}
  res.json(historico);
};

// Novo: Adicionar entrada ao histórico de geração de CSV SCM
exports.addSCMHistoricoCSV = (req, res) => {
  const dbPath = path.join(__dirname, '../db_logs.json');
  let logs = [];
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    const json = JSON.parse(data);
    logs = sanitizarLogsSCM(Array.isArray(json) ? json : (json.logs || []));
  } catch (e) {}
  const novaEntrada = {
    ...req.body,
    acao: req.body?.acao || 'GERAR_CSV_SCM',
    data: new Date().toISOString()
  };
  // Mantém entradas mais recentes no topo para compatibilidade com o logger global.
  logs.unshift(novaEntrada);
  try {
    persistirConteudoSanitizado(logs);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Erro ao salvar histórico' });
  }
};
