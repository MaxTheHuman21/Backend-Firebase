// firebase.js
require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // asegúrate de tener este archivo y no subirlo a GitHub

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB // opcional si usas Realtime Database
});

const db = admin.firestore();
const auth = admin.auth();
const messaging = admin.messaging();

module.exports = { db, auth, messaging };
