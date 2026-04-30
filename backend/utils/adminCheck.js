const fs = require('fs');
const path = require('path');
const USERS_DB = path.join(__dirname, '../src/db_users.json');

function existeAdmin() {
	if (!fs.existsSync(USERS_DB)) return false;
	const users = JSON.parse(fs.readFileSync(USERS_DB));
	return users.some(u => u.type === 'admin');
}

module.exports = { existeAdmin };
