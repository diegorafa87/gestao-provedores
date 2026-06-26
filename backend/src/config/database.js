// backend/src/config/database.js
const mongoose = require('mongoose');

const PRIMARY_MONGO_URL = process.env.MONGO_URL || process.env.MONGODB_URI;
const FALLBACK_MONGO_URL = 'mongodb://localhost:27017/provedores';
const MONGO_URL = PRIMARY_MONGO_URL || FALLBACK_MONGO_URL;

function connectDB() {
  mongoose
    .connect(MONGO_URL)
    .then(() => {
      console.log('[MongoDB] Conectado com sucesso!');
    })
    .catch((err) => {
      console.error('[MongoDB] Erro de conexão:', err);
      if (PRIMARY_MONGO_URL && PRIMARY_MONGO_URL !== FALLBACK_MONGO_URL) {
        console.log('[MongoDB] Tentando fallback para Mongo local...');
        mongoose
          .connect(FALLBACK_MONGO_URL)
          .then(() => {
            console.log('[MongoDB] Conectado ao Mongo local com sucesso!');
          })
          .catch((fallbackErr) => {
            console.error('[MongoDB] Erro de fallback local:', fallbackErr);
          });
      }
    });

  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] Erro de conexão:', err);
  });
}

module.exports = connectDB;
