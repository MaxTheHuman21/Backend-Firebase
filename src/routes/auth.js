const express = require('express');
const router = express.Router();
const { auth, db } = require('../firebase');
const admin = require('firebase-admin');
const axios = require('axios');

const apiKey = process.env.FIREBASE_API_KEY;

// ID válidos para tipoUsuario
const allowedTipoUsuarioIds = [1, 2, 3, 4]; // 1=alumno, 2=trabajador, 3=conductor, 4=admin

// ✅ REGISTRO DE USUARIO
router.post('/register', async (req, res) => {
  const {
    email,
    password,
    name,
    enrollmentId,
    estadoId,
    imagen,
    tipoUsuarioId
  } = req.body;

  if (
    !email ||
    !password ||
    !name ||
    !enrollmentId ||
    estadoId === undefined ||
    tipoUsuarioId === undefined
  ) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  if (!allowedTipoUsuarioIds.includes(tipoUsuarioId)) {
    return res.status(400).json({ error: 'tipoUsuarioId no permitido' });
  }

  try {
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name
    });

    const uid = userRecord.uid;

    await db.collection('usuarios').doc(uid).set({
      uid,
      email,
      nombreCompleto: name,
      matricula: enrollmentId,
      estadoId,
      imagen: imagen || '',
      tipoUsuarioId,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({ message: 'Usuario registrado con éxito', uid });
  } catch (err) {
    console.error('Error en registro:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ OBTENER PERFIL DEL USUARIO ACTUAL
router.get('/profile', async (req, res) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

  try {
    const decoded = await auth.verifyIdToken(token);
    const uid = decoded.uid;
    const userDoc = await db.collection('usuarios').doc(uid).get();

    if (!userDoc.exists) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ uid, ...userDoc.data() });
  } catch (err) {
    console.error('Error verificando token:', err.message);
    res.status(401).json({ error: 'Token inválido' });
  }
});

// ✅ LOGIN DE USUARIO
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

// ✅ RESET DE CONTRASEÑA
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: 'Correo es requerido' });

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
