const Categorias = require('../models/Categorias')
const Reunion = require('../models/Reunion')
const Grupos = require('../models/Grupos')
const { request } = require("express");
const multer = require('multer')
const shortid = require('shortid')
const fs = require('fs')
const sizeOf = require('image-size')

const comprobarUrl =  (url)=>{
    const fs = require('fs');
    const resultado = fs.existsSync(url);
    return resultado
  }
  
/*Configuracion multer para que filtre las imagenes 
subidas segun la configuracion que hemos establecido*/

    const configuracionMulter = {
        //Limite de tamaño de la imagen
        limits : { fileSize : 100000 },
        //establecer la carpeta donde se va ha guardar las imagenes
        storage: fileStorage = multer.diskStorage({
            destination: (req, file, next) => {
                next(null, __dirname+'/../public/uploads/grupos/');
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

/*Renderiza  formulario de nuevos grupos*/

    exports.formNuevoGrupo = async (req, res) =>{
        const categorias = await Categorias.findAll();
        res.render('nuevo-grupo',{
            nombrePagina : 'Crea un nuevo Grupo',
            categorias
        })
    }

/*Metodos para crear Grupo*/

    exports.crearGrupo = async (req, res) => {

        const grupo = req.body;

        // almacena el usuario autenticado como el creador del grupo
        grupo.usuarioId = req.user.id;
        //Almacena la categoria segun la que hemos elegido
        grupo.categoriaId = req.body.categoria
     
        try {
            //Request.file contiene la informacion del archivo que subimos 
            if(req.file){
                //Control sobre las dimensiones de la imagen que el usuario sube a la base de datos
                const dimensions = sizeOf(req.file.path)
                if(dimensions.height > 600 || dimensions.width > 600 ||
                dimensions.height < 500 || dimensions.width < 500){
                    console.log(dimensions)
                    req.flash('error', 'Dimensiones imagen incorrecta, Resolucion minima 500 X 500');
                    res.redirect('/nuevo-grupo');
                }else{
                    //Almacenar imagen en la base de datos
                    grupo.imagen = req.file.filename;
                     // almacenar en la base de datos
                    await Grupos.create(grupo);
                    req.flash('exito', 'Se ha creado el Grupo Correctamente');
                    res.redirect('/administracion');
                }
            }else{
                await Grupos.create(grupo);
                req.flash('exito', 'Se ha creado el Grupo Correctamente');
                res.redirect('/administracion');
            }
        } catch (error) {
            // extraer el message de los errores
            let erroresSequelize ="";
            if(error.message.length){
                erroresSequelize = error.errors.map(err => err.message);
            }
            req.flash('error', erroresSequelize);
            res.redirect('/nuevo-grupo'); 
        }
    }

/*Renderizar Editar Grupo*/

    exports.formEditarGrupo = async(req, res,next)=>{
        const consultas = [];
        
        //Consuta para coger el grupo para editarlo
        consultas.push( Grupos.findOne({ where : { id : req.params.grupoId, usuarioId : req.user.id }}));
         //Consuta para coger todos las categorias
        consultas.push(categorias = await Categorias.findAll())
        
       
        // promise con await 
        //nos ayuda a ejecutar dos consultas a la vez
        const [grupo, categoria] = await Promise.all(consultas)     
        //Mirar si el grupo es del usuario identificado y si el grupo existe 
            if(!grupo){
                req.flash('error', 'Operacion no válida');
                res.redirect('/administracion')
                return next();
            }
        //Renderizar los grupos con sus respectivas      
        res.render('editar-grupo',{
            nombrePagina : `Editar Grupo : ${grupo.nombre}`,
            grupo,
            categoria
        });
    }

/*Metodos para Editar Grupo*/

    exports.editarGrupo = async (req, res, next) => {
            try {
                //Consuta para coger el grupo para editarlo
                const grupo = await Grupos.findOne({ where : { id : req.params.grupoId, usuarioId : req.user.id }});
                // si no existe ese grupo o no es el dueño
                    if(!grupo) {
                        req.flash('error', 'Operación no válida');
                        res.redirect('/administracion');
                        return next();
                    }
                // todo bien, leer los valores
                    const { nombre, descripcion, categoria, url } = req.body;
                // asignar los valores
                    //Cogemos las columnas de la base de datos y lo rellenamos con otro valor
                    grupo.nombre =  nombre;
                    grupo.descripcion = descripcion;
                    grupo.categoriaId = categoria;
                    grupo.url = url;
                // guardamos en la base de datos los cambios establecidos aneriormente con los nuevos valores
                    await grupo.save();
                    req.flash('exito', 'Cambios Almacenados Correctamente');
                    res.redirect('/administracion');
            } catch (error) {
                // extraer el message de los errores
                const grupo = await Grupos.findOne({where : {id :  req.params.grupoId, usuarioId : req.user.id}});
                    if(!grupo){
                        req.flash('error', 'Operacion no válida')
                        res.redirect('/administracion')
                        return next();
                    }else{
                        //Control de errores establecidos en la base de datos
                        // recorremos el array de errores
                        const erroresSequelize = error.errors.map(err => err.message);
                        //pasamos los errores por la sesion
                        req.flash('error', erroresSequelize);
                        res.redirect(`/editar-grupo/${grupo.id}`); 
                    }
            }
    }

/*Renderizar formulario para editar imagen*/
    exports.formEditarImagen = async (req,res,next) =>{
        //Busco desde la base de datos l grupo donde voy a editar la imagen
        const grupo = await Grupos.findOne({where : {id :  req.params.grupoId, usuarioId : req.user.id}})
          //Si el grupo es valido
          if(!grupo){
            req.flash('error','Operacion no valida');
            res.redirect('/administracion');
            return next();
        }
        //renderizamos la vista editar Imagen, pasando a la vista los valores que queremos utilizar
        res.render('imagen-grupo',{
            nombrePagina : `Editar Imagen Grupo : ${grupo.nombre}`,
            grupo,
            comprobarUrl
        })
    }

/*Metodos para Editar Imagenes*/

    // Modificar la imgagen en la base de datos y eliminar la anterior.
    exports.editarImagen = async (req,res,next) =>{ 
        const grupo = await Grupos.findOne({where : {id :  req.params.grupoId, usuarioId : req.user.id}})
        //Si el grupo es valido
        if(!grupo){
            req.flash('error','Operacion no validar');
            res.redirect('/iniciar-sesion');
            return next();
        }
        if(req.file){
            //Control sobre las dimensiones de la imagen que el usuario sube a la base de datos
         const dimensions = sizeOf(req.file.path)
         if(dimensions.height > 600 || dimensions.width > 600 ||
         dimensions.height < 500 || dimensions.width < 500){
             req.flash('error', 'Dimensiones imagen incorrecta, Resolucion minima 500 X 500');
             res.redirect(`/imagen-grupo/${grupo.id}`)
         }else{
                // Si hay imagen nueva introducida en el sitema(vista) y esta en la base de datos
                if(req.file && grupo.imagen){
                    const imagenAnterior = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;
                    //Eliminar Imagen anterior con fileSystem, nos sirve para eliminar ficheros en nuestro sistema
                    fs.unlink(imagenAnterior,(error) =>{
                        if(error){
                            console.log(error)
                        }
                        return;
                    });
                }
                // si hay una imagen nueva, la guardamos cuando la imagen a sido borrada y poner la nueva
                if(req.file){
                    grupo.imagen = req.file.filename;
                    await grupo.save();
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

/*Renderizar Eliminar Grupo*/
    exports.formEliminarGrupo = async (req,res,next) =>{
        let grupo = "";
        //Si el tipo de usuario es 2 pued eliminar todos los grupos
        if(req.user.tipoUsuario===2){
            grupo = await Grupos.findOne({where : {id :  req.params.grupoId}})
        }else{
            //Si el tipo de usuario es 1 el usuario solo puede eliminar los suyos propios
            grupo = await Grupos.findOne({where : {id :  req.params.grupoId, usuarioId : req.user.id}})
        }
        //Si el grupo es del usuairo o existe
        if(!grupo){
            req.flash('error', 'Operacion no válida');
            res.redirect('/administracion')
            return next();
        }
        //Renderizar el grupo a eliminar
        res.render('eliminar-grupo',{
            nombrePagina : `Eliminar Grupo : ${grupo.nombre}`
        })
    }

/*Metodo para eliminar grupo*/
    exports.eliminarGrupo = async (req,res,next) =>{
        let grupo = "";
        //Si el tipo de usuario es 2 pued eliminar todos los grupos
        if(req.user.tipoUsuario===2){
            grupo = await Grupos.findOne({where : {id :  req.params.grupoId}})
        }else{
         //Si el tipo de usuario es 1 el usuario solo puede eliminar los suyos propios
            grupo = await Grupos.findOne({where : {id :  req.params.grupoId, usuarioId : req.user.id}})
        }
        // const reunionGrupo = await Reunion.findAll({where : {grupoId :  req.params.grupoId}})

        //Comprobar si el grupo al que estamos hacediendo existe
        if(!grupo){
            req.flash('error', 'Operacion no válida');
            res.redirect('/administracion')
            return next();
        }
        //Si hay una imagen iliminarla
        if(grupo.imagen){
            const imagenAnterior = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;
            //Eliminar Imagen con fileSystem
            fs.unlink(imagenAnterior,(error) =>{
                if(error){
                    console.log(error)
                }
                return;
            });
        }
        await Reunion.destroy({
            where : {
                grupoId :  req.params.grupoId
            } 
        });
        // Eliminar grupo
        await Grupos.destroy({
            where : {
                id : req.params.grupoId
            } 
        });
        //Redireccionar a administracion
        req.flash('exito','Grupo Eliminado')
        res.redirect('/administracion')
    }