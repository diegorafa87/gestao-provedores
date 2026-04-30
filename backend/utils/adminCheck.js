const fs = require('fs');
const path = require('path');

// Função para verificar se existe algum admin cadastrado
function existeAdmin() {
  const USERS_DB = path.join(__dirname, '../db_users.json');
  if (!fs.existsSync(USERS_DB)) return false;
  try {
    const users = JSON.parse(fs.readFileSync(USERS_DB));
    return users.some(u => u.type === 'admin');
  } catch {
    return false;
  }
}

module.exports = { existeAdmin };
