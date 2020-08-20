const express = require('express');
const app = express();

// importamos el archivo de rutas
app.use(require('./usuario'));
app.use(require('./login'));
app.use(require('./categoria'));
app.use(require('./producto'));
app.use(require('./upload'));
app.use(require('./imagenes'));





module.exports = app;