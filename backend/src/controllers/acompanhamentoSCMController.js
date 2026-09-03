const fs = require('fs');
const path = require('path');
const Log = require('../models/Log');
const { garantirMigracaoLogs } = require('./logController');
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
exports.deleteSCMHistoricoCSV = async (req, res) => {
  const { nome, nomeDetalhes, data, usuario } = req.body;

  const normalizarTexto = (valor = '') => String(valor).trim().toLowerCase();
  const normalizarCnpj = (valor = '') => String(valor).replace(/\D/g, '');
  const obterNomeArquivo = (item = {}) => item.nome || item?.detalhes?.nomeArquivo || '';

  const nomeAlvo = normalizarTexto(nome || nomeDetalhes || '');
  const dataAlvo = normalizarTexto(data || '');
  const usuarioAlvo = normalizarTexto(usuario || '');
  const cnpjAlvo = normalizarCnpj(usuario || '');

  try {
    const historicos = await Log.find({ acao: 'GERAR_CSV_SCM' }).lean();
    const idsParaExcluir = historicos.filter(item => {
      if (!nomeAlvo && !dataAlvo && !usuarioAlvo && !cnpjAlvo) return false;
      const nomeItem = normalizarTexto(obterNomeArquivo(item));
      const dataItem = normalizarTexto(item.data || '');
      const usuarioItem = normalizarTexto(item.usuario || '');
      const cnpjItem = normalizarCnpj(item.usuario || '');
      return (nomeAlvo ? nomeItem === nomeAlvo : false) &&
        (dataAlvo ? dataItem === dataAlvo : true) &&
        (usuarioAlvo ? usuarioItem === usuarioAlvo : true) &&
        (cnpjAlvo ? cnpjItem === cnpjAlvo : true);
    }).map(item => item._id);
    if (idsParaExcluir.length) await Log.deleteMany({ _id: { $in: idsParaExcluir } });
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
exports.getSCMHistoricoCSV = async (req, res) => {
  await garantirMigracaoLogs();
  const historico = await Log.find({ acao: 'GERAR_CSV_SCM' })
    .sort({ data: -1 })
    .lean();
  res.json(historico);
};

// Novo: Adicionar entrada ao histórico de geração de CSV SCM
exports.addSCMHistoricoCSV = async (req, res) => {
  const novaEntrada = {
    ...req.body,
    acao: req.body?.acao || 'GERAR_CSV_SCM',
    data: new Date().toISOString()
  };
  try {
    await Log.create(novaEntrada);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Erro ao salvar histórico' });
  }
};
