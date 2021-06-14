const Sequelize = require('sequelize');
const db = require('../config/db');
const bcrypt = require('bcrypt');

const Usuarios = db.define('usuarios', {
    id: {
        type: Sequelize.INTEGER, 
        primaryKey: true,
        autoIncrement: true
    },
    nombre :{
       type: Sequelize.STRING(60),
        validate : {
            notEmpty : {
                msg : 'El nombre no puede ir vacío'
            }
        }
    },
    imagen : Sequelize.STRING(60),
    descripcion: Sequelize.TEXT,
    email: {
        type: Sequelize.STRING(30),
        allowNull: false, 
        validate: {
            isEmail: { msg : 'Agrega un correo válido'}
        },
        unique : {
            args: true,
            msg : 'Usuario ya registrado'
        }
    },
    password: {
        type: Sequelize.STRING(60),
        allowNull: false,
        validate : {
            notEmpty : {
                msg : 'El password no puede ir vacio'
            }
        }
    }, 
    activo : {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    cambioEmail : {
        type: Sequelize.INTEGER,
        defaultValue: 0
    }, 
    tipoUsuario : {
        type: Sequelize.INTEGER,
        defaultValue: 1
    },
    tokenPassword : Sequelize.STRING, 
    expiraToken : Sequelize.DATE
}, {
    hooks: {
        beforeCreate(usuario) { 
            usuario.password = Usuarios.prototype.hashPassword(usuario.password);
        }
    }
});

// Método para comparar los password
Usuarios.prototype.validarPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
}
Usuarios.prototype.hashPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null );
}

module.exports = Usuarios;