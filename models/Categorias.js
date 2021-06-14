//Modelo categorias
//Imports
const Sequelize = require('sequelize');
const db = require('../config/db');

const Categorias = db.define('categorias',{
    //PrimaryKey ID
    id : {
        type : Sequelize.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    nombre : Sequelize.TEXT,
    slug : Sequelize.TEXT
},{
    timestamps : false
});

module.exports = Categorias;