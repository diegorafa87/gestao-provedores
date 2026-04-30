const bcrypt = require('bcryptjs');

class User {
	constructor({ id, username, password, type = 'consultoria' }) {
		this.id = id;
		this.username = username;
		this.password = password;
		this.type = type;
	}

	static async hashPassword(password) {
		return await bcrypt.hash(password, 10);
	}

	async comparePassword(password) {
		return await bcrypt.compare(password, this.password);
	}
}

module.exports = User;
