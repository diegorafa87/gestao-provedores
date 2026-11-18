const GerenciadorAcesso = require('../models/GerenciadorAcesso');
const Cliente = require('../models/Cliente');
const User = require('../../models/User');

const ADMIN_EMAIL_FALLBACK = 'diegorafa87@gmail.com';

function normalizarCnpj(valor = '') {
  return String(valor).replace(/\D/g, '');
}

function acessoCompleto(acesso) {
  return Boolean(
    String(acesso?.link || '').trim() &&
    String(acesso?.login || '').trim() &&
    String(acesso?.senha || '').trim()
  );
}

exports.getStatusAcessos = async (req, res) => {
  try {
    const email = String(req.headers['x-user-email'] || '').trim();
    if (!email) return res.status(401).json({ error: 'Usuário não autenticado.' });

    const user = await User.findOne({ email }).lean();
    const role = user?.role || (email.toLowerCase() === ADMIN_EMAIL_FALLBACK ? 'ADMIN' : '');
    if (!user && role !== 'ADMIN') {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }
    if (!['ADMIN', 'FILHO', 'NETO'].includes(role)) {
      return res.status(403).json({ error: 'Acesso não autorizado.' });
    }

    const filtroClientes = {};
    if (role === 'FILHO') filtroClientes.consultoria = user.consultoria;
    if (role === 'NETO') {
      if (!user.clienteId) return res.json([]);
      filtroClientes._id = user.clienteId;
    }

    const clientes = await Cliente.find(filtroClientes)
      .select('razaoSocial cnpj telefone telefoneResponsavel responsavel status')
      .lean();
    const cnpjSolicitado = normalizarCnpj(req.query.cnpj || '');
    const clientesVisiveis = cnpjSolicitado
      ? clientes.filter(cliente => normalizarCnpj(cliente.cnpj) === cnpjSolicitado)
      : clientes;

    if (cnpjSolicitado && clientesVisiveis.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    const cnpjs = [...new Set(clientesVisiveis.flatMap(cliente => [
      String(cliente.cnpj || ''),
      normalizarCnpj(cliente.cnpj)
    ]).filter(Boolean))];
    const acessos = cnpjs.length
      ? await GerenciadorAcesso.find({ cnpj: { $in: cnpjs } })
        .select('cnpj link login senha')
        .lean()
      : [];
    const cnpjsComAcessoCompleto = new Set(
      acessos
        .filter(acessoCompleto)
        .map(acesso => normalizarCnpj(acesso.cnpj))
    );

    if (cnpjSolicitado) {
      const cliente = clientesVisiveis[0];
      return res.json({
        cnpj: normalizarCnpj(cliente.cnpj),
        completo: cnpjsComAcessoCompleto.has(normalizarCnpj(cliente.cnpj))
      });
    }

    res.json(clientesVisiveis
      .filter(cliente => !cnpjsComAcessoCompleto.has(normalizarCnpj(cliente.cnpj)))
      .map(({ razaoSocial, cnpj, telefone, telefoneResponsavel, responsavel, status }) => ({
        razaoSocial,
        cnpj,
        telefone,
        telefoneResponsavel,
        responsavel,
        status
      })));
  } catch (err) {
    res.status(500).json({ error: 'Erro ao verificar acessos do gerenciador.', details: err.message });
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
