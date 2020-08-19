const express = require('express');
let app = express();
const bodyParser = require('body-parser');
//const usuario = require('../models/usuario');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false })); // es necesario desde julio 2020


let { verificaToken } = require('../middlewares/autenticacion');

let Producto = require('../models/producto');

// ==================================
// Mostrar todas los producto
// ==================================
app.get('/producto', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);
    console.log('GetProductos', desde);
    Producto.find({ disponible: true })
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                productos
            });
        });

});

// ==================================
// Mostrar un producto
// ==================================
app.get('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    console.log('id:', id);

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    desc: {
                        message: `El producto con el id: ${id} no existe`
                    },
                    err
                });
            }
            if (!productoDB) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: `El producto con el id: ${id} no existe`
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });
        });
});

// ===========================
//  Buscar productos
// ===========================
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {
    console.log('buscar');
    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');
    console.log('regex:', regex);

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            })

        });


});

// ==================================
// Actualizar un producto por ID
// ==================================
app.put('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: `El producto con el id: ${id} no existe`
                }
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;
        productoDB.descripcion = body.descripcion;

        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                producto: productoGuardado
            });
        });

    });

});

// ==================================
// Crear nuevo producto
// ==================================
app.post('/producto', verificaToken, (req, res) => {
    console.log('postProducto');
    let body = req.body;
    let producto = new Producto({
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: true,
        categoria: body.categoria,
    });
    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        res.status(201).json({
            ok: true,
            producto: productoDB
        });
    });
});

// ==================================
// Borrar producto (desactivar)
// ==================================
app.delete('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    desc: {
                        message: `El producto con el id: ${id} no existe`
                    },
                    err
                });
            }
            if (!productoDB) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: `El producto con el id: ${id} no existe`
                    }
                });
            }

            productoDB.disponible = false;

            productoDB.save((err, productoBorrado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                return res.json({
                    ok: true,
                    producto: productoBorrado,
                    mensaje: 'Producto Borrado ;)'
                });
            });

        });

});



module.exports = app