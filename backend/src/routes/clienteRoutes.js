const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

router.post('/clientes', clienteController.cadastrarCliente);
router.get('/clientes', clienteController.listarClientes);
router.patch('/clientes/:id/status', clienteController.atualizarStatus);
router.get('/clientes/:id', clienteController.detalharCliente);
router.delete('/clientes/:id', clienteController.excluirCliente);
router.put('/clientes/:id', clienteController.editarCliente);

module.exports = router;
