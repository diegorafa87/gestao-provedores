const User = require('../models/User');

// Função para verificar se existe algum admin cadastrado no MongoDB
async function existeAdmin() {
  const admin = await User.findOne({ type: 'admin' });
  return !!admin;
}

module.exports = { existeAdmin };
