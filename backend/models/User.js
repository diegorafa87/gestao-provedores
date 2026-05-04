const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	email: { type: String, required: true, unique: true },
	consultoria: { type: String, required: true },
    passwordHash: { type: String, required: true }, // senha criptografada
    // outros campos podem ser adicionados aqui (nome, etc)
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
