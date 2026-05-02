
const acompanhamentoPostesRoutes = require('./routes/acompanhamentoPostesRoutes');
const userRoutes = require('./routes/userRoutes');

// Entry point do backend
require('dotenv').config();
const express = require('express');
const cors = require('cors');
// Conexão MongoDB centralizada
const connectDB = require('./config/database');
const app = express();


// Conecta ao MongoDB
connectDB();

app.use(cors({
  origin: 'https://provedordoc-2.onrender.com'
}));
app.use(express.json());

// Rotas
const clienteRoutes = require('./routes/clienteRoutes');
const logRoutes = require('./routes/logRoutes');
const acaoRoutes = require('./routes/acaoRoutes');

const contratoRoutes = require('./routes/contratoRoutes');
const acompanhamentoSCMRoutes = require('./routes/acompanhamentoSCMRoutes');

const acompanhamentoSCMUploadRoutes = require('./routes/acompanhamentoSCMUploadRoutes');


app.use('/api', clienteRoutes);
app.use('/api/user', userRoutes);
app.use('/api', logRoutes);
app.use('/api', acaoRoutes);
app.use('/api', contratoRoutes);
app.use('/api/acompanhamento-scm', acompanhamentoSCMRoutes);
app.use('/api/acompanhamento-scm', acompanhamentoSCMUploadRoutes);
app.use('/api/acompanhamento-postes', acompanhamentoPostesRoutes);

// Rota raiz amigável
app.get('/', (req, res) => {
  res.send('API do ProvedorDoc está online!');
});


// Servir o build do React em produção
const path = require('path');
const buildPath = path.resolve(__dirname, '../../frontend/build');
app.use(express.static(buildPath));

// Rota coringa para SPA (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Porta padrão
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});
