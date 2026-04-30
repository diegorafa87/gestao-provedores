
const express = require('express');
const router = express.Router();
// const fs = require('fs');
// const path = require('path');
const User = require('../../models/User');
const { generateToken } = require('../../utils/auth');
const { existeAdmin } = require('../../utils/adminCheck');

// Verifica se existe admin cadastrado (agora via MongoDB)
router.get('/has-admin', async (req, res) => {
  try {
    const admin = await User.findOne({ type: 'admin' });
    res.json({ hasAdmin: !!admin });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao verificar admin' });
  }
});

// Funções de arquivo removidas (agora tudo via MongoDB)

// Registro de usuário (agora via MongoDB)
router.post('/register', async (req, res) => {
  const { username, password, type = 'consultoria' } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Usuário e senha obrigatórios' });
  try {
    const exists = await User.findOne({ username });
    if (exists) return res.status(409).json({ message: 'Usuário já existe' });
    const hashed = await User.hashPassword(password);
    const newUser = new User({ username, password: hashed, type });
    await newUser.save();
    res.status(201).json({ message: 'Usuário criado com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar usuário' });
  }
});

// Login (agora via MongoDB)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Usuário ou senha inválidos' });
    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: 'Usuário ou senha inválidos' });
    const token = generateToken(user);
    res.json({ token, type: user.type, username: user.username });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao fazer login' });
  }
});

module.exports = router;
