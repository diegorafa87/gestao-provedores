const express = require('express');
const router = express.Router();
<<<<<<< HEAD

// Aqui você pode adicionar outras rotas relacionadas a contratos, sem upload de arquivos.
=======
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pasta para uploads temporários
const uploadDir = path.join(__dirname, '../temp');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname)
});
const upload = multer({ storage });


// Utilitário de extração
const { extrairCamposContratoPostes } = require('../utils/pdfPostes');

// Controller para upload e extração de campos do contrato de postes
router.post('/contrato/postes/upload', upload.single('contrato'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Arquivo não enviado' });
  try {
    const campos = await extrairCamposContratoPostes(req.file.path);
    res.json({ success: true, file: req.file.filename, path: req.file.path, campos });
  } catch (e) {
    res.status(500).json({ error: 'Falha ao extrair campos do PDF', details: e.message });
  }
});
>>>>>>> 6f6854514f1e0dd3e13bbb58206a5c169147061c

module.exports = router;
