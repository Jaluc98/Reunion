const Grupos = require('../models/Grupos')
const Reunion = require('../models/Reunion')

//Renderizar plantilla nueva reunion
exports.formNuevoReunion = async (req,res) =>{
    const grupos = await Grupos.findAll({where:{usuarioId : req.user.id}})
    res.render('nueva-reunion',{
        nombrePagina : 'Crear Nueva Reunion',
        grupos
    });
 
}
//Crear reunion
exports.crearReunion = async (req,res) =>{
    //Obtener los datos de los inputs
        const reunion = req.body;

    //cupo opcional

    if(req.body.cupo === ''){
        reunion.cupo = 0;
    }
        reunion.usuarioId = req.user.id;
    //Almacenar en la base de datos
    try {   
        await Reunion.create(reunion);
        req.flash('exito', 'Se ha creado correctamente la reunion');
        res.redirect('/administracion')
        
        
    } catch (error) {
        let erroresSequelize ="";
        if(error.errors.length){
            erroresSequelize = error.errors.map(err => err.message);
        }
        // const erroresSequelize = error.errors.map(err => err.message);
        req.flash('error', erroresSequelize);
        res.redirect('/nueva-reunion')
    }
}

//Renderizar editar reunines
exports.formEditarReunion = async (req,res,next) =>{
    const consultas = [];
    //Coger todos los grupos
    consultas.push( Grupos.findAll({ where : { usuarioId : req.user.id }}) );
     //Consultar para recoger las reuniones segun su id para editarla
    consultas.push( Reunion.findOne({where : {id: req.params.id, usuarioId : req.user.id}}) );
    
    // return un promise
    const [ grupos, reunion ] = await Promise.all(consultas);
    if(!grupos || !reunion ){
        req.flash('error', 'Operación no valida');
        res.redirect('/administracion');
        return next();
    }

    // mostramos la vista
    res.render('editar-reunion', {
        nombrePagina : `Editar Reunion : ${reunion.titulo}`,
        grupos, 
        reunion
    })

}

exports.editarReunion = async (req,res,next) =>{
  //Consultar para recoger las reuniones segun su id para editarla
    const reunion = await Reunion.findOne({where : {id: req.params.id, usuarioId : req.user.id}})
    try {
        //Modificar la reunion el usuario que la ha creado y si existe
        if(!reunion){
            req.flash('error', 'Operacion no valida');
            res.redirect('/administracion')
            return next();
        }

        //asignar los valores 
        const {grupoId, titulo, invitado, fecha, hora, cupo, descripcion} = req.body
        //Asignar los nuevos valores a la reunion
        reunion.grupoId = grupoId;
        reunion.titulo = titulo;
        reunion.invitado = invitado;
        reunion.fecha = fecha;
        reunion.hora = hora;
        //Si el cupo es nulo es cero si no el valor introducido
        if(!cupo){
            reunion.cupo = 0;
        }else{
            reunion.cupo = cupo;
        }       
        reunion.descripcion = descripcion;

        await reunion.save();
        req.flash('exito','Cambios Guardados Correctamente');
        res.redirect('/administracion');

    } catch (error) {
        //Control de errores
        let erroresSequelize = ""
        if(error.message.length){
            erroresSequelize = error.errors.map(err => err.message);
           
        }
        req.flash('error', erroresSequelize);
        res.redirect(`/editar-reunion/${reunion.id}`);
       
    }
}

exports.formEliminarReunion = async (req,res,next) =>{
    let reunion = "";
    //Si el usuario es de tipo dos puede eliminar todas las reuniones
    if(req.user.tipoUsuario===2){
        reunion = await Reunion.findOne({where : {id: req.params.id}})
    }else{
        //Si el usuario es de tipo 1 puede eliminar sus propias reunione
        reunion = await Reunion.findOne({where : {id: req.params.id, usuarioId : req.user.id}})
    }
    
    // si el usario es el que la a creado o si existe
    if(!reunion){
        req.flash('error', 'Operacion no valida');
        res.redirect('/administracion')
        return next();
    }
    //Mostrar la vista
    res.render('eliminar-reunion',{
        nombrePagina : `Eliminar Reunion : ${reunion.titulo}`
    })
  
}
//eliminar las reunione
exports.eliminarReunion = async (req,res,nest) =>{
    await Reunion.destroy({
        where:{
            id: req.params.id
        }
    })

    req.flash('exito','Reunion eliminada');
    res.redirect('/administracion');
}




