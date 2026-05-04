// Endpoint temporário para listar todos os usuários
router.get('/all', userController.listAllUsers);
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rota para criar/atualizar consultoria do usuário
router.post('/set-consultoria', userController.setUserConsultoria);
router.get('/consultoria', userController.getUserConsultoria);

module.exports = router;
