const Sequelize = require('sequelize');
const db = require('../config/db');
const Usuarios = require('./Usuario');
const Reunion = require('./Reunion');

const Comentarios = db.define('comentario', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    mensaje : Sequelize.TEXT
}, {
    timestamps : false
});

Comentarios.belongsTo(Usuarios);
Comentarios.belongsTo(Reunion);

module.exports = Comentarios;