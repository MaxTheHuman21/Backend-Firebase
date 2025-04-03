const express = require("express");
const morgan = require("morgan");
const path = require('path');
const exphbs = require("express-handlebars");

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs', 
    defaultLayout: 'main', 
    layoutsDir: path.join(__dirname, 'views', 'layout') 
}));
app.set('view engine', '.hbs');

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/transportes', require('./routes/transportes'));
app.use('/', require("./routes/index"));
app.use('/api/admin', require('./routes/admin'));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;
