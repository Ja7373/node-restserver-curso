const express = require('express');
let app = express();
const bodyParser = require('body-parser');
//const usuario = require('../models/usuario');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false })); // es necesario desde julio 2020


let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');


let Categoria = require('../models/categoria');

// ==================================
// Mostrar todas las categorías
// ==================================
app.get('/categoria', (req, res) => {
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categorias
            });

        });
});


// ==================================
// Mostrar categoría por ID
// ==================================
app.get('/categoria/:id', (req, res) => {
    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El ID no es correcto'
                }
            });
        }


        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });
});

// ==================================
// Crear nueva categoría
// ==================================
app.post('/categoria', verificaToken, (req, res) => {
    //REGRESA LA NUEVA CATEGORÍA 
    //req.usuario._id
    let body = req.body;
    console.log('req.usuario:', req.usuario._id);
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB,
        });

    });

});

// ==================================
// Actualizar categoría
// ==================================
app.put('/categoria', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    };

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });
});

// ==================================
// Borrar categoría
// ==================================
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    //solo puede borrar un admin
    //Elimina, no desactiva
    //Categoria.findByIdAndRemove
    let id = req.params.id;
    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El id no existe',
                }
            });
        }

        res.json({
            ok: true,
            message: 'Categoría borrada'
        })


    });
});







module.exports = app;