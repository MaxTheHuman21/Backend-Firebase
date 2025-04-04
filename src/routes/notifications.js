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

// Enviar notificación a todos los dispositivos de un usuario
router.post('/send-to-user', async (req, res) => {
  const { uid, title, body } = req.body;

  if (!uid || !title || !body) {
    return res.status(400).json({ error: 'uid, title y body son requeridos' });
  }

  try {
    const snapshot = await db.collection('tokens').where('uid', '==', uid).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'No hay tokens registrados para este usuario' });
    }

    const tokens = snapshot.docs.map(doc => doc.data().fcmToken);

    const mensajes = tokens.map(token => ({
      token,
      notification: {
        title,
        body
      }
    }));

    const results = await Promise.allSettled(
      mensajes.map(msg => messaging.send(msg))
    );

    const enviados = results.filter(r => r.status === 'fulfilled').length;
    const fallidos = results.filter(r => r.status === 'rejected').length;

    res.json({
      message: `Notificación enviada a ${enviados} dispositivos. ${fallidos} fallaron.`,
      resultados: results
    });
  } catch (err) {
    console.error('Error al enviar notificaciones:', err);
    res.status(500).json({ error: 'Error al enviar notificaciones' });
  }
});

// Enviar notificación a múltiples usuarios
router.post('/send-to-multiple', async (req, res) => {
  const { uids, title, body } = req.body;

  if (!uids || !Array.isArray(uids) || !title || !body) {
    return res.status(400).json({ error: 'uids, title y body son requeridos' });
  }

  try {
    let tokens = [];

    for (const uid of uids) {
      const snapshot = await db.collection('tokens').where('uid', '==', uid).get();

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.fcmToken) tokens.push(data.fcmToken);
      });
    }

    if (tokens.length === 0) {
      return res.status(404).json({ error: 'No se encontraron tokens válidos' });
    }

    const mensajes = tokens.map(token => ({
      token,
      notification: { title, body }
    }));

    const resultados = await Promise.allSettled(
      mensajes.map(msg => messaging.send(msg))
    );

    const enviados = resultados.filter(r => r.status === 'fulfilled').length;
    const fallidos = resultados.filter(r => r.status === 'rejected').length;

    res.json({
      message: `Notificación enviada a ${enviados} dispositivos. ${fallidos} fallaron.`,
      resultados
    });

  } catch (err) {
    console.error('Error al enviar notificación:', err);
    res.status(500).json({ error: 'Error al enviar la notificación' });
  }
});

// Enviar notificación a todos los usuarios con cierto rol
router.post('/send-to-role', async (req, res) => {
  const { rol, title, body } = req.body;

  if (!rol || !title || !body) {
    return res.status(400).json({ error: 'rol, title y body son requeridos' });
  }

  try {
    // 1. Obtener todos los usuarios con ese rol
    const userSnapshot = await db.collection('usuarios').where('rol', '==', rol).get();

    if (userSnapshot.empty) {
      return res.status(404).json({ error: `No se encontraron usuarios con rol ${rol}` });
    }

    // 2. Obtener tokens de todos esos usuarios
    let tokens = [];

    for (const doc of userSnapshot.docs) {
      const userId = doc.id;

      const tokenSnapshot = await db.collection('tokens').where('uid', '==', userId).get();
      tokenSnapshot.forEach(tokenDoc => {
        const tokenData = tokenDoc.data();
        if (tokenData.fcmToken) {
          tokens.push(tokenData.fcmToken);
        }
      });
    }

    if (tokens.length === 0) {
      return res.status(404).json({ error: 'No se encontraron tokens para este rol' });
    }

    // 3. Enviar notificaciones
    const mensajes = tokens.map(token => ({
      token,
      notification: { title, body }
    }));

    const resultados = await Promise.allSettled(
      mensajes.map(msg => messaging.send(msg))
    );

    const enviados = resultados.filter(r => r.status === 'fulfilled').length;
    const fallidos = resultados.filter(r => r.status === 'rejected').length;

    res.json({
      message: `Notificación enviada a ${enviados} dispositivos. ${fallidos} fallaron.`,
      resultados
    });

  } catch (err) {
    console.error('Error al enviar notificación:', err);
    res.status(500).json({ error: 'Error al enviar la notificación' });
  }
});


module.exports = router;
