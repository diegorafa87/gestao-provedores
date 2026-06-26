const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017/provedores';

async function criarAdmin() {
  await mongoose.connect(MONGO_URL);
  const email = 'diegorafa87@gmail.com';
  const senha = 'D13gor4f487';
  const passwordHash = await bcrypt.hash(senha, 10);

  const user = await User.findOneAndUpdate(
    { email },
    {
      email,
      login: 'diegorafa87@gmail.com',
      nome: 'Diego',
      role: 'ADMIN',
      passwordHash,
      ativo: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('Admin criado/atualizado:', user);
  await mongoose.disconnect();
}

criarAdmin().catch(err => {
  console.error('Erro:', err);
  mongoose.disconnect();
});
