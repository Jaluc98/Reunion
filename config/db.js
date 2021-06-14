const Sequelize = require('sequelize');
require('dotenv').config({path : 'variable.env'})
//Configaracion a la base de datos a utilizar
module.exports = new Sequelize('', process.env.BD_USER, process.env.BD_PASS, {
    host: process.env.BD_HOST,
    port: process.env.BD_PORT,
    dialect : 'postgres', 
    pool :{
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    schema: "reuniones"

});