const express = require('express');
const router = express.Router();
const acompanhamentoSCMController = require('../controllers/acompanhamentoSCMController');

// Buscar status de anos desligados/ocultos do SCM para um cliente
router.get('/:cnpj', acompanhamentoSCMController.getSCMStatus);

// Salvar status de anos desligados/ocultos do SCM para um cliente
router.post('/:cnpj', acompanhamentoSCMController.setSCMStatus);

module.exports = router;
