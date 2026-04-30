// Rota temporária para forçar criação de admin (remover após uso!)
router.get('/force-admin', async (req, res) => {
  const username = 'Diego';
  const password = 'D13gor4f487';
  const type = 'admin';
  let users = readUsers();
  // Remove admins antigos com mesmo username
  users = users.filter(u => !(u.username === username && u.type === type));
  const hashed = await User.hashPassword(password);
  const newUser = new User({ id: Date.now(), username, password: hashed, type });
  users.push(newUser);
  writeUsers(users);
  res.json({ message: 'Usuário admin criado/atualizado com sucesso!', user: { username, type } });
});
const { existeAdmin } = require('../../utils/adminCheck');
// Verifica se existe admin cadastrado
router.get('/has-admin', (req, res) => {
  res.json({ hasAdmin: existeAdmin() });
});
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const User = require('../../models/User');
const { generateToken } = require('../../utils/auth');

const USERS_DB = path.join(__dirname, '../db_users.json');

function readUsers() {
  if (!fs.existsSync(USERS_DB)) return [];
  return JSON.parse(fs.readFileSync(USERS_DB));
}

function writeUsers(users) {
  fs.writeFileSync(USERS_DB, JSON.stringify(users, null, 2));
}

// Registro de usuário (apenas admin pode criar novos usuários)
router.post('/register', async (req, res) => {
  const { username, password, type = 'consultoria' } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Usuário e senha obrigatórios' });
  const users = readUsers();
  if (users.find(u => u.username === username)) {
    return res.status(409).json({ message: 'Usuário já existe' });
  }
  const hashed = await User.hashPassword(password);
  const newUser = new User({ id: Date.now(), username, password: hashed, type });
  users.push(newUser);
  writeUsers(users);
  res.status(201).json({ message: 'Usuário criado com sucesso' });
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ message: 'Usuário ou senha inválidos' });
  const userObj = new User(user);
  const valid = await userObj.comparePassword(password);
  if (!valid) return res.status(401).json({ message: 'Usuário ou senha inválidos' });
  const token = generateToken(user);
  res.json({ token, type: user.type, username: user.username });
});

module.exports = router;
