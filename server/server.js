require('./config/config');
// Using Node.js `require()`
const mongoose = require('mongoose');
const express = require('express');
const uniqueValidator = require('mongoose-unique-validator');

//======================================= 

const app = express();

// configuracion global de rutas
app.use(require('./routes/index'));
//app.use(require('./routes/usuario'));
// app.use(require('./routes/login'));


const bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json()
app.use(bodyParser.json());




let conexionBD = async() => {

    await mongoose.connect('mongodb://localhost:27017/cafe', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, (err, res) => {
        if (err) {
            console.log('Error: ', err);
            throw err;
        }
        console.log('base de datos conectada OK');

    });
};

mongoose.connect(process.env.URLDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err, res) => {
    if (err) {
        console.log('Error: ', err);
        throw err;
    }
    console.log('base de datos conectada OK');

});

// conexionBD().then(() => {
//     console.log("Conectada");
// }).catch((err) => {
//     console.log('error al conectarBD: ', err);
// });



app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto: ', process.env.PORT);
});