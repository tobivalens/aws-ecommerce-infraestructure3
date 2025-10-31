const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'username y password requeridos' });

    const exists = await User.findOne({ where: { username } });
    if (exists)
      return res.status(400).json({ error: 'Usuario ya existe' });

    const nuevo = await User.create({ username, password });
    res.json({
      message: 'Usuario creado',
      user: { id: nuevo.id, username: nuevo.username }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'username y password requeridos' });

    const user = await User.findOne({ where: { username } });
    if (!user)
      return res.status(404).json({ error: 'Usuario no encontrado' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login OK',
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; // 👈 asegúrate que esté así
