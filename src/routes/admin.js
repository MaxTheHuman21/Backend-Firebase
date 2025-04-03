const express = require('express');
const router = express.Router();
const verificarAdmin = require('../middlewares/verificarAdmin');

// Solo admins pueden acceder
router.get('/admin-panel', verificarAdmin, async (req, res) => {
  // Aquí podrías devolver HTML o JSON con vista de control de transportes
  const { db } = require('../firebase');
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

// Ruta para cambiar rol de usuario (solo admins)
router.post('/asignar-rol', verificarAdmin, async (req, res) => {
    const { uid, nuevoRol } = req.body;
  
    if (!uid || !nuevoRol) {
      return res.status(400).json({ error: 'uid y nuevoRol son requeridos' });
    }
  
    const rolesPermitidos = ['administrador', 'conductor', 'trabajador', 'estudiante'];
  
    if (!rolesPermitidos.includes(nuevoRol.toLowerCase())) {
      return res.status(400).json({ error: 'Rol inválido' });
    }
  
    try {
      await db.collection('usuarios').doc(uid).update({ rol: nuevoRol });
      res.json({ message: `Rol actualizado correctamente a ${nuevoRol}` });
    } catch (err) {
      res.status(500).json({ error: 'Error al actualizar el rol' });
    }
  });
  
  module.exports = router;

module.exports = router;
