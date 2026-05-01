const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	email: { type: String, required: true, unique: true },
	consultoria: { type: String, required: true },
	// outros campos podem ser adicionados aqui (nome, senha hash, etc)
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
