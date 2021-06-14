const Sequelize = require('sequelize');
const db = require('../config/db');
const Categorias = require('./Categorias');
const Usuarios = require('./Usuario');

const Grupos = db.define('grupos', {
    id: {
        type : Sequelize.INTEGER,
        primaryKey : true,
        autoIncrement : true
    }, 
    nombre: {
        type: Sequelize.TEXT, 
        allowNull: false, 
        validate: {
            notEmpty: {
                msg : 'El grupo debe tener un nombre'
            }
        }
    }, 
    descripcion: {
        type: Sequelize.TEXT,
        allowNull: false, 
        validate : {
            notEmpty: {
                msg : 'La descipcion no puede ir vacía'
            }
        }
    },
    url: Sequelize.TEXT, 
    imagen: Sequelize.TEXT
})

Grupos.belongsTo(Categorias,{
    foreignKey : {
        allowNull: false, 
        validate : {
            customValidator(value){
                if(value === 'selected disabled'){
                    throw new Error("Seleccione una categoría");
                }
            }
        }
    }
});
Grupos.belongsTo(Usuarios);

module.exports = Grupos;