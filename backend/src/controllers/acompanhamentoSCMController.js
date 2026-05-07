// Excluir entrada do histórico de geração de CSV SCM por nome, data e usuario
exports.deleteSCMHistoricoCSV = (req, res) => {
  const dbPath = path.join(__dirname, '../db_logs.json');
  const { nome, data, usuario } = req.body;
  let logs = [];
  try {
    const fileData = fs.readFileSync(dbPath, 'utf8');
    const json = JSON.parse(fileData);
    logs = Array.isArray(json) ? json : (json.logs || []);
  } catch (e) {}
  const novaLista = logs.filter(item => {
    if (item.acao !== 'GERAR_CSV_SCM') return true;
    // Remove apenas o item exato
    return !(item.nome === nome && item.data === data && item.usuario === usuario);
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
    const logs = Array.isArray(json) ? json : (json.logs || []);
    historico = logs.filter(
      (item) => item.acao === 'GERAR_CSV_SCM'
    );
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
    logs = Array.isArray(json) ? json : (json.logs || []);
  } catch (e) {}
  const novaEntrada = req.body;
  logs.push(novaEntrada);
  try {
    fs.writeFileSync(dbPath, JSON.stringify(logs, null, 2));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Erro ao salvar histórico' });
  }
};
