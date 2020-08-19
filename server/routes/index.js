const express = require('express');
const app = express();

// importamos el archivo de rutas
app.use(require('./usuario'));
app.use(require('./login'));
app.use(require('./categoria'));
app.use(require('./producto'));





module.exports = app;