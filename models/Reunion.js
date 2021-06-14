const Sequelize = require('sequelize');
const db = require('../config/db');
const uuid = require('uuid/v4')
const slug = require('slug')
const shortid =  require('shortid')

const Usuario = require('../models/Usuario')
const Grupo = require('../models/Grupos')
const Reunion = db.define('reuniones',{
        id: {
            type : Sequelize.INTEGER,
            primaryKey : true,
            autoIncrement : true
        }, 
        titulo:{
            type : Sequelize.STRING,
            allowNull:false,
            validate : {
                notEmpty:{
                    msg:'agrega un titulo'
                }
            }
        },
        slug : {
            type: Sequelize.STRING,
        },
        invitado : Sequelize.STRING,
        cupo : {
          type :  Sequelize.INTEGER,
          defaultValue: 0
        },
        descripcion :{
            type : Sequelize.TEXT,
            allowNull : false,
            validate : {
                notEmpty : {
                    msg:'Agrega una descripcion'
                }
            }
        },
        fecha :{
            type : Sequelize.DATEONLY,
            allowNull : false,
            validate : {
                notEmpty : {
                    msg : 'Agrega una fecha para la Reunion'
                }
            }
        },
        hora : {
            type : Sequelize.TIME,
            allowNull : false,
            validate : {
                notEmpty : {
                    msg : 'Agrega una hora'
                }
            }
        },
        // direccion :{
        //     type : Sequelize.STRING,
        //     allowNull : false,
        //     validate : {
        //         notEmpty : {
        //             msg:'Agrega una dirección'
        //         }
        //     }
        // },
        // ciudad : {
        //     type : Sequelize.STRING,
        //     allowNull : false,
        //     validate : {
        //         notEmpty : {
        //             msg:'Agrega una ciudad'
        //         }
        //     }
        // },        
        // estado : {
        //     type : Sequelize.STRING,
        //     allowNull : false,
        //     validate : {
        //         notEmpty : {
        //             msg:'Agrega un estado'
        //         }
        //     }
        // },
        // pais : {
        //     type : Sequelize.STRING,
        //     allowNull : false,
        //     validate : {
        //         notEmpty : {
        //             msg:'Agrega un país'
        //         }
        //     }
        // },
        // ubicacion : {
        //     type : Sequelize.GEOMETRY('POINT')
        // },
        interesados : {
            type : Sequelize.ARRAY(Sequelize.INTEGER),
            defaultValue : []
        }
    },{
        hooks : {
            async beforeCreate(reunion){
                const url = slug(reunion.titulo).toLocaleLowerCase();
                reunion.slug=`${url}-${shortid.generate()}`;
            }
        }
    }
);

Reunion.belongsTo(Grupo,{
    foreignKey : {
        allowNull: false, 
        validate : {
            customValidator(value){
                if(value === 'selected disabled'){
                    throw new Error("Seleccione un Grupo");
                }
            }
        }
    }
});
Reunion.belongsTo(Usuario);


module.exports = Reunion;