const express = require("express");
const morgan = require("morgan");
const path = require('path');
const cors = require('cors');

const app = express();

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({origin: '*',}));

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/transportes', require('./routes/transportes'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/rutas', require('./routes/rutas'));
app.use('/api/estaciones', require('./routes/estaciones'));
app.use('/api/conductores', require('./routes/conductores'));
app.use('/api/horarios', require('./routes/horarios'));
app.use('/api/waypoints', require('./routes/waypoints'));
app.use('/api/dispositivos', require('./routes/dispositivos'));
app.use('/api/tipoUsuario', require('./routes/tipoUsuario'));
app.use('/api/usuarios', require('./routes/usuarios'));


// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;
