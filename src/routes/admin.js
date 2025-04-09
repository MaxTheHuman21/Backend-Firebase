const express = require('express');
const router = express.Router();
const { auth, db } = require('../firebase');
const verificarAdmin = require('../middlewares/verificarAdmin');

// 🔐 Panel de administración
router.get('/admin-panel', verificarAdmin, async (req, res) => {
  const snapshot = await db.collection('transportes').get();

  const transportes = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  res.json({
    message: `Bienvenido, ${req.user.name}`,
    transportes
  });
});

// 🔄 Asignar tipoUsuarioId a un usuario ya creado
router.post('/asignar-rol', verificarAdmin, async (req, res) => {
  const { uid, tipoUsuarioId } = req.body;

  if (!uid || tipoUsuarioId === undefined) {
    return res.status(400).json({ error: 'uid y tipoUsuarioId son requeridos' });
  }

  const rolesPermitidos = [1, 2, 3, 4]; // alumno, docente, trabajador, admin

  if (!rolesPermitidos.includes(tipoUsuarioId)) {
    return res.status(400).json({ error: 'tipoUsuarioId inválido' });
  }

  try {
    await db.collection('usuarios').doc(uid).update({ tipoUsuarioId });
    res.json({ message: `Rol actualizado correctamente a tipoUsuarioId ${tipoUsuarioId}` });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el rol', detalles: err.message });
  }
});

// 👤 Crear cuenta genérica por administrador
router.post('/crear-cuenta', verificarAdmin, async (req, res) => {
  const { nombreCompleto, correo, password, matricula, tipoUsuarioId, estadoId } = req.body;

  if (!nombreCompleto || !correo || !password || !matricula || tipoUsuarioId === undefined || estadoId === undefined) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    const userRecord = await auth.createUser({
      email: correo,
      password,
      displayName: nombreCompleto
    });

    const uid = userRecord.uid;

    await db.collection('usuarios').doc(uid).set({
      uid,
      nombreCompleto,
      correo,
      matricula,
      tipoUsuarioId,
      estadoId,
      creadoEn: new Date()
    });

    res.status(201).json({ message: 'Cuenta creada correctamente', uid });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear la cuenta', detalles: err.message });
  }
});

module.exports = router;
