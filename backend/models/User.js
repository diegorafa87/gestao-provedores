const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	email: { type: String, required: true, unique: true },
	login: { type: String, required: true, unique: true },
	nome: { type: String, default: '' },
	role: { type: String, enum: ['ADMIN', 'FILHO', 'NETO'], default: 'FILHO' },
	consultoria: { type: String, default: '' },
	clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', default: null },
	parentUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    passwordHash: { type: String, required: true }, // senha criptografada
    ativo: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
