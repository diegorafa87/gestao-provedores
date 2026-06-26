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

function buildLoginBaseFromCliente(cliente) {
  const cnpjDigits = String(cliente?.cnpj || '').replace(/\D/g, '');
  if (cnpjDigits) return `cliente${cnpjDigits.slice(-8)}`;

  const emailPrefix = String(cliente?.email || '')
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  if (emailPrefix) return `cliente${emailPrefix}`;
  return `cliente${Date.now()}`;
}

async function generateUniqueLogin(baseLogin) {
  let candidate = baseLogin;
  let suffix = 1;

  while (await User.findOne({ login: candidate })) {
    candidate = `${baseLogin}${suffix}`;
    suffix += 1;
  }

  return candidate;
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

exports.createClientLogin = async (req, res) => {
  try {
    const { actorEmail, clienteId, senha, login, email, nome } = req.body;

    if (!actorEmail || !clienteId || !senha) {
      return res.status(400).json({ error: 'actorEmail, clienteId e senha são obrigatórios.' });
    }

    if (!mongoose.Types.ObjectId.isValid(clienteId)) {
      return res.status(400).json({ error: 'clienteId inválido.' });
    }

    if (String(senha).length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    const adminCheck = await ensureActorAdmin(actorEmail);
    if (!adminCheck.ok) {
      return res.status(adminCheck.status).json({ error: adminCheck.error });
    }

    const cliente = await Cliente.findById(clienteId);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    const existingNeto = await User.findOne({ clienteId: cliente._id, role: 'NETO' });
    if (existingNeto) {
      return res.status(409).json({ error: 'Este cliente já possui login cadastrado.' });
    }

    const finalEmail = (email || cliente.email || '').trim().toLowerCase();
    if (!finalEmail) {
      return res.status(400).json({ error: 'E-mail é obrigatório para criar o login do cliente.' });
    }

    const emailInUse = await User.findOne({ email: finalEmail });
    if (emailInUse) {
      const role = resolveRole(emailInUse);

      if (role === 'ADMIN') {
        return res.status(409).json({ error: 'Esse e-mail já pertence a um usuário ADMIN.' });
      }

      if (role === 'FILHO') {
        return res.status(409).json({ error: 'Esse e-mail já pertence a um usuário FILHO.' });
      }

      if (role === 'NETO') {
        if (emailInUse.clienteId && String(emailInUse.clienteId) !== String(cliente._id)) {
          return res.status(409).json({
            error: 'Esse e-mail já está vinculado a outro cliente. Use outro e-mail ou ajuste o usuário existente.',
          });
        }

        let finalLogin = (login || '').trim().toLowerCase();
        if (finalLogin && finalLogin !== emailInUse.login) {
          const loginInUse = await User.findOne({ login: finalLogin });
          if (loginInUse) {
            return res.status(409).json({ error: 'Já existe usuário com esse login.' });
          }
          emailInUse.login = finalLogin;
        }

        if (!finalLogin && !emailInUse.login) {
          const baseLogin = buildLoginBaseFromCliente(cliente);
          finalLogin = await generateUniqueLogin(baseLogin);
          emailInUse.login = finalLogin;
        }

        emailInUse.role = 'NETO';
        emailInUse.clienteId = cliente._id;
        emailInUse.consultoria = cliente.consultoria || emailInUse.consultoria;
        emailInUse.nome = (nome || emailInUse.nome || cliente.razaoSocial || '').trim();
        emailInUse.parentUserId = emailInUse.parentUserId || adminCheck.actor._id;
        emailInUse.ativo = true;
        emailInUse.passwordHash = await bcrypt.hash(senha, 10);
        await emailInUse.save();

        return res.status(200).json({
          message: 'Login existente vinculado ao cliente e senha definida com sucesso!',
          user: sanitizeUser(emailInUse),
        });
      }

      return res.status(409).json({ error: 'Já existe usuário com esse e-mail.' });
    }

    let finalLogin = (login || '').trim().toLowerCase();
    if (finalLogin) {
      const loginInUse = await User.findOne({ login: finalLogin });
      if (loginInUse) {
        return res.status(409).json({ error: 'Já existe usuário com esse login.' });
      }
    } else {
      const baseLogin = buildLoginBaseFromCliente(cliente);
      finalLogin = await generateUniqueLogin(baseLogin);
    }

    const passwordHash = await bcrypt.hash(senha, 10);

    const netoUser = await User.create({
      nome: (nome || cliente.razaoSocial || '').trim(),
      login: finalLogin,
      email: finalEmail,
      role: 'NETO',
      consultoria: cliente.consultoria || '',
      clienteId: cliente._id,
      parentUserId: adminCheck.actor._id,
      ativo: true,
      passwordHash,
    });

    return res.status(201).json({
      message: 'Login do cliente criado com sucesso!',
      user: sanitizeUser(netoUser),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao criar login do cliente.', details: err.message });
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

exports.resetPasswordNeto = async (req, res) => {
  try {
    const { actorEmail, clienteId, novaSenha } = req.body;

    if (!actorEmail || !clienteId || !novaSenha) {
      return res.status(400).json({
        error: 'actorEmail, clienteId e novaSenha são obrigatórios.',
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

    let createdInReset = false;

    // Busca usuário NETO associado a esse cliente
    let netoUser = await User.findOne({ clienteId, role: 'NETO' });

    // Compatibilidade: usuário antigo sem vínculo de cliente, mas com mesmo e-mail
    if (!netoUser && cliente.email) {
      const userByEmail = await User.findOne({ email: cliente.email });
      if (userByEmail) {
        const role = resolveRole(userByEmail);
        if (role === 'ADMIN') {
          return res.status(409).json({ error: 'E-mail do cliente já está vinculado a um usuário ADMIN.' });
        }

        userByEmail.role = 'NETO';
        userByEmail.consultoria = cliente.consultoria || userByEmail.consultoria;
        userByEmail.clienteId = cliente._id;
        userByEmail.ativo = true;
        netoUser = await userByEmail.save();
      }
    }

    // Se não existir usuário para o cliente, cria automaticamente
    if (!netoUser) {
      const baseLogin = buildLoginBaseFromCliente(cliente);
      const login = await generateUniqueLogin(baseLogin);

      const existingEmail = await User.findOne({ email: cliente.email });
      if (existingEmail) {
        return res.status(409).json({
          error: 'Já existe usuário com o e-mail do cliente. Edite o usuário ou altere o e-mail do cliente para continuar.',
        });
      }

      const initialPasswordHash = await bcrypt.hash(novaSenha, 10);
      netoUser = await User.create({
        nome: cliente.razaoSocial || '',
        login,
        email: cliente.email,
        role: 'NETO',
        consultoria: cliente.consultoria || '',
        clienteId: cliente._id,
        parentUserId: adminCheck.actor._id,
        ativo: true,
        passwordHash: initialPasswordHash,
      });
      createdInReset = true;
    }

    // Atualiza senha
    if (!createdInReset) {
      const passwordHash = await bcrypt.hash(novaSenha, 10);
      netoUser.passwordHash = passwordHash;
      await netoUser.save();
    }

    return res.json({ 
      message: 'Senha resetada com sucesso!',
      user: sanitizeUser(netoUser) 
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao resetar senha.', details: err.message });
  }
};
