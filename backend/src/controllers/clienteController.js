


const Cliente = require('../models/Cliente');
const { registrarLog } = require('./logController');

exports.cadastrarCliente = async (req, res) => {
  try {
    const { razaoSocial, cnpj, email, telefone, consultoria } = req.body;
    if (!razaoSocial || !cnpj || !email || !telefone || !consultoria) {
      return res.status(400).json({ error: 'Preencha todos os campos!' });
    }
    // Verifica duplicidade de CNPJ ou Razão Social
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
    const clientes = await Cliente.find();
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar clientes', details: err.message });
  }
};

exports.atualizarStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['NOVO','ATIVO','CORRIGIR','SUSPENSO'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }
    // Impede que o status volte para NOVO após o cadastro
    if (status === 'NOVO') {
      return res.status(400).json({ error: 'Status NOVO só pode ser atribuído no cadastro do cliente.' });
    }
    const cliente = await Cliente.findByIdAndUpdate(id, { status }, { new: true });
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' });
    registrarLog('ATUALIZAR_STATUS', cliente.cnpj, { id, status });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar status', details: err.message });
  }
};

exports.detalharCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findById(id);
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao detalhar cliente', details: err.message });
  }
};

exports.excluirCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByIdAndDelete(id);
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' });
    registrarLog('EXCLUIR_CLIENTE', id, {});
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir cliente', details: err.message });
  }
};

exports.editarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { razaoSocial, cnpj, email, telefone, consultoria } = req.body;
    if (!razaoSocial || !cnpj || !email || !telefone || !consultoria) {
      return res.status(400).json({ error: 'Preencha todos os campos!' });
    }
    const cliente = await Cliente.findByIdAndUpdate(id, { razaoSocial, cnpj, email, telefone, consultoria }, { new: true });
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' });
    registrarLog('EDITAR_CLIENTE', cnpj, { id, razaoSocial, email, telefone, consultoria });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao editar cliente', details: err.message });
  }
};
