// backend/src/config/database.js
const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/provedores';

function connectDB() {
  mongoose.connect(MONGO_URL);
  mongoose.connection.on('connected', () => {
    console.log('[MongoDB] Conectado com sucesso!');
  });
  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] Erro de conexão:', err);
  });
}

module.exports = connectDB;
