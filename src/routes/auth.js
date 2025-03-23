// routes/auth.js
const express = require('express');
const router = express.Router();
const { auth, db } = require('../firebase');

// REGISTRO
router.post('/register', async (req, res) => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    const userRecord = await auth.createUser({ email, password, displayName: name });
    const uid = userRecord.uid;

    await db.collection('users').doc(uid).set({
      name,
      email,
      role,
      createdAt: new Date()
    });

    res.status(201).json({ message: 'Usuario registrado con éxito', uid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// VERIFICAR TOKEN Y OBTENER PERFIL
router.get('/profile', async (req, res) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

  try {
    const decoded = await auth.verifyIdToken(token);
    const uid = decoded.uid;
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ uid, ...userDoc.data() });
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

module.exports = router;
