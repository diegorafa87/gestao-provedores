const bcrypt = require('bcryptjs');
const User = require('../../models/User');

const ADMIN_EMAIL_FALLBACK = 'diegorafa87@gmail.com';

function resolveRole(user) {
  if (user?.role) return user.role;
  return user?.email === ADMIN_EMAIL_FALLBACK ? 'ADMIN' : 'FILHO';
}

function sanitizeUser(userDoc) {
  return {
    id: userDoc._id,
    email: userDoc.email,
    login: userDoc.login,
    nome: userDoc.nome || '',
    role: resolveRole(userDoc),
    consultoria: userDoc.consultoria || '',
    clienteId: userDoc.clienteId || null,
    parentUserId: userDoc.parentUserId || null,
    ativo: userDoc.ativo !== false,
  };
}

exports.login = async (req, res) => {
  try {
    const { login, senha } = req.body;

    if (!login || !senha) {
      return res.status(400).json({ error: 'Login e senha são obrigatórios.' });
    }

    const user = await User.findOne({
      $or: [{ login }, { email: login }],
    });

    if (!user) {
      return res.status(401).json({ error: 'Login ou senha inválidos.' });
    }

    if (user.ativo === false) {
      return res.status(403).json({ error: 'Usuário inativo.' });
    }

    const ok = await bcrypt.compare(senha, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Login ou senha inválidos.' });
    }

    return res.json({ user: sanitizeUser(user) });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao autenticar usuário.', details: err.message });
  }
};
