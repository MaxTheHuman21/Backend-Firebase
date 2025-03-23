// firebase.js
require('dotenv').config();
const admin = require('firebase-admin');

let serviceAccount;

if (process.env.FIREBASE_CONFIG) {
  // Parsear desde variable de entorno (Render)
  serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
} else {
  // Usar archivo local en desarrollo
  serviceAccount = require('./serviceAccountKey.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB // opcional: usa esta variable si la tienes
});

const db = admin.firestore();
const auth = admin.auth();
const messaging = admin.messaging();

module.exports = { db, auth, messaging };
