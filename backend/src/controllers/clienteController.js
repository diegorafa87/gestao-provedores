const mongoose = require('mongoose');
const Cliente = require('../models/Cliente');
const User = require('../../models/User');
const { registrarLog } = require('./logController');

const ADMIN_EMAIL_FALLBACK = 'diegorafa87@gmail.com';

function resolveRole(user) {
  if (!user) return 'ADMIN';
  if (user?.role) return user.role;
  return user?.email === ADMIN_EMAIL_FALLBACK ? 'ADMIN' : 'FILHO';
}

async function getUserFromHeader(req) {
  const email = req.headers['x-user-email'];
  if (!email) return null;
  return User.findOne({ email });
}

function userCanAccessCliente(user, cliente) {
  const role = resolveRole(user);
  if (role === 'ADMIN') return true;
  if (role === 'FILHO') return (cliente.consultoria || '') === (user?.consultoria || '');
  if (role === 'NETO') return String(user?.clienteId || '') === String(cliente?._id || '');
  return false;
}

exports.cadastrarCliente = async (req, res) => {
  try {
    let { razaoSocial, cnpj, email, telefone, consultoria } = req.body;
    const user = await getUserFromHeader(req);
    const role = resolveRole(user);

    if (role === 'NETO') {
      return res.status(403).json({ error: 'Usuário NETO não pode cadastrar clientes.' });
    }

    if (role === 'FILHO') {
      consultoria = user.consultoria;
    }

    if (!razaoSocial || !cnpj || !email || !telefone || !consultoria) {
      return res.status(400).json({ error: 'Preencha todos os campos!' });
    }

    const existeCnpj = await Cliente.findOne({ cnpj });
    if (existeCnpj) return res.status(409).json({ error: 'CNPJ já cadastrado!' });

    const existeRazao = await Cliente.findOne({ razaoSocial: { $regex: `^${razaoSocial}$`, $options: 'i' } });
    if (existeRazao) return res.status(409).json({ error: 'Razão Social já cadastrada!' });

    const novoCliente = await Cliente.create({ razaoSocial, cnpj, email, telefone, consultoria });
    registrarLog('CADASTRAR_CLIENTE', cnpj, { razaoSocial, email, telefone, consultoria });
    res.status(201).json(novoCliente);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cadastrar cliente', details: err.message });
  }
};

exports.listarClientes = async (req, res) => {
  try {
    const { consultoria } = req.query;
    let filtro = {};

    const user = await getUserFromHeader(req);
    const role = resolveRole(user);

    if (role === 'FILHO') {
      filtro.consultoria = user.consultoria;
    }

    if (role === 'NETO') {
      if (!user?.clienteId) return res.json([]);
      filtro._id = user.clienteId;
    }

    if (consultoria) {
      filtro.consultoria = consultoria;
    }

    const clientes = await Cliente.find(filtro);
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar clientes', details: err.message });
  }
};

exports.atualizarStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de cliente inválido' });
    }

    if (!['NOVO', 'ATIVO', 'CORRIGIR', 'SUSPENSO'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    if (status === 'NOVO') {
      return res.status(400).json({ error: 'Status NOVO só pode ser atribuído no cadastro do cliente.' });
    }

    const user = await getUserFromHeader(req);
    const clienteAtual = await Cliente.findById(id);
    if (!clienteAtual) return res.status(404).json({ error: 'Cliente não encontrado' });

    if (!userCanAccessCliente(user, clienteAtual)) {
      return res.status(403).json({ error: 'Acesso negado para alterar status deste cliente.' });
    }

    const cliente = await Cliente.findByIdAndUpdate(id, { status }, { new: true });
    registrarLog('ATUALIZAR_STATUS', cliente.cnpj, { id, status });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar status', details: err.message });
  }
};

exports.detalharCliente = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de cliente inválido' });
    }

    const user = await getUserFromHeader(req);
    const cliente = await Cliente.findById(id);
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' });

    if (!userCanAccessCliente(user, cliente)) {
      return res.status(403).json({ error: 'Acesso negado para este cliente.' });
    }

    res.json(cliente);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao detalhar cliente', details: err.message });
  }
};

exports.excluirCliente = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de cliente inválido' });
    }

    const user = await getUserFromHeader(req);
    const clienteAtual = await Cliente.findById(id);
    if (!clienteAtual) return res.status(404).json({ error: 'Cliente não encontrado' });

    if (!userCanAccessCliente(user, clienteAtual)) {
      return res.status(403).json({ error: 'Acesso negado para excluir este cliente.' });
    }

    await Cliente.findByIdAndDelete(id);
    registrarLog('EXCLUIR_CLIENTE', id, {});
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir cliente', details: err.message });
  }
};

exports.editarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    let { razaoSocial, cnpj, email, telefone, consultoria } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de cliente inválido' });
    }

    const user = await getUserFromHeader(req);
    const role = resolveRole(user);

    const clienteAtual = await Cliente.findById(id);
    if (!clienteAtual) return res.status(404).json({ error: 'Cliente não encontrado' });

    if (!userCanAccessCliente(user, clienteAtual)) {
      return res.status(403).json({ error: 'Acesso negado para editar este cliente.' });
    }

    if (role === 'FILHO') {
      consultoria = user.consultoria;
    }

    if (!razaoSocial || !cnpj || !email || !telefone || !consultoria) {
      return res.status(400).json({ error: 'Preencha todos os campos!' });
    }

    const cliente = await Cliente.findByIdAndUpdate(
      id,
      { razaoSocial, cnpj, email, telefone, consultoria },
      { new: true }
    );

    registrarLog('EDITAR_CLIENTE', cnpj, { id, razaoSocial, email, telefone, consultoria });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao editar cliente', details: err.message });
  }
};

exports.atualizarObservacao = async (req, res) => {
  try {
    const { id } = req.params;
    const { observacao } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de cliente inválido' });
    }

    const user = await getUserFromHeader(req);
    const clienteAtual = await Cliente.findById(id);
    if (!clienteAtual) return res.status(404).json({ error: 'Cliente não encontrado' });

    if (!userCanAccessCliente(user, clienteAtual)) {
      return res.status(403).json({ error: 'Acesso negado para atualizar observação deste cliente.' });
    }

    const cliente = await Cliente.findByIdAndUpdate(id, { observacao }, { new: true });
    registrarLog && registrarLog('ATUALIZAR_OBSERVACAO', cliente.cnpj, { id, observacao });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar observação', details: err.message });
  }
};
