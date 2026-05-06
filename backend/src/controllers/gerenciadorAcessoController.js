const GerenciadorAcesso = require('../models/GerenciadorAcesso');

// Buscar acesso por CNPJ
exports.getAcesso = async (req, res) => {
  try {
    const { cnpj } = req.params;
    const doc = await GerenciadorAcesso.findOne({ cnpj });
    if (!doc) return res.json({ link: '', login: '', senha: '' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar acesso', details: err.message });
  }
};

// Salvar acesso (cria ou atualiza)
exports.saveAcesso = async (req, res) => {
  try {
    const { cnpj } = req.params;
    const { link, login, senha, atualizadoPor } = req.body;
    const doc = await GerenciadorAcesso.findOneAndUpdate(
      { cnpj },
      { $set: { link, login, senha, atualizadoPor, atualizadoEm: new Date() } },
      { upsert: true, new: true }
    );
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar acesso', details: err.message });
  }
};
