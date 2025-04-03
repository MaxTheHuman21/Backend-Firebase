const express = require('express');
const router = express.Router();
const { auth, db } = require('../firebase');
const admin = require('firebase-admin');
const axios = require('axios');

const apiKey = process.env.FIREBASE_API_KEY;

// Lista de roles permitidos
const allowedRoles = ['estudiante', 'profesor', 'admin'];

// REGISTRO
router.post('/register', async (req, res) => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: 'Rol no permitido' });
  }

  try {
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name
    });

    const uid = userRecord.uid;

    await db.collection('users').doc(uid).set({
      name,
      email,
      role,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({ message: 'Usuario registrado con éxito', uid });
  } catch (err) {
    console.error('Error en registro:', err.message);
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
    console.error('Error verificando token:', err.message);
    res.status(401).json({ error: 'Token inválido' });
  }
});

// LOGIN DE USUARIO
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        email,
        password,
        returnSecureToken: true
      }
    );

    const { idToken, refreshToken, expiresIn, localId } = response.data;

    res.json({
      message: 'Login exitoso',
      uid: localId,
      idToken,
      refreshToken,
      expiresIn
    });
  } catch (err) {
    console.error('Error en login:', err.response?.data?.error?.message || err.message);
    res.status(401).json({
      error: err.response?.data?.error?.message || 'Credenciales inválidas o usuario no existe'
    });
  }
});

// RESET DE CONTRASEÑA
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: 'Email es requerido' });

  try {
    await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
      {
        requestType: 'PASSWORD_RESET',
        email
      }
    );

    res.json({ message: 'Correo de restablecimiento enviado con éxito' });
  } catch (err) {
    console.error('Error en reset-password:', err.response?.data?.error?.message || err.message);
    res.status(400).json({
      error: err.response?.data?.error?.message || 'No se pudo enviar el correo de recuperación'
    });
  }
});

module.exports = router;
