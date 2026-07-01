const mongoose = require('mongoose');

const AcompanhamentoSchema = new mongoose.Schema({
  cnpj: { type: String, required: true, index: true },
  tipo: { type: String, required: true }, // Ex: SCM, POSTES, etc
  checks: { type: mongoose.Schema.Types.Mixed, default: {} },
  links: { type: mongoose.Schema.Types.Mixed, default: {} },
  historico: { type: [mongoose.Schema.Types.Mixed], default: [] },
  atualizadoPor: { type: String }, // userId ou nome
  atualizadoEm: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Acompanhamento', AcompanhamentoSchema);