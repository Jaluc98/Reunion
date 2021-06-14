const Usuarios = require('../../models/Usuario');
const Grupos = require('../../models/Grupos')

const comprobarUrl =  (url)=>{
    const fs = require('fs');
    const resultado = fs.existsSync(url);
    return resultado
  }
//Mostrar el perfil de usuario
exports.mostrarUsuario = async (req,res,next) =>{
    const consultas = [];

    //Consultas al mismo tiempo
    //Cogemos el usuario que vamos a ver su perfil
    consultas.push(Usuarios.findOne({where : {id : req.params.id}}))
    //Cogemos los grupos que tienen los usuarios
    consultas.push(Grupos.findAll({where:{usuarioId : req.params.id}}))
    const [usuario,grupos] = await Promise.all(consultas);
    //Si no existe el usuario
    if(!usuario){
        res.redirect('/')
        return next();
    }

    res.render('mostrar-perfil',{
        nombrePagina : `Perfil Usuario:${usuario.nombre}`,
        usuario,
        grupos,
        comprobarUrl
    })
}