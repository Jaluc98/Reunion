const reuniones = require('../../models/Reunion');
const Grupos = require('../../models/Grupos');
const Usuarios = require('../../models/Usuario')
const moment = require('moment')
const Sequelize = require("sequelize");
const Reunion = require('../../models/Reunion');
const Categorias = require('../../models/Categorias');
const Comentarios = require('../../models/Comentarios');

const comprobarUrl =  (url)=>{
  const fs = require('fs');
  const resultado = fs.existsSync(url);
  return resultado
}
//Renderizar las reuniones
exports.mostrarReunion = async (req,res,next) =>{
    //Consulta de las reuniones segun su respectiva identificacio n
    const reunion = await reuniones.findOne(
        {where :{
            slug : req.params.slug
        },
        include : [
            {
                model : Grupos
            },
            {
                model: Usuarios,
                attributes :['id','nombre','imagen']
            }
        ]
    })

    
    //Si no existe esa reunion
    if(!reunion){
        res.redirect('/')
    }
    
    //Cogemos los comentarios de su respectiva reunion
    const comentarios = await Comentarios.findAll({
        where : {
            reunioneId : reunion.id,
        },

        include :[
            {
                model: Usuarios,
                attributes :['id','nombre','imagen']
            }
        ]
    })
    //Renderizamos las reuniones pasandole sus respectivos valores
    res.render('mostrar-reunion',{
        nombrePagina : reunion.titulo,
        reunion,
        comprobarUrl,
        comentarios,
        moment,
    })
}

//Confirmar la axistencia a la reunion
exports.confirmarAsistencia= async(req,res) =>{
    const {accion} = req.body
    // Si el valor que coge el boton es confirmar entra en el array de interasados de la respectiva reunion
   if(accion === 'confirmar'){
        //Agregar el usuario
        Reunion.update(
            {'interesados' :  Sequelize.fn('array_append', Sequelize.col('interesados'), req.user.id  ) },
            {'where' : { 'slug' : req.params.slug }}
        );
        res.send('Has confirmado tu asistencia');
        
        return;
    
   }else{
         // Si el valor que coge el boton es cancelar se elimina el usuario de la lista de la respectiva reunion
        Reunion.update(
            {'interesados' :  Sequelize.fn('array_remove', Sequelize.col('interesados'), req.user.id  ) },
            {'where' : { 'slug' : req.params.slug }}
        );
        res.send('Has Cancelado tu asistencia');
      
        return;
   }
}

//Mostrar los asistentes de la reunion 
exports.mostrarAsistentes = async(req,res)=>{
    //Cogemos la reunion que estamos enseñando
    const reunion = await Reunion.findOne({
        where:{slug: req.params.slug},
        attributes: ['interesados']
    })
    const {interesados} = reunion
     //Hacemos una consulta para que nos de los interesados de la reunion
    const asistentes = await Usuarios.findAll({
        attributes : ['nombre','imagen'],
        where : { id : interesados}
    })
  res.render('asistentes-reunion',{
      nombrePagina : 'Listado Asistentes Reunion',
      asistentes,
      comprobarUrl
  })
}
//Mostrar las reuniones segun las categorias
exports.mostrarCategoria = async(req,res)=>{
    //Consulta de categorias con su identificacion
   const categoria = await Categorias.findOne({
        attributes : ['id','nombre'],   
        where: {slug : req.params.categoria}
    })
    //Coger las reuniones introducidas en su respectivas categorias
    const reuniones = await Reunion.findAll({
        include:[
            {
                model: Grupos,
                where : {categoriaId : categoria.id}
            },
            {
                model: Usuarios
            }
        ],
        order :[
            ['fecha','DESC'],
            ['hora','DESC']
            
        ]
    })

    res.render('categoria',{
        nombrePagina : `Categoria: ${categoria.nombre}`,
        reuniones,
        moment,
        comprobarUrl
    })

}
