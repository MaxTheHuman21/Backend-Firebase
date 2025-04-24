  const { auth, db } = require('../firebase');

  module.exports = async function verificarAdmin(req, res, next) {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    try {
      const decoded = await auth.verifyIdToken(token);
      const userDoc = await db.collection('usuarios').doc(decoded.uid).get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const user = userDoc.data();

      if (user.tipoUsuarioId !== 4) {
        return res.status(403).json({ error: 'Acceso denegado: no eres administrador' });
      }

      req.user = user;
      next();
    } catch (err) {
      console.error('Error verificando token:', err.message);
      res.status(401).json({ error: 'Token inválido' });
    }
  }
