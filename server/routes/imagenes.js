const express = require('express');
const fs = require('fs');
const path = require('path');

const { verificaTokenImg } = require('../middlewares/autenticacion');

const app = express();
const bodyParser = require('body-parser');
const { RSA_NO_PADDING } = require('constants');

app.use(bodyParser.urlencoded({ extended: false })); // es necesario desde julio 2020



app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {

    let tipo = req.params.tipo;
    let img = req.params.img;
    console.log('getImagenes');

    let pathImagen = path.resolve(__dirname, '../../uploads/', tipo, img);

    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        console.log('RutaImagen:', pathImagen);
        let noImagePah = path.resolve(__dirname, '../', 'assets', 'no-image.jpg');
        res.sendFile(noImagePah);
    }

});











module.exports = app;