const Grupos =  require('../models/Grupos')
const Reunion = require('../models/Reunion')
const moment = require('moment')
const Sequelize = require('sequelize')
const Op = Sequelize.Op;

//Enseñar los valores en el panel de administracion
exports.panelAdministracion = async (req, res) =>{
    //consultas
    const consultas = [];
    //Si el usuario identificado es de tipo dos, coge todas los grupos de la base de datos
    if( req.user.tipoUsuario === 2){
        consultas.push(Grupos.findAll())
         //Si el usuario identificado es de tipo dos, coge todas las reuniones de la base de datos
        consultas.push( Reunion.findAll({ where : { 
            fecha : { [Op.gte] : moment(new Date()).format("YYYY-MM-DD") }
          },
            order : [
            ['fecha', 'ASC']
            ] 
        }));
    }else{
        //Si el usuario identificado es de tipo uno, coge todas los grupos del usuario identificado
        consultas.push(Grupos.findAll({where: {usuarioId : req.user.id}}))
        consultas.push( Reunion.findAll({ where : { usuarioId : req.user.id, 
            fecha : { [Op.gte] : moment(new Date()).format("YYYY-MM-DD") }
          },
            order : [
            ['fecha', 'ASC']
            ] 
        }));
         //Si el usuario identificado es de tipo uno, coge todas las reuniones del usuario identificado
        consultas.push( Reunion.findAll({ where : { usuarioId : req.user.id, 
            fecha : { [Op.lt] : moment(new Date()).format("YYYY-MM-DD") }
        }}) );
    }
    const [grupos,reunion,anteriores] = await Promise.all(consultas);
    //Renderizamos la adminstracion con sus respectivas variables.
    res.render('administracion',{
        nombrePagina : 'Panel de Administracion',
        grupos,
        reunion,
        anteriores,
        moment
    })
}