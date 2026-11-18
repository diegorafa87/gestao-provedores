const GerenciadorAcesso = require('../models/GerenciadorAcesso');
const Cliente = require('../models/Cliente');
const User = require('../../models/User');

const ADMIN_EMAIL_FALLBACK = 'diegorafa87@gmail.com';

function normalizarCnpj(valor = '') {
  return String(valor).replace(/\D/g, '');
}

function obterCompetenciaAtual() {
  const agora = new Date();
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;
}

function validarCompetencia(valor) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(String(valor || ''));
}

function acessoCompleto(acesso) {
  return Boolean(
    String(acesso?.link || '').trim() &&
    String(acesso?.login || '').trim() &&
    String(acesso?.senha || '').trim()
  );
}

async function obterClienteAutorizado(req, res, cnpj) {
  const email = String(req.headers['x-user-email'] || '').trim();
  if (!email) {
    res.status(401).json({ error: 'Usuário não autenticado.' });
    return null;
  }

  const user = await User.findOne({ email }).lean();
  const role = user?.role || (email.toLowerCase() === ADMIN_EMAIL_FALLBACK ? 'ADMIN' : '');
  if (!user && role !== 'ADMIN') {
    res.status(401).json({ error: 'Usuário não autenticado.' });
    return null;
  }
  if (!['ADMIN', 'FILHO', 'NETO'].includes(role)) {
    res.status(403).json({ error: 'Acesso não autorizado.' });
    return null;
  }

  const filtroClientes = {};
  if (role === 'FILHO') filtroClientes.consultoria = user.consultoria;
  if (role === 'NETO') {
    if (!user.clienteId) {
      res.status(404).json({ error: 'Cliente não encontrado.' });
      return null;
    }
    filtroClientes._id = user.clienteId;
  }

  const clientes = await Cliente.find(filtroClientes)
    .select('razaoSocial cnpj telefone telefoneResponsavel responsavel')
    .lean();
  const cnpjLimpo = normalizarCnpj(cnpj);
  const cliente = clientes.find(item => normalizarCnpj(item.cnpj) === cnpjLimpo);
  if (!cliente) {
    res.status(404).json({ error: 'Cliente não encontrado.' });
    return null;
  }

  return cliente;
}

async function obterAcessosDoCliente(cliente) {
  const cnpjs = [...new Set([String(cliente.cnpj || ''), normalizarCnpj(cliente.cnpj)].filter(Boolean))];
  return GerenciadorAcesso.find({ cnpj: { $in: cnpjs } })
    .select('cnpj link login senha diciSolicitadoCompetencia')
    .lean();
}

exports.getStatusAcessos = async (req, res) => {
  try {
    const cliente = await obterClienteAutorizado(req, res, req.query.cnpj);
    if (!cliente) return;

    const competencia = req.query.competencia || obterCompetenciaAtual();
    if (!validarCompetencia(competencia)) {
      return res.status(400).json({ error: 'Competência inválida.' });
    }

    const acessos = await obterAcessosDoCliente(cliente);
    res.json({
      cnpj: normalizarCnpj(cliente.cnpj),
      completo: acessos.some(acessoCompleto),
      solicitadoNesteMes: acessos.some(acesso => acesso.diciSolicitadoCompetencia === competencia),
      telefone: cliente.telefone || '',
      telefoneResponsavel: cliente.telefoneResponsavel || '',
      responsavel: cliente.responsavel || ''
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao verificar acesso do gerenciador.', details: err.message });
  }
};

exports.marcarDiciSolicitado = async (req, res) => {
  try {
    const cliente = await obterClienteAutorizado(req, res, req.params.cnpj);
    if (!cliente) return;

    const competencia = String(req.body?.competencia || '');
    if (!validarCompetencia(competencia)) {
      return res.status(400).json({ error: 'Competência inválida.' });
    }

    const acessos = await obterAcessosDoCliente(cliente);
    if (acessos.some(acessoCompleto)) {
      return res.status(409).json({ error: 'Este cliente já tem os dados do GERENCIADOR completos.' });
    }

    const cnpjLimpo = normalizarCnpj(cliente.cnpj);
    await GerenciadorAcesso.findOneAndUpdate(
      { cnpj: cnpjLimpo },
      { $set: { diciSolicitadoCompetencia: competencia, diciSolicitadoEm: new Date() } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, solicitadoNesteMes: true, competencia });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao registrar solicitação de DICI.', details: err.message });
  }
};

// Buscar acesso por CNPJ
exports.getAcesso = async (req, res) => {
  try {
    const { cnpj } = req.params;
    const doc = await GerenciadorAcesso.findOne({ cnpj });
    if (!doc) return res.json({ link: '', login: '', senha: '' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar acesso', details: err.message });
  }
};

// Salvar acesso (cria ou atualiza)
exports.saveAcesso = async (req, res) => {
  try {
    const { cnpj } = req.params;
    const { link, login, senha, atualizadoPor } = req.body;
    const doc = await GerenciadorAcesso.findOneAndUpdate(
      { cnpj },
      { $set: { link, login, senha, atualizadoPor, atualizadoEm: new Date() } },
      { upsert: true, new: true }
    );
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar acesso', details: err.message });
  }
};
