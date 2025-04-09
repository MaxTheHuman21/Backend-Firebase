const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

// Registrar un nuevo horario
router.post('/', async (req, res) => {
  const { horarioId, rutaId, horaPartida, horaLlegadaAprox, estadoId } = req.body;

  if (!horarioId || !rutaId || !horaPartida || !horaLlegadaAprox || estadoId === undefined) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    await db.collection('horarios').doc(horarioId).set({
      horarioId,
      rutaId,
      horaPartida,
      horaLlegadaAprox,
      estadoId,
      creadoEn: new Date()
    });

    res.status(201).json({ message: 'Horario registrado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar el horario', detalles: err.message });
  }
});

// Obtener todos los horarios
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('horarios').get();
    const horarios = snapshot.docs.map(doc => doc.data());

    res.json(horarios);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener horarios' });
  }
});

// Actualizar un horario existente
router.put('/:horarioId', async (req, res) => {
  const { horarioId } = req.params;
  const { rutaId, horaPartida, horaLlegadaAprox, estadoId } = req.body;

  try {
    const ref = db.collection('horarios').doc(horarioId);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Horario no encontrado' });
    }

    await ref.update({
      rutaId,
      horaPartida,
      horaLlegadaAprox,
      estadoId,
      actualizadoEn: new Date()
    });

    res.json({ message: 'Horario actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el horario', detalles: err.message });
  }
});

module.exports = router;
