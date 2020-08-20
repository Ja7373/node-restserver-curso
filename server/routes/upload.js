const express = require('express');
const fileUpload = require('express-fileupload');

const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');


//parse application / x - www - form - urlencoded
app.use(bodyParser.urlencoded({ extended: false })); // es necesario desde julio 2020

//default options
app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;


    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'no se ha seleccionado ningún archivo'
                }
            });
    }

    // valida tipo
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        //no encontró ningun tipo válido
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'los tipos permitidos son: ' + tiposValidos.join(', ')
                }
            });
    }




    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let archivo = req.files.archivo;

    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];

    console.log(extension);

    // EXTENSIONES PERMITIDAS
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Extension no permitida, extensiones válidas: ' + extensionesValidas.join(', ')
            }
        });
    }

    // Use the mv() method to place the file somewhere on your server

    let rutaCompleta = path.resolve(__dirname, '../../uploads', 'file.jpg');
    console.log('GuardarEn:', rutaCompleta);
    // cambiar nombre al archivo
    let nombreArchivo = `${id}-${ new Date().getMilliseconds() }.${extension}`;
    let uuid = uuidv4();
    console.log('GUID: ', uuid);


    archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err) => {
        if (err) {
            return res.status(500)
                .json({
                    ok: false,
                    err
                });
        }

        //la imagen está cargada
        if (tipo === 'usuarios') {
            imagenUsuario(id, tipo, res, nombreArchivo);
        } else {
            console.log('ImagenProducto------------');
            imagenProducto(id, tipo, res, nombreArchivo);
        }
    });

});



function imagenUsuario(id, tipo, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borraArchivo(nombreArchivo, tipo);
            return res.status(500)
                .json({
                    ok: false,
                    err
                });
        }
        if (!usuarioDB) {
            borraArchivo(nombreArchivo, tipo);
            return res.status(500)
                .json({
                    ok: false,
                    err: {
                        message: `El usuario con id: ${id} no existe`
                    }
                });
        }

        borraArchivo(usuarioDB.img, tipo);

        //el usuario existe
        usuarioDB.img = nombreArchivo;
        usuarioDB.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(500)
                    .json({
                        ok: false,
                        err
                    });
            }

            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });
        });

    });
}

function imagenProducto(id, tipo, res, nombreArchivo) {
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borraArchivo(nombreArchivo, tipo);
            return res.status(500)
                .json({
                    ok: false,
                    err
                });
        }
        if (!productoDB) {
            borraArchivo(nombreArchivo, tipo);
            return res.status(500)
                .json({
                    ok: false,
                    err: {
                        message: `El producto con id: ${id} no existe`
                    }
                });
        }
        // if (!productoDB.img) {
        //     borraArchivo(nombreArchivo, tipo);
        //     return res.status(500)
        //         .json({
        //             ok: false,
        //             err: {
        //                 message: `El producto con id: ${id} no tiene el campo img`
        //             }
        //         });
        // }

        borraArchivo(productoDB.img, tipo);
        productoDB.img = nombreArchivo;
        productoDB.save((err, productoGuardado) => {
            if (err) {
                borraArchivo(nombreArchivo, tipo);
                return res.status(500)
                    .json({
                        ok: false,
                        err
                    });
            }
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });
        });

    });

}

function borraArchivo(nombreImagen, tipo) {
    console.log('nombreImagen: ', nombreImagen);
    if (!nombreImagen) return;
    let pathImagen = path.resolve(__dirname, '../../uploads/', tipo, nombreImagen);
    console.log('Borrado de Archivo: ', pathImagen);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}



module.exports = app;