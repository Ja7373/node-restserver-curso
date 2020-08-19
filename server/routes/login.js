//require('./config/config');
const express = require('express');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);


const Usuario = require('../models/usuario');

const app = express();

const bodyParser = require('body-parser');
const usuario = require('../models/usuario');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false })); // es necesario desde julio 2020

// parse application/json()
//app.use(bodyParser.json());

app.post('/login', (req, res) => {

    let body = req.body;

    console.log('email:', body.email);
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });
        }

        console.log('CaducidadToken:', process.env.CADUCIDAD_TOKEN);
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN });


        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });

    });

});


// Configuraciones de google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    console.log('payload.name:', payload.name);
    console.log('payload.email:', payload.email);
    console.log('payload.picture:', payload.picture);
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };

}
//verify().catch(console.error);


app.post('/google', async(req, res) => {

    let token = req.body.idtoken;
    //let token = req.body.idToken;

    let googleUser = await verify(token)
        .catch(e => {
            return res.status(400).json({
                ok: false,
                err: e
            });
        });

    console.log('googleUser.email', googleUser.email);
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            console.log('no se encuentra email');
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de usar su autenticación normal'
                    }
                });
            } else {
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token

                });
            }
        } else {
            //si el usuario no existe en nuestra BD
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
            });

            let token = jwt.sign({
                usuario: usuarioDB
            }, process.env.SEED_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN });

            return res.json({
                ok: true,
                usuario: usuarioDB,
                token

            });
        }
    });

    // res.json({
    //     usuario: googleUser
    // });

});



module.exports = app;