const express = require('express');
const router = express.Router();
const acompanhamentoPostesController = require('../controllers/acompanhamentoPostesController');

// Buscar status de anos desligados/ocultos do Postes para um cliente
router.get('/:cnpj', acompanhamentoPostesController.getPostesStatus);

// Salvar status de anos desligados/ocultos do Postes para um cliente
router.post('/:cnpj', acompanhamentoPostesController.setPostesStatus);

module.exports = router;
