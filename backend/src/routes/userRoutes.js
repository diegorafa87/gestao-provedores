const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Endpoint temporário para listar todos os usuários
router.get('/all', userController.listAllUsers);

// Rota para criar/atualizar consultoria do usuário
router.post('/set-consultoria', userController.setUserConsultoria);
router.get('/consultoria', userController.getUserConsultoria);
router.get('/scope', userController.getUserScope);
router.post('/create-child', userController.createChildUser);
router.post('/create-grandchild', userController.createGrandchildUser);
router.post('/create-client-login', userController.createClientLogin);
router.get('/managed', userController.listManagedUsers);
router.put('/managed/:id', userController.updateManagedUser);
router.patch('/managed/:id/active', userController.toggleManagedUserActive);
router.delete('/managed/:id', userController.deleteManagedUser);
router.post('/reset-password-neto', userController.resetPasswordNeto);

module.exports = router;
