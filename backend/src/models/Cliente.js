const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
  razaoSocial: { type: String, required: true },
  cnpj: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  telefone: { type: String, required: true },
  consultoria: { type: String, required: true },
  status: { type: String, enum: ['NOVO','ATIVO','CORRIGIR','SUSPENSO'], default: 'NOVO' },
  observacao: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Cliente', ClienteSchema);
