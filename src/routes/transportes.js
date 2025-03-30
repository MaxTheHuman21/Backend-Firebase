const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

// 🟢 Obtener estatus de todos los transportes
router.get('/status', async (req, res) => {
  try {
    const snapshot = await db.collection('transportes').get();
    const now = new Date();

    const transportes = snapshot.docs.map(doc => {
      const data = doc.data();
      let tiempoEnEscuela = null;

      if (data.estatus === 'en espera' && data.horaLlegada) {
        const llegada = new Date(data.horaLlegada.toDate());
        const diffMin = Math.floor((now - llegada) / 60000);
        tiempoEnEscuela = `${diffMin} min`;
      }

      return {
        id: doc.id,
        tipo: data.tipo,
        placa: data.placa,
        estatus: data.estatus,
        horaLlegada: data.horaLlegada,
        tiempoEnEscuela
      };
    });

    res.json(transportes);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los transportes' });
  }
});

// 🔄 Actualizar estatus de un transporte
router.post('/update-status', async (req, res) => {
  const { id, nuevoEstatus } = req.body;

  if (!id || !nuevoEstatus) {
    return res.status(400).json({ error: 'ID y nuevoEstatus son requeridos' });
  }

  try {
    const ref = db.collection('transportes').doc(id);
    const updateData = { estatus: nuevoEstatus };

    if (nuevoEstatus === 'en espera') {
      updateData.horaLlegada = new Date();
    }

    if (nuevoEstatus === 'salió') {
      updateData.horaSalida = new Date();
    }

    await ref.update(updateData);
    res.json({ message: 'Estatus actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo actualizar el estatus' });
  }
});

module.exports = router;
