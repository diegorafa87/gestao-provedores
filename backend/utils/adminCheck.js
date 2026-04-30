const fs = require('fs');
const path = require('path');

// Função para verificar se existe algum admin cadastrado
function existeAdmin() {
  // Usa o mesmo caminho do arquivo de usuários do authRoutes
  const USERS_DB = process.env.NODE_ENV === 'production'
    ? '/tmp/db_users.json'
    : path.join(__dirname, '../db_users.json');
  if (!fs.existsSync(USERS_DB)) return false;
  try {
    const users = JSON.parse(fs.readFileSync(USERS_DB));
    return users.some(u => u.type === 'admin');
  } catch {
    return false;
  }
}

module.exports = { existeAdmin };
