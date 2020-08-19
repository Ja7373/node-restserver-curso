const jwt = require('jsonwebtoken');

//====================================
// VERIFICAR TOKEN
//====================================


let verificaToken = (req, res, next) => {

    let token = req.get('token');
    // console.log('request', req);

    jwt.verify(token, process.env.SEED_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err
            });
        }
        console.log('decoded.usuario:', decoded.usuario);
        req.usuario = decoded.usuario;
        next();
    });
};

//====================================
// VERIFICAR ADMIN ROLE
//====================================


let verificaAdmin_Role = (req, res, next) => {
    // let token = req.get('token');
    // console.log('-----------------------------------------------');
    // jwt.verify(token, process.env.SEED_TOKEN, (err, decoded) => {
    //     if (err) {
    //         return res.status(401).json({
    //             ok: false,
    //             err
    //         });
    //     }

    let usuario = req.usuario;

    console.log('REQ.USUARIO:', usuario);
    if (usuario.role != 'ADMIN_ROLE') {
        return res.status(403).json({
            ok: false,
            err: 'no autorizado'
        });
    }

    //req.usuario = decoded.usuario;

    return next();
    // });
};






module.exports = {
    verificaToken,
    verificaAdmin_Role,
};