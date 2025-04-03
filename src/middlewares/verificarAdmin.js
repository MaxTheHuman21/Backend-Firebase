const { auth, db } = require('../firebase');

const verificarAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

  try {
    const decoded = await auth.verifyIdToken(token);
    const uid = decoded.uid;

    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();

    if (!userData || userData.role !== 'administrador') {
      return res.status(403).json({ error: 'Acceso denegado: no eres administrador' });
    }

    req.uid = uid;
    req.user = userData;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = verificarAdmin;
