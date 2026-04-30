
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { authenticateToken } = require('../utils/auth');


// Todas as rotas de clientes exigem autenticação
router.post('/clientes', authenticateToken, clienteController.cadastrarCliente);
router.get('/clientes', authenticateToken, clienteController.listarClientes);
router.patch('/clientes/:id/status', authenticateToken, clienteController.atualizarStatus);
router.get('/clientes/:id', authenticateToken, clienteController.detalharCliente);
router.delete('/clientes/:id', authenticateToken, clienteController.excluirCliente);
router.put('/clientes/:id', authenticateToken, clienteController.editarCliente);

module.exports = router;
