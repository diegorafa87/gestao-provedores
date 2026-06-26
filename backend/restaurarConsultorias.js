const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

// Usar MongoDB local diretamente
const MONGO_URL = 'mongodb://localhost:27017/provedores';

async function restaurarConsultorias() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('Conectado ao MongoDB...');

    // Criar usuário RENIO
    const emailRenio = 'reniosouza@icloud.com';
    const consultoriaRenio = 'RENIO';
    const senhaRenio = 'Renioric4';
    const passwordHashRenio = await bcrypt.hash(senhaRenio, 10);

    const userRenio = await User.findOneAndUpdate(
      { email: emailRenio },
      { consultoria: consultoriaRenio, passwordHash: passwordHashRenio },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log('✅ Usuário RENIO criado/atualizado:', userRenio.email, '-', userRenio.consultoria);

    // Criar usuário CAIO
    const emailCaio = 'caio@provedores.com';
    const consultoriaCaio = 'CAIO';
    const senhaCaio = 'Caio123456';
    const passwordHashCaio = await bcrypt.hash(senhaCaio, 10);

    const userCaio = await User.findOneAndUpdate(
      { email: emailCaio },
      { consultoria: consultoriaCaio, passwordHash: passwordHashCaio },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log('✅ Usuário CAIO criado/atualizado:', userCaio.email, '-', userCaio.consultoria);

    console.log('\n✅ Consultorias RENIO e CAIO restauradas com sucesso!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Erro ao restaurar consultorias:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

restaurarConsultorias();
