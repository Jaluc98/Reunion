//Controlador de crear Cuenta, exportamos la funcion del controlador formCrearCuenta donde

const Usuarios = require("../models/Usuario");
const enviarEmail = require('../handlers/email');
const { request } = require("express");
const shortid = require("shortid");
const { usuarioAutenticado } = require("./authController");
const sizeOf = require('image-size')
const multer = require('multer')
const fs = require('fs')

/*Configuracion imagenes con extension*/

    const configuracionMulter = {
        //Limite de tamaño de la imagen
        limits : { fileSize : 100000 },
        //establecer la carpeta donde se va ha guardar las imagenes
        storage: fileStorage = multer.diskStorage({
            destination: (req, file, next) => {
                next(null, __dirname+'/../public/uploads/perfiles/');
            },
        //Leer la extension del archivo que sube el usuario
            filename : (req, file, next) => {
                const extension = file.mimetype.split('/')[1];
                next(null, `${shortid.generate()}.${extension}`);
            }
        }),
        //Configuramos la extension del archivo que se sube
        fileFilter(req, file, next) {
            if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
                //el formato es valido
                next(null, true);
            } else {
                // el formato no es valido
                next(new Error('Formato no válido'), false);
            }
        }
    }
  
//Comprobar URL de imagen para comprobar si existe en esa ruta    
const comprobarUrl =  (url)=>{
    const fs = require('fs');
    const resultado = fs.existsSync(url);
    return resultado
    }
      
/*Metodos para subir imagen*/

    const upload = multer(configuracionMulter).single('imagen');
    exports.subirImagen = async (req, res,next) =>{
        upload(req,res,function(error){
            if(error){
                //Configuramos los errores respecto las imagenes
            if(error instanceof multer.MulterError){
                    if(error.code === 'LIMIT_FILE_SIZE'){
                        req.flash('error', 'El archivo es muy grande')
                    }else{
                        req.flash('error',error.message)
                    }
                }else if(error.hasOwnProperty('message')) {
                    req.flash('error', error.message);
                }
            res.redirect('back');
            return;
            }else{
                next();
            }
        })
    }

//rederizamos la vista y le pasamos las variables para verlas en la vista
exports.formCrearCuenta = (req,res) =>{
    res.render('crear-cuenta',{
        nombrePagina : 'Crear Cuenta'
    });
}

//Crear cuenta
exports.crearNuevaCuenta = async(req, res) =>{
    const usuario = req.body;
    //Comprobar los errores de formulario y base de datos
    try {        
        if(req.body.password === "" || req.body.nombre === "" || req.body.email ==""|| req.body.confirmar[0] == ""){
            req.flash('error', "No deje espacios en Blanco");
            res.redirect('/crear-cuenta')
        }else{
            req.flash('error', "");
            if(req.body.password !== req.body.confirmar[0]){
                req.flash('error', "Las contraseñas no coinciden");
                res.redirect('/crear-cuenta')
            }else{
                req.flash('error', "");
                if(req.body.password.length  < 8 ){
                    req.flash('error', "La contraseña debe tener mas de 8 caracteres");
                    res.redirect('/crear-cuenta')
                }else{
                    //Crear usuario con la información añadida
                     //url de confirmación
                     await Usuarios.create(usuario);
                    // if(email.indexOf('gmail') !== -1){
                        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;
                        await enviarEmail.enviarEmailGmail({
                            usuario,
                            url,
                            subject: 'Confirma tu cuenta de Reunion',
                            archivo: 'confirmar-cuenta'
                        })
                    req.flash('exito', 'Hemos enviado un E-mail, confirma tu cuenta')
                    res.redirect('/iniciar-sesion')
                }
            }
        }     
    } catch (error) {
        //Control de errores desde la base de datos
        let erroresSequelize= ""
        if(error.message.length){
            erroresSequelize = "Usuario ya registrado, ponga otro email";
        }
        req.flash('error', erroresSequelize);
        res.redirect('/crear-cuenta')
    }
 
}

//Enviar correo para cambiar contraseña
//Enseñar formulario para la contraseña
exports.formRecuperarContrasena = async(req, res) =>{
    res.render('recuperar-contrasena',{
        nombrePagina: 'Recuperar Contraseña'
    })
}
exports.recuperarContrasena = async(req, res,next) =>{
    const usuario = req.body;
    const {email} = req.body;
    const usuarioEmail = await Usuarios.findOne({ where : { email: email }});
    if(req.body.email ==""){
        req.flash('error', "No deje campo Email en blanco");
        res.redirect('/recuperar-contrasena')
    }else{
        req.flash('error', "");
        //Comprobar si ese usuario existe
        if(!usuarioEmail){
            req.flash('error', "El email no existe");
            res.redirect('/recuperar-contrasena')
        }else{
                //Enviar correo con las configuraciones indicadas
               const url = `http://${req.headers.host}/confirmar-contrasena/${usuario.email}`;
               await enviarEmail.enviarEmailGmail({
                    usuario,
                    url,
                    subject: 'Confirma tu contraseña',
                    archivo: 'confirmar-contrasena'
                })
            req.flash('exito', 'Hemos enviado un E-mail, para recuperar su contraseña')
            res.redirect('/iniciar-sesion')
        }

    }   
   
}

exports.confirmarContrasena = async(req, res,next) =>{
    const usuario = await Usuarios.findOne({ where : { email: req.params.correo }});
    // sino existe, redireccionar
    if(!usuario) {
        req.flash('error', 'No existe esa cuenta');
        res.redirect('/iniciar-sesion');
        return next();
    }
    res.redirect(`/cambiarPasswordEmail/${usuario.email}`);
}

exports.formCambiarPasswordEmail = async(req, res,next) =>{
    const usuario = await Usuarios.findOne({ where : { email: req.params.correo }});
    res.render('cambiarPasswordEmail',{
        nombrePagina: 'Cambiar Contraseña'
    })
}

exports.cambiarPasswordEmail = async (req,res,next) =>{
    const usuario = await Usuarios.findOne({ where : { email: req.params.correo }});
    if(req.body.password === ""|| req.body.confirmar[0] == ""){
        req.flash('error', "No deje espacios en Blanco");
        res.redirect(`/cambiarPasswordEmail/${usuario.email}`)
    }else{
        if(req.body.password !== req.body.confirmar[0]){
            req.flash('error', "Las contraseñas no coinciden");
            res.redirect(`/cambiarPasswordEmail/${usuario.email}`)
        }else{
             //Si el password es correcto, hashear el nuevo
             const hash = usuario.hashPassword(req.body.password)
             // asignar el password al usuario
                     usuario.password = hash;
             // guardar en la base de datos
                 await usuario.save();
             // redireccionar 
                 req.logout();
                 req.flash('exito', 'Password Modificado Correctamente, vuelve a iniciar sesion')
                 res.redirect('/iniciar-sesion')
        }
    }    
}


// confirmar la subscripción Usuario

exports.confirmarCuenta = async (req, res, next) => {
    // verificar que el usuario existe
    const usuario = await Usuarios.findOne({ where : { email: req.params.correo }});
    // sino existe, redireccionar
    if(!usuario) {
        req.flash('error', 'No existe esa cuenta');
        res.redirect('/crear-cuenta');
        return next();
    }

    // // si existe, confirmar suscripción y redireccionar
    usuario.activo = 1;
    await usuario.save();

    req.flash('exito', 'La cuenta se ha confirmado, ya puedes iniciar sesión');
    res.redirect('/iniciar-sesion');
}


//Formulario para iniciar sesion

exports.formIniciarSesion = async(req, res) =>{
    res.render('iniciar-sesion',{
        nombrePagina: 'iniciar Sesión'
    })
}
//Formulario para editar perfil
exports.formEditarPerfil = async (req, res) =>{
    const usuario = await Usuarios.findByPk(req.user.id);
    res.render('editar-perfil',{
        nombrePagina: 'Editar Perfil',
        usuario
    })
}

// almacena en la base de datos los cambios a perfil

exports.editarPerfil = async (req,res) =>{

    try {   
       
        const usuario = await Usuarios.findByPk(req.user.id);
        // leer datos del form 
        const {nombre, descripcion, email} = req.body;
        let usuarioEmail = ""
        if( usuario.cambioEmail===0){
            usuarioEmail = await Usuarios.findOne({ where : { email:  req.body.email }});
            
        }
        //Comprobar si el email ha sido cambiado
        if(usuarioEmail){
            req.flash('error', 'Email existente en la página')
            res.redirect('/editar-perfil')
        }else{
            if(email != '' ){
                usuario.email = email;      
                usuario.cambioEmail = 1

            }
            usuario.nombre = nombre;
            usuario.descripcion = descripcion;
    
            //guardar en la base de datos
        
            await usuario.save();
        
            req.flash('exito', 'Cambios Guardados correctamente')
            res.redirect('/administracion')
        }
  
        
    } catch (error) {
        //Control de errores desde la base de datos
        let erroresSequelize= ""
        if(error.message.length){
            erroresSequelize = error.errors.map(err => err.message);  
        }
        req.flash('error', erroresSequelize);
        res.redirect('/editar-perfil')
    }
}

// Muestra el formulario para modificar el password
exports.formCambiarPassword = async (req,res) =>{
    res.render('cambiar-password',{
        nombrePagina : 'Cambiar Password'
    })
}    

//Revisa si el password anterior es correcto y lo modifica por uno nuevo

exports.cambiarPassword = async (req,res,next) =>{
    const usuario = await Usuarios.findByPk(req.user.id)
    //Verificar que el password anterior es correcto
        if(!usuario.validarPassword(req.body.anterior)){
            req.flash('error', 'El password actual es incorrecto')
            res.redirect('/cambiar-password')
            return next();
        }
        //Control error vacío
        if(req.body.nuevo === ''){
            req.flash('error', 'El campo nuevo password no puede ir vacio')
            res.redirect('/cambiar-password')
        }else{
            if(usuario.validarPassword(req.body.nuevo)){
                req.flash('error', 'Contraseña igual que la anterior, introduzca una nueva')
                res.redirect('/cambiar-password')
            }else{
                    //Si el password es correcto, hashear el nuevo
                    const hash = usuario.hashPassword(req.body.nuevo)
                // asignar el password al usuario
                        usuario.password = hash;
                // guardar en la base de datos
                    await usuario.save();
                // redireccionar 
                    req.logout();
                    req.flash('exito', 'Password Modificado Correctamente, vuelve a iniciar sesion')
                    res.redirect('/iniciar-sesion')
            }
        }
}

//Imagenes de perfil
exports.formSubirImagenPerfil = async (req,res) =>{
    const usuario = await Usuarios.findByPk(req.user.id)
    res.render('imagen-perfil',{
        nombrePagina : 'Cambiar Imagen Perfil',
        usuario,
        comprobarUrl
    })
}    
//Metodo post para guaradar la imagen de perfil en la base de datos
exports.guardarImagenPerfil = async (req,res) =>{
    const usuario = await Usuarios.findByPk(req.user.id)

    // si hay imagen anterior, eliminala
    const sizeOf = require('image-size')
    if(req.file){
        //Control sobre las dimensiones de la imagen que el usuario sube a la base de datos
        const dimensions = sizeOf(req.file.path)
        if(dimensions.height > 600 || dimensions.width > 600 ||
        dimensions.height < 500 || dimensions.width < 500){
            req.flash('error', 'Dimensiones imagen incorrecta, Resolucion minima 500 X 500');
            res.redirect('/imagen-perfil');
        }else{
            if(req.file && usuario.imagen){
                const imagenAnterior = __dirname + `/../public/uploads/pefiles/${usuario.imagen}`;
                //Eliminar Imagen con fileSystem
                fs.unlink(imagenAnterior,(error) =>{
                    if(error){
                        console.log(error)
                    }
                    return;
                });
            }
            // si hay una imagen nueva, la guardamos
            if(req.file){
                usuario.imagen = req.file.filename;
                await usuario.save();
                req.flash('exito', 'Cambios Almacenados Correctamente')
                res.redirect('/Administracion')
            }else{
                res.redirect('/Administracion')
            }  
        }
    }else{
        res.redirect('/Administracion')
    }    

}    

//Enviar email de contacto al administrador
//Formulario para el usuario de contacto

exports.formFormularioContacto = async (req,res) =>{
    res.render('formularioContacto',{
        nombrePagina : 'Formulario Contacto',
    })
}
//Configuracion para enviar el correo con la informacion establecida por el usuario
exports.formularioContacto = async (req,res) =>{
    //Coger los valores del formulario
    const descripcion =  req.body.descripcion
    const email = req.body.email
    const asunto = req.body.asunto
    //Control error de vacío
    if( req.body.descripcion===""||req.body.email===""||req.body.asunto===""){
        req.flash('error', 'No deje espacios en blanco')
        res.redirect('/formularioContacto')
    }else{
        req.flash('error', "");
        await enviarEmail.enviarFormulario({
            descripcion,
            email,
            asunto
        })
        req.flash('exito', 'Hemos enviado un E-mail correctamente')
        res.redirect('/formularioContacto')
    }
 
}



