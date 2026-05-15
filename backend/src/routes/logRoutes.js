const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

router.get('/logs', logController.listarLogs);
router.get('/logs/meses/:cnpj', logController.getMesesComDados);

module.exports = router;
