// ======================================
// puerto
// ======================================

process.env.PORT = process.env.PORT || 3000;

// ======================================
// entorno
// ======================================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ======================================
// Vencimiento del Token
// ======================================
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30 * 365;
//process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

// ======================================
// SEED de autenticacion
// ======================================
process.env.SEED_TOKEN = process.env.SEED_TOKEN || 'secret-desarrollo';

// ======================================
// Base de datos
// ======================================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;

// ======================================
// GOOGLE CLIENT
// ======================================
process.env.CLIENT_ID = process.env.CLIENT_ID || '17253937628-l636hb0ufhm00bdi383uophr8h47j04r.apps.googleusercontent.com';