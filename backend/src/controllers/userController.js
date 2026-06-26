const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Cliente = require('../models/Cliente');

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

async function getActor(actorEmail) {
  if (!actorEmail) return null;
  return User.findOne({ email: actorEmail });
}

async function ensureActorAdmin(actorEmail) {
  const actor = await getActor(actorEmail);
  if (!actor) return { ok: false, status: 404, error: 'Usuário admin não encontrado.' };

  const role = resolveRole(actor);
  if (role !== 'ADMIN') {
    return { ok: false, status: 403, error: 'Somente ADMIN pode criar usuários filho/neto.' };
  }

  return { ok: true, actor };
}

// Endpoint temporário para listar todos os usuários
exports.listAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users.map(sanitizeUser));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Buscar escopo do usuário por e-mail
exports.getUserScope = async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email é obrigatório.' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(sanitizeUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Legado: mantém endpoint consultoria para não quebrar código antigo
exports.getUserConsultoria = async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email é obrigatório.' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json({ consultoria: user.consultoria || '' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Legado: cria/atualiza usuário por consultoria
exports.setUserConsultoria = async (req, res) => {
  const { email, consultoria, login, senha } = req.body;
  if (!email || !consultoria) {
    return res.status(400).json({ error: 'Email e consultoria são obrigatórios.' });
  }

  try {
    const passwordHash = senha ? await bcrypt.hash(senha, 10) : await bcrypt.hash('123456', 10);
    const doc = {
      consultoria,
      login: login || email,
      role: email === ADMIN_EMAIL_FALLBACK ? 'ADMIN' : 'FILHO',
    };

    if (senha) doc.passwordHash = passwordHash;

    const existing = await User.findOne({ email });
    if (!existing) {
      doc.passwordHash = passwordHash;
    }

    const user = await User.findOneAndUpdate(
      { email },
      doc,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(sanitizeUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createChildUser = async (req, res) => {
  try {
    const { actorEmail, nome, login, email, senha, consultoria } = req.body;

    if (!actorEmail || !login || !email || !senha || !consultoria) {
      return res.status(400).json({ error: 'actorEmail, login, email, senha e consultoria são obrigatórios.' });
    }

    const adminCheck = await ensureActorAdmin(actorEmail);
    if (!adminCheck.ok) {
      return res.status(adminCheck.status).json({ error: adminCheck.error });
    }

    const existsEmail = await User.findOne({ email });
    if (existsEmail) {
      return res.status(409).json({ error: 'Já existe usuário com esse email.' });
    }

    const existsLogin = await User.findOne({ login });
    if (existsLogin) {
      return res.status(409).json({ error: 'Já existe usuário com esse login.' });
    }

    const passwordHash = await bcrypt.hash(senha, 10);

    const child = await User.create({
      nome: nome || '',
      login,
      email,
      role: 'FILHO',
      consultoria,
      passwordHash,
      parentUserId: adminCheck.actor._id,
      ativo: true,
    });

    return res.status(201).json({ user: sanitizeUser(child) });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao criar usuário filho.', details: err.message });
  }
};

exports.createGrandchildUser = async (req, res) => {
  try {
    const { actorEmail, nome, login, email, senha, consultoria, clienteId } = req.body;

    if (!actorEmail || !login || !email || !senha || !consultoria || !clienteId) {
      return res.status(400).json({
        error: 'actorEmail, login, email, senha, consultoria e clienteId são obrigatórios.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(clienteId)) {
      return res.status(400).json({ error: 'clienteId inválido.' });
    }

    const adminCheck = await ensureActorAdmin(actorEmail);
    if (!adminCheck.ok) {
      return res.status(adminCheck.status).json({ error: adminCheck.error });
    }

    const cliente = await Cliente.findById(clienteId);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    if ((cliente.consultoria || '') !== consultoria) {
      return res.status(400).json({ error: 'Cliente não pertence à consultoria informada.' });
    }

    const existsEmail = await User.findOne({ email });
    if (existsEmail) {
      return res.status(409).json({ error: 'Já existe usuário com esse email.' });
    }

    const existsLogin = await User.findOne({ login });
    if (existsLogin) {
      return res.status(409).json({ error: 'Já existe usuário com esse login.' });
    }

    const passwordHash = await bcrypt.hash(senha, 10);

    const grandchild = await User.create({
      nome: nome || '',
      login,
      email,
      role: 'NETO',
      consultoria,
      clienteId: cliente._id,
      passwordHash,
      parentUserId: adminCheck.actor._id,
      ativo: true,
    });

    return res.status(201).json({ user: sanitizeUser(grandchild) });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao criar usuário neto.', details: err.message });
  }
};

exports.listManagedUsers = async (req, res) => {
  try {
    const { actorEmail } = req.query;
    const adminCheck = await ensureActorAdmin(actorEmail);
    if (!adminCheck.ok) {
      return res.status(adminCheck.status).json({ error: adminCheck.error });
    }

    const users = await User.find({ role: { $in: ['FILHO', 'NETO'] } })
      .populate('clienteId', 'razaoSocial cnpj consultoria')
      .sort({ createdAt: -1 });

    const payload = users.map((u) => {
      const base = sanitizeUser(u);
      return {
        ...base,
        cliente: u.clienteId
          ? {
              id: u.clienteId._id,
              razaoSocial: u.clienteId.razaoSocial,
              cnpj: u.clienteId.cnpj,
              consultoria: u.clienteId.consultoria,
            }
          : null,
      };
    });

    return res.json(payload);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar usuários gerenciáveis.', details: err.message });
  }
};

exports.updateManagedUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { actorEmail, nome, login, email, consultoria, clienteId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'id inválido.' });
    }

    const adminCheck = await ensureActorAdmin(actorEmail);
    if (!adminCheck.ok) {
      return res.status(adminCheck.status).json({ error: adminCheck.error });
    }

    const target = await User.findById(id);
    if (!target) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    if (!['FILHO', 'NETO'].includes(resolveRole(target))) {
      return res.status(403).json({ error: 'Somente usuários FILHO/NETO podem ser editados aqui.' });
    }

    if (email && email !== target.email) {
      const existsEmail = await User.findOne({ email });
      if (existsEmail) return res.status(409).json({ error: 'Já existe usuário com esse email.' });
      target.email = email;
    }

    if (login && login !== target.login) {
      const existsLogin = await User.findOne({ login });
      if (existsLogin) return res.status(409).json({ error: 'Já existe usuário com esse login.' });
      target.login = login;
    }

    if (typeof nome === 'string') target.nome = nome;

    if (target.role === 'FILHO') {
      if (!consultoria) return res.status(400).json({ error: 'Consultoria é obrigatória para usuário FILHO.' });
      target.consultoria = consultoria;
      target.clienteId = null;
    }

    if (target.role === 'NETO') {
      if (!consultoria || !clienteId) {
        return res.status(400).json({ error: 'Consultoria e clienteId são obrigatórios para usuário NETO.' });
      }
      if (!mongoose.Types.ObjectId.isValid(clienteId)) {
        return res.status(400).json({ error: 'clienteId inválido.' });
      }
      const cliente = await Cliente.findById(clienteId);
      if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado.' });
      if ((cliente.consultoria || '') !== consultoria) {
        return res.status(400).json({ error: 'Cliente não pertence à consultoria informada.' });
      }
      target.consultoria = consultoria;
      target.clienteId = cliente._id;
    }

    await target.save();
    const reloaded = await User.findById(target._id).populate('clienteId', 'razaoSocial cnpj consultoria');

    return res.json({
      user: {
        ...sanitizeUser(reloaded),
        cliente: reloaded.clienteId
          ? {
              id: reloaded.clienteId._id,
              razaoSocial: reloaded.clienteId.razaoSocial,
              cnpj: reloaded.clienteId.cnpj,
              consultoria: reloaded.clienteId.consultoria,
            }
          : null,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao editar usuário.', details: err.message });
  }
};

exports.toggleManagedUserActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { actorEmail, ativo } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'id inválido.' });
    }

    const adminCheck = await ensureActorAdmin(actorEmail);
    if (!adminCheck.ok) {
      return res.status(adminCheck.status).json({ error: adminCheck.error });
    }

    const target = await User.findById(id);
    if (!target) return res.status(404).json({ error: 'Usuário não encontrado.' });

    if (!['FILHO', 'NETO'].includes(resolveRole(target))) {
      return res.status(403).json({ error: 'Somente usuários FILHO/NETO podem ser inativados.' });
    }

    target.ativo = Boolean(ativo);
    await target.save();

    return res.json({ user: sanitizeUser(target) });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar status do usuário.', details: err.message });
  }
};
