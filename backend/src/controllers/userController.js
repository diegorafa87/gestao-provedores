// Buscar consultoria do usuário pelo e-mail
exports.getUserConsultoria = async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email é obrigatório.' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json({ consultoria: user.consultoria });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const User = require('../../models/User');

// Cria ou atualiza usuário com consultoria
exports.setUserConsultoria = async (req, res) => {
  const { email, consultoria } = req.body;
  if (!email || !consultoria) return res.status(400).json({ error: 'Email e consultoria são obrigatórios.' });
  try {
    const user = await User.findOneAndUpdate(
      { email },
      { consultoria },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
