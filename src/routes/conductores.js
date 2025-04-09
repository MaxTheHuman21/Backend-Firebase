const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

// Registrar un nuevo conductor
router.post('/', async (req, res) => {
  const { conductorId, nombreCompleto, fechaNacimiento, fotoUrl, estadoId } = req.body;

  if (!conductorId || !nombreCompleto || !fechaNacimiento || !fotoUrl || estadoId === undefined) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    await db.collection('conductores').doc(conductorId).set({
      conductorId,
      nombreCompleto,
      fechaNacimiento,
      fotoUrl,
      estadoId,
      creadoEn: new Date()
    });

    res.status(201).json({ message: 'Conductor registrado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar el conductor', detalles: err.message });
  }
});

// Obtener todos los conductores
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('conductores').get();
    const conductores = snapshot.docs.map(doc => doc.data());

    res.json(conductores);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener conductores' });
  }
});

// Actualizar datos de un conductor
router.put('/:conductorId', async (req, res) => {
  const { conductorId } = req.params;
  const { nombreCompleto, fechaNacimiento, fotoUrl, estadoId } = req.body;

  try {
    const ref = db.collection('conductores').doc(conductorId);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Conductor no encontrado' });
    }

    await ref.update({
      nombreCompleto,
      fechaNacimiento,
      fotoUrl,
      estadoId,
      actualizadoEn: new Date()
    });

    res.json({ message: 'Conductor actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el conductor', detalles: err.message });
  }
});

module.exports = router;
