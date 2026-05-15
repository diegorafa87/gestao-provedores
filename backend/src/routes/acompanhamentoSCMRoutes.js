
const express = require('express');
const router = express.Router();
const acompanhamentoSCMController = require('../controllers/acompanhamentoSCMController');
// Novo: Listar histórico de geração de CSV SCM
router.get('/historico/csv', acompanhamentoSCMController.getSCMHistoricoCSV);

// Novo: Adicionar entrada ao histórico de geração de CSV SCM
router.post('/historico/csv', acompanhamentoSCMController.addSCMHistoricoCSV);

// Excluir entrada do histórico de geração de CSV SCM
router.delete('/historico/csv', acompanhamentoSCMController.deleteSCMHistoricoCSV);

// Buscar status de anos desligados/ocultos do SCM para um cliente
router.get('/:cnpj', acompanhamentoSCMController.getSCMStatus);

// Salvar status de anos desligados/ocultos do SCM para um cliente
router.post('/:cnpj', acompanhamentoSCMController.setSCMStatus);

module.exports = router;
