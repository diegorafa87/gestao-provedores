const mongoose = require('mongoose');

const AcompanhamentoSchema = new mongoose.Schema({
  cnpj: { type: String, required: true, index: true },
  tipo: { type: String, required: true }, // Ex: SCM, POSTES, etc
  atualizadoPor: { type: String }, // userId ou nome
  atualizadoEm: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Acompanhamento', AcompanhamentoSchema);