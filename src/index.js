// Cargar variables de entorno desde .env
require('dotenv').config();

// Importar app de Express y configuración de Firebase
const app = require('./app');
require('./firebase');

// Usar el puerto de entorno (Render) o fallback a 4000 localmente
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
