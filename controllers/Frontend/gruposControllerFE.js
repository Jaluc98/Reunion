const Grupos = require('../../models/Grupos');
const Reuniones = require('../../models/Reunion');
const moment = require('moment')
const comprobarUrl =  (url)=>{
    const fs = require('fs');
    const resultado = fs.existsSync(url);
    return resultado
  }
  
exports.mostrarGrupo = async (req,res,next) =>{
    const consultas = [];
    //Consulta para obtener los grupos por la id en la url
    consultas.push(Grupos.findOne({where:{id:req.params.id}}))
    //Consulta para obtener las reuniones con sus respectivos grupos
    consultas.push(Reuniones.findAll({
        where:{grupoId : req.params.id},
        order :[
            ['fecha','ASC']
        ]
    }))
    //Cogemos por promesa en el array el contenido por el que esta formado
    const [grupo, reuniones] = await Promise.all(consultas);
    // Si no hay un grupo
    if(!grupo){
        rs.redirect('/')
        return next()
    }
    //Mostrar los grupos con su respectivo contenido
    res.render('mostrar-grupo',{
        nombrePagina : `Informacion Grupo : ${grupo.nombre}`,
        grupo,
        reuniones,
        moment,
        comprobarUrl
    })
}