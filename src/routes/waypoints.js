const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

// Registrar un nuevo waypoint
router.post('/', async (req, res) => {
  const { waypointId, rutaId, latitud, longitud, orden, estadoId } = req.body;

  if (!waypointId || !rutaId || latitud === undefined || longitud === undefined || orden === undefined || estadoId === undefined) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    await db.collection('waypoints').doc(waypointId).set({
      waypointId,
      rutaId,
      latitud,
      longitud,
      orden,
      estadoId,
      creadoEn: new Date()
    });

    res.status(201).json({ message: 'Waypoint registrado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar el waypoint', detalles: err.message });
  }
});

// Obtener todos los waypoints
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('waypoints').get();
    const waypoints = snapshot.docs.map(doc => doc.data());

    res.json(waypoints);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los waypoints' });
  }
});

// Actualizar un waypoint existente
router.put('/:waypointId', async (req, res) => {
  const { waypointId } = req.params;
  const { rutaId, latitud, longitud, orden, estadoId } = req.body;

  try {
    const ref = db.collection('waypoints').doc(waypointId);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Waypoint no encontrado' });
    }

    await ref.update({
      rutaId,
      latitud,
      longitud,
      orden,
      estadoId,
      actualizadoEn: new Date()
    });

    res.json({ message: 'Waypoint actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el waypoint', detalles: err.message });
  }
});

module.exports = router;
