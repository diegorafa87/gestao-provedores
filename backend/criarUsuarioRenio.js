const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017/provedores';

async function criarUsuario() {
  await mongoose.connect(MONGO_URL);
  const email = 'reniosouza@icloud.com';
  const consultoria = 'RENIO';
  const senha = 'Renioric4';
  const passwordHash = await bcrypt.hash(senha, 10);

  const user = await User.findOneAndUpdate(
    { email },
    { consultoria, passwordHash },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('Usuário criado/atualizado:', user);
  await mongoose.disconnect();
}

criarUsuario().catch(err => {
  console.error('Erro ao criar usuário:', err);
  mongoose.disconnect();
});
