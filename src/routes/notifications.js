const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const {messaging} = require('../firebase')

router.post('/token', async (req, res) => {
  const { uid, fcmToken } = req.body;

  if (!uid || !fcmToken) {
    return res.status(400).json({ error: 'UID y fcmToken son requeridos' });
  }

  try {
    await db.collection('users').doc(uid).update({
      fcmToken,
      tokenUpdatedAt: new Date()
    });

    res.json({ message: 'Token guardado correctamente' });
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
