const express = require('express');
const router = express.Router();
const { db, messaging } = require('../firebase');
const admin = require('firebase-admin');

// ✅ Guardar token de dispositivo con UID y deviceId
router.post('/token', async (req, res) => {
  const { uid, fcmToken, deviceId } = req.body;

  if (!uid || !fcmToken || !deviceId) {
    return res.status(400).json({ error: 'uid, fcmToken y deviceId son requeridos' });
  }

  try {
    const userDoc = await db.collection('usuarios').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'El usuario no existe' });
    }

    const docId = `${uid}_${deviceId}`;

    await db.collection('tokens').doc(docId).set({
      uid,
      fcmToken,
      deviceId,
      updatedAt: new Date()
    });

    res.json({ message: 'Token guardado correctamente con deviceId' });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar el token', details: err.message });
  }
});


// ✅ Enviar notificación básica a un solo token
router.post('/send', async (req, res) => {
  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ error: 'Faltan campos requeridos (token, title, body)' });
  }

  try {
    await messaging.send({
      token,
      notification: { title, body }
    });

    res.json({ message: 'Notificación enviada correctamente' });
  } catch (err) {
    console.error('Error al enviar notificación:', err.message);
    res.status(500).json({ error: 'No se pudo enviar la notificación' });
  }
});


// ✅ Enviar notificación a todos los dispositivos de un usuario
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
      notification: { title, body }
    }));

    const results = await Promise.allSettled(mensajes.map(msg => messaging.send(msg)));

    const enviados = results.filter(r => r.status === 'fulfilled').length;
    const fallidos = results.filter(r => r.status === 'rejected').length;

    res.json({
      message: `Notificación enviada a ${enviados} dispositivos. ${fallidos} fallaron.`,
      resultados: results
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al enviar notificaciones', details: err.message });
  }
});


// ✅ Enviar notificación a múltiples usuarios por sus uids
router.post('/send-to-multiple', async (req, res) => {
  const { uids, title, body } = req.body;

  if (!uids || !Array.isArray(uids) || !title || !body) {
    return res.status(400).json({ error: 'uids (array), title y body son requeridos' });
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

    const resultados = await Promise.allSettled(mensajes.map(msg => messaging.send(msg)));

    const enviados = resultados.filter(r => r.status === 'fulfilled').length;
    const fallidos = resultados.filter(r => r.status === 'rejected').length;

    res.json({
      message: `Notificación enviada a ${enviados} dispositivos. ${fallidos} fallaron.`,
      resultados
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al enviar notificaciones', details: err.message });
  }
});


// ✅ Enviar notificación a todos los usuarios con un tipoUsuarioId
router.post('/send-to-role', async (req, res) => {
  const { tipoUsuarioId, title, body } = req.body;

  if (tipoUsuarioId === undefined || !title || !body) {
    return res.status(400).json({ error: 'tipoUsuarioId, title y body son requeridos' });
  }

  try {
    const userSnapshot = await db.collection('usuarios').where('tipoUsuarioId', '==', tipoUsuarioId).get();

    if (userSnapshot.empty) {
      return res.status(404).json({ error: `No se encontraron usuarios con tipoUsuarioId ${tipoUsuarioId}` });
    }

    let tokens = [];

    for (const doc of userSnapshot.docs) {
      const uid = doc.id;

      const tokenSnapshot = await db.collection('tokens').where('uid', '==', uid).get();
      tokenSnapshot.forEach(tokenDoc => {
        const tokenData = tokenDoc.data();
        if (tokenData.fcmToken) tokens.push(tokenData.fcmToken);
      });
    }

    if (tokens.length === 0) {
      return res.status(404).json({ error: 'No se encontraron tokens para este tipo de usuario' });
    }

    const mensajes = tokens.map(token => ({
      token,
      notification: { title, body }
    }));

    const resultados = await Promise.allSettled(mensajes.map(msg => messaging.send(msg)));

    const enviados = resultados.filter(r => r.status === 'fulfilled').length;
    const fallidos = resultados.filter(r => r.status === 'rejected').length;

    res.json({
      message: `Notificación enviada a ${enviados} dispositivos. ${fallidos} fallaron.`,
      resultados
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al enviar notificación', details: err.message });
  }
});


// ✅ Enviar notificación con `data` personalizada
router.post('/send-movil', async (req, res) => {
  // Ahora recibes también transporteId
  const { conductorId, rutaId, tipo, transporteId, time } = req.body;
  const timestamp = Date.now();

  if (!conductorId || !rutaId || !tipo || !transporteId || !time) {
    return res.status(400).json({ error: 'conductorId, rutaId, tipo, transporteId y time son requeridos' });
  }

  try {
    const snapshot = await db.collection('tokens').get();
    if (snapshot.empty) {
      return res.status(404).json({ error: 'No hay tokens registrados' });
    }

    const tokens = snapshot.docs.map(doc => doc.data().fcmToken);

    // ¡Aquí ya va el parámetro transporteId en el data!
    const mensajes = tokens.map(token => ({
      token,
      data: {
        title: "RUAM",
        description: "Este es un mensaje de prueba desde Firebase",
        conductorId,
        rutaId,
        tipo,
        transporteId,
        timestamp: timestamp.toString()
      },
      android: {
        priority: "high"
      }
    }));

    const resultados = await Promise.allSettled(mensajes.map(msg => messaging.send(msg)));

    const enviados = resultados.filter(r => r.status === 'fulfilled').length;
    const fallidos = resultados.filter(r => r.status === 'rejected').length;

    res.json({
      message: `Notificación enviada a ${enviados} dispositivos. ${fallidos} fallaron.`,
      resultados
    });

  } catch (err) {
    console.error('Error al enviar notificaciones móviles:', err.message);
    res.status(500).json({ error: 'Error al enviar notificaciones móviles' });
  }
});

router.delete('/unsubscribe', async (req, res) => {
  const { fcmToken } = req.body;

  if (!fcmToken) {
    return res.status(400).json({ error: 'fcmToken es requerido' });
  }

  try {
    const snapshot = await db.collection('tokens').where('fcmToken', '==', fcmToken).get();
    if (snapshot.empty) {
      return res.status(404).json({ error: 'Token no encontrado' });
    }
    for (const doc of snapshot.docs) {
      await doc.ref.delete();
    }
    res.json({ message: 'Token eliminado correctamente. Usuario desuscrito de notificaciones.' });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo eliminar el token', details: err.message });
  }
});




module.exports = router;
