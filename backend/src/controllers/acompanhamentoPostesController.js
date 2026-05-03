const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../db_logs.json');

function lerAcompanhamentoPostes() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    const json = JSON.parse(data);
    return json.acompanhamentoPostes || {};
  } catch (e) {
    return {};
  }
}

function salvarAcompanhamentoPostes(obj) {
  let data = {};
  try {
    data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (e) {}
  data.acompanhamentoPostes = obj;
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

exports.getPostesStatus = (req, res) => {
  const { cnpj } = req.params;
  const dados = lerAcompanhamentoPostes();
  res.json(dados[cnpj] || { anosDesligados: {}, anosOcultos: {} });
};

exports.setPostesStatus = (req, res) => {
  const { cnpj } = req.params;
  const { anosDesligados, anosOcultos } = req.body;
  const dados = lerAcompanhamentoPostes();
  dados[cnpj] = { anosDesligados, anosOcultos };
  salvarAcompanhamentoPostes(dados);
  res.json({ success: true });
};
