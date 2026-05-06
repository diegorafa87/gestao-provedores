const express = require('express');
const router = express.Router();
const controller = require('../controllers/gerenciadorAcessoController');

router.get('/:cnpj', controller.getAcesso);
router.post('/:cnpj', controller.saveAcesso);

module.exports = router;
