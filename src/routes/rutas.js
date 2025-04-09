const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

// Crear una nueva ruta
router.post('/', async (req, res) => {
  const { rutaId, numeroRuta, nombreRuta, estadoId } = req.body;

  if (!rutaId || !numeroRuta || !nombreRuta || estadoId === undefined) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    await db.collection('rutas').doc(rutaId).set({
      rutaId,
      numeroRuta,
      nombreRuta,
      estadoId,
      createdAt: new Date()
    });

    res.status(201).json({ message: 'Ruta registrada correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar la ruta', detalles: err.message });
  }
});

// Obtener todas las rutas
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('rutas').get();
    const rutas = snapshot.docs.map(doc => doc.data());

    res.json(rutas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener las rutas' });
  }
});

// Actualizar una ruta
router.put('/:rutaId', async (req, res) => {
  const { rutaId } = req.params;
  const { numeroRuta, nombreRuta, estadoId } = req.body;

  try {
    const rutaRef = db.collection('rutas').doc(rutaId);
    const doc = await rutaRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Ruta no encontrada' });
    }

    await rutaRef.update({
      numeroRuta,
      nombreRuta,
      estadoId,
      updatedAt: new Date()
    });

    res.json({ message: 'Ruta actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar la ruta', detalles: err.message });
  }
});

module.exports = router;
