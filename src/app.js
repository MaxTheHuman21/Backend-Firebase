const express = require("express");
const morgan = require("morgan");
const path = require('path');
const exphbs = require("express-handlebars");
app.use('/api/notifications', require('./routes/notifications'));


const app = express ();

app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs', 
    defaultLayout: 'main', 
    layoutsDir: path.join(__dirname, 'views', 'layout') 
}));
app.set('view engine', '.hbs');

app.use(morgan("dev"));
// Request Body con datos enviados desde el formulario html
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

app.use('/api/auth', require('./routes/auth'));
app.use('/', require("./routes/index"));

//Publicar una carpeta estatica que cualquiera pueda solicitar (se haga publica)
app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;