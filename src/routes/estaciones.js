const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

// Crear una nueva estación
router.post('/', async (req, res) => {
  const { estacionId, rutaId, estadoId, latitud, longitud, nombre, tipoEstacionId } = req.body;

  if (!estacionId || !rutaId || estadoId === undefined || !latitud || !longitud || !nombre || !tipoEstacionId) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    await db.collection('estaciones').doc(estacionId).set({
      estacionId,
      rutaId,
      estadoId,
      latitud,
      longitud,
      nombre,
      tipoEstacionId,
      createdAt: new Date()
    });

    res.status(201).json({ message: 'Estación registrada correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar la estación', detalles: err.message });
  }
});

// Obtener todas las estaciones
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('estaciones').get();
    const estaciones = snapshot.docs.map(doc => doc.data());

    res.json(estaciones);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener estaciones' });
  }
});

// Actualizar una estación
router.put('/:estacionId', async (req, res) => {
  const { estacionId } = req.params;
  const { rutaId, estadoId, latitud, longitud, nombre, tipoEstacionId } = req.body;

  try {
    const estRef = db.collection('estaciones').doc(estacionId);
    const doc = await estRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Estación no encontrada' });
    }

    await estRef.update({
      rutaId,
      estadoId,
      latitud,
      longitud,
      nombre,
      tipoEstacionId,
      updatedAt: new Date()
    });

    res.json({ message: 'Estación actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar la estación', detalles: err.message });
  }
});

module.exports = router;
