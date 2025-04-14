const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const verificarAdmin = require('../middlewares/verificarAdmin'); // middleware de seguridad

// Obtener todos los usuarios registrados (solo para administradores)
router.get('/listar', verificarAdmin, async (req, res) => {
  try {
    const snapshot = await db.collection('usuarios').get();

    const usuarios = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(usuarios);
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error.message);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
});

module.exports = router;
