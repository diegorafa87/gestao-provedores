const mongoose = require('mongoose');

const GerenciadorAcessoSchema = new mongoose.Schema({
  cnpj: { type: String, required: true, index: true },
  link: { type: String, default: '' },
  login: { type: String, default: '' },
  senha: { type: String, default: '' },
  atualizadoPor: { type: String },
  atualizadoEm: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GerenciadorAcesso', GerenciadorAcessoSchema);
