const mongoose = require('mongoose');

const AcompanhamentoSchema = new mongoose.Schema({
  cnpj: { type: String, required: true, index: true },
  tipo: { type: String, required: true }, // Ex: SCM, POSTES, etc
  checks: { type: Object, default: {} }, // Estrutura flexível para anos/meses/campos
  links: { type: Object, default: {} },
  historico: { type: Array, default: [] }, // Arquivos ou ações
  atualizadoPor: { type: String }, // userId ou nome
  atualizadoEm: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Acompanhamento', AcompanhamentoSchema);