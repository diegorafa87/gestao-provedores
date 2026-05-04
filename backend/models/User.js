const mongoose = require('mongoose');

<<<<<<< HEAD

const UserSchema = new mongoose.Schema({
	email: { type: String, required: true, unique: true },
	consultoria: { type: String, required: true },
	passwordHash: { type: String, required: true }, // senha criptografada
	// outros campos podem ser adicionados aqui (nome, etc)
=======
const UserSchema = new mongoose.Schema({
	email: { type: String, required: true, unique: true },
	consultoria: { type: String, required: true },
	// outros campos podem ser adicionados aqui (nome, senha hash, etc)
>>>>>>> 6f6854514f1e0dd3e13bbb58206a5c169147061c
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
