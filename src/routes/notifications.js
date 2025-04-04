const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const {messaging} = require('../firebase')

//Guardado de token
router.post('/token', async (req, res) => {
  const { uid, fcmToken, deviceId } = req.body;

  if (!uid || !fcmToken || !deviceId) {
    return res.status(400).json({ error: 'uid, fcmToken y deviceId son requeridos' });
  }

  try {
    const docId = `${uid}_${deviceId}`; // ID único por usuario y dispositivo

    await db.collection('tokens').doc(docId).set({
      uid,
      fcmToken,
      deviceId,
      updatedAt: new Date()
    });

    res.json({ message: 'Token guardado correctamente con deviceId' });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar el token' });
  }
});


// Enviar notificación push
router.post('/send', async (req, res) => {
  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    await messaging.send({
      token,
      notification: {
        title,
        body
      }
    });

    res.json({ message: 'Notificación enviada correctamente' });
  } catch (err) {
    console.error('Error al enviar notificación:', err.message);
    res.status(500).json({ error: 'No se pudo enviar la notificación' });
  }
});

module.exports = router;
