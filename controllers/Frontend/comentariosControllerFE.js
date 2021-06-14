const Comentarios = require("../../models/Comentarios")
const Reuniones = require("../../models/Reunion")
exports.agregarComentarios = async(req,res,next) =>{
   
    const {comentario} = req.body
    // const reunion = await Reuniones.findOne({where : {id : comentario.reunioneId}})
    //Obtener comentarios 

    //Crear Comentario en la BD
    if(comentario===""){
        req.flash('error', "El comentario no puede ir vacio");
        res.redirect('back');
    }else{
        await Comentarios.create({
            mensaje : comentario,
            usuarioId: req.user.id,
            reunioneId : req.params.id
        })
        res.redirect('back');
        next();
    } 
}


exports.eliminarComentario = async(req,res,next) =>{
   //Tomar el id del comentario

   const {comentarioId} = req.body

   //Consultar el comentario
    const comentario = await Comentarios.findOne({where : {id : comentarioId}})
  
   //Verificar si existe el comentario
    if(!comentario){
        res.status(404).send('Acción no válida')
        return next();
    }
    // consultar la reunion comentario
    const reunion = await Reuniones.findOne({where : {id : comentario.reunioneId}})
   //Verificar que quien lo borra sea el creador y el creador de la reunion sea el que borre el de su propio post
   if(comentario.usuarioId === req.user.id || reunion.usuarioId === req.user.id || req.user.id===1){
        await Comentarios.destroy({
            where :{
                id : comentario.id
            }
        })
        res.status(200).send('Eliminado Correctamente')
        return next()
    }else{
        res.status(403).send('Acción no válida')
        return next()
    }
}
