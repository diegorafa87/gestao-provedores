const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  acao: { type: String, required: true, index: true },
  usuario: { type: String, default: 'sistema' },
  detalhes: { type: mongoose.Schema.Types.Mixed, default: {} },
  data: { type: Date, default: Date.now, index: true }
}, { strict: false });

module.exports = mongoose.model('Log', LogSchema);
