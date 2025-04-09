const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

// Registrar o actualizar token de un dispositivo
router.post('/', async (req, res) => {
  const { uid, deviceId, fcmToken } = req.body;

  if (!uid || !deviceId || !fcmToken) {
    return res.status(400).json({ error: 'uid, deviceId y fcmToken son requeridos' });
  }

  try {
    const docId = `${uid}_${deviceId}`; // ID único por usuario + dispositivo

    await db.collection('tokens').doc(docId).set({
      uid,
      deviceId,
      fcmToken,
      updatedAt: new Date()
    });

    res.status(201).json({ message: 'Token de dispositivo registrado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar el token', detalles: err.message });
  }
});

// Obtener todos los dispositivos registrados por usuario
router.get('/:uid', async (req, res) => {
  const { uid } = req.params;

  try {
    const snapshot = await db.collection('tokens').where('uid', '==', uid).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'No se encontraron dispositivos para este usuario' });
    }

    const dispositivos = snapshot.docs.map(doc => doc.data());
    res.json(dispositivos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener dispositivos', detalles: err.message });
  }
});

module.exports = router;
