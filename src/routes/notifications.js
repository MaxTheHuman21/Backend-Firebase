const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

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

module.exports = router;
