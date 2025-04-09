const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

// Obtener todos los tipos de usuario
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('tipoUsuario').get();
    const tipos = snapshot.docs.map(doc => doc.data());

    res.json(tipos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los tipos de usuario', detalles: err.message });
  }
});

module.exports = router;
