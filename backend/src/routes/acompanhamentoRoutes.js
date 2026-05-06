const express = require('express');
const router = express.Router();
const Acompanhamento = require('../models/Acompanhamento');

// Buscar acompanhamento por CNPJ e tipo
router.get('/:tipo/:cnpj', async (req, res) => {
  try {
    const { tipo, cnpj } = req.params;
    const doc = await Acompanhamento.findOne({ tipo, cnpj });
    if (!doc) return res.json({ checks: {}, links: {}, historico: [] });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar acompanhamento', details: err.message });
  }
});

// Salvar acompanhamento (cria ou atualiza)
router.post('/:tipo/:cnpj', async (req, res) => {
  try {
    const { tipo, cnpj } = req.params;
    const { checks, links, historico, atualizadoPor } = req.body;
    const doc = await Acompanhamento.findOneAndUpdate(
      { tipo, cnpj },
      { $set: { checks, links, historico, atualizadoPor, atualizadoEm: new Date() } },
      { upsert: true, new: true }
    );
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar acompanhamento', details: err.message });
  }
});

module.exports = router;
