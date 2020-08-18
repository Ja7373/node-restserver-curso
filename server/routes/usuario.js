const express = require('express');
const Usuario = require('../models/usuario');
const { response } = require('express');

const bcrypt = require('bcryptjs');
const _ = require('underscore')
const usuario = require('../models/usuario');

const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');
//======================================= 

const app = express();

const bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false })); // es necesario desde julio 2020

app.get('/usuario', verificaToken, (req, res) => {

    // console.log('request:', req);
    // return res.json({
    //     usuario: req.usuario,
    //     nombre: req.usuario.nombre,
    //     email: req.usuario.email,
    // });

    //res.json('get usuario local');
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);
    let activos = { estado: true };
    //lista los usuarios activos
    Usuario.find(activos, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Usuario.count(activos, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo,
                });
            });

        });

});

app.post('/usuario', [verificaToken, verificaAdmin_Role], function(req, res) {
    let body = req.body;
    //console.log(req.body);
    // console.log('password: ', body.password);
    // body.password = '1';
    console.log('password encriptada: ', bcrypt.hashSync(body.password, 10));
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return response.status(400).json({
                ok: false,
                err
            });
        }

        // usuarioDB.password = null;

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], function(req, res) {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);
    //console.log('llegué hasta aquí');
    console.log('body--:', req.body);
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidatosr: true }, (err, usuarioDB) => {
        console.log('body: ', body);
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }


        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

    // Usuario.findById(id, (err, usuarioDB)=>{
    //     usuarioDB.save()
    // });

});

app.delete('/usuario/:id', verificaToken, function(req, res) {
    //res.json('delete usuario');
    let id = req.params.id;
    let cambiaEstado = {
        estado: false
    };

    //Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {
        //usuario
        console.log('intento de borrado', usuarioBorrado);
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!usuarioBorrado) {
            console.log('Usuario borrado: ', usuarioBorrado);
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});


module.exports = app;