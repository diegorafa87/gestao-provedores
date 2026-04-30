const fs = require('fs');
const path = require('path');

// Caminho absoluto seguro para produção e dev
const USERS_DB = path.resolve(__dirname, '../src/db_users.json');

function existeAdmin() {
	if (!fs.existsSync(USERS_DB)) {
		console.log('[adminCheck] db_users.json não encontrado:', USERS_DB);
		return false;
	}
	const users = JSON.parse(fs.readFileSync(USERS_DB));
	console.log('[adminCheck] Usuários encontrados:', users);
	const temAdmin = users.some(u => (u.type && u.type.toLowerCase() === 'admin'));
	console.log('[adminCheck] Existe admin?', temAdmin);
	return temAdmin;
}

module.exports = { existeAdmin };
