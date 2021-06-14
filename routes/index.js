//import 

const express = require('express')
const router = express.Router()
const homeController = require('../controllers/homeController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController')
const adminController = require('../controllers/adminController')
const gruposController = require('../controllers/gruposController')
const reunionController = require('../controllers/reunionController')
const reunionControllerFE = require('../controllers/Frontend/reunionControllerFE')
const usuariosControllerFE = require('../controllers/Frontend/usuariosControllerFE')
const gruposControllerFE = require('../controllers/Frontend/gruposControllerFE')
const comentariosControllerFE = require('../controllers/Frontend/comentariosControllerFE')
const busqudaControllerFE = require('../controllers/Frontend/busquedaControllerFE')
module.exports = function () {

    /* AREA PUBLICA*/
    //Reunion
    /*Agrega Comentarios en la reunion*/
        router.post('/reunion/:id',
            comentariosControllerFE.agregarComentarios
        )
     /*Elimina comentarios en la reunion*/
     router.post('/eliminar-comentario',
        comentariosControllerFE.eliminarComentario
     )    

    //Añade la busqueda
    router.get('/busqueda',
        busqudaControllerFE.resultadoBusqueda
    )
    //Mostrar reunion
    router.get('/reun/:slug',
        reunionControllerFE.mostrarReunion
    )

    //Confirmar la asistencia a la reunion
    router.post('/confirmar-asistencia/:slug',
        reunionControllerFE.confirmarAsistencia
    )

    /*Muestra asistentes a la reunion*/
        router.get('/asistentes/:slug',
            reunionControllerFE.mostrarAsistentes
        )

    //Muestra las reuniones por categorias
      router.get('/categoria/:categoria',
         reunionControllerFE.mostrarCategoria
      )    

    //Muestra los grupos en el front end
        router.get('/grupos/:id',
        gruposControllerFE.mostrarGrupo
        )

    
    /* AREA PRIVADA USUARIO IDENTIFICADO */

      //Mostrar los perfiles de los usuarios
        router.get('/usuarios/:id',
            authController.usuarioAutenticado,
            usuariosControllerFE.mostrarUsuario
        )
    //identificacion Usuario
    //Crear cuenta
    router.get('/', homeController.home);
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta', usuariosController.crearNuevaCuenta);
    router.get('/confirmar-cuenta/:correo', usuariosController.confirmarCuenta);
   

    //Iniciar Sesion
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion',
        authController.autenticarUsuario);
    //Recuperar contraseña del usuario
    router.get('/recuperar-contrasena', usuariosController.formRecuperarContrasena);  
    router.post('/recuperar-contrasena', usuariosController.recuperarContrasena);     
    router.get('/confirmar-contrasena/:correo', usuariosController.confirmarContrasena);
    //Modificar el password
    router.get('/cambiarPasswordEmail/:correo',
        usuariosController.formCambiarPasswordEmail
    );
    router.post('/cambiarPasswordEmail/:correo',
        usuariosController.cambiarPasswordEmail
    );

    //Cerrar sesion
    router.get('/cerrar-sesion',
        authController.usuarioAutenticado,
        authController.cerrarSesion
    );


    //Adminsitración
    //Panel administración usuario
    router.get('/administracion',
        authController.usuarioAutenticado,
        adminController.panelAdministracion
    );
    //Grupos
    //Nuevos grupos    
    router.get('/nuevo-grupo',
        authController.usuarioAutenticado,
        gruposController.formNuevoGrupo,
    );
    router.post('/nuevo-grupo',
        authController.usuarioAutenticado,
        gruposController.subirImagen,
        gruposController.crearGrupo,
    );
    //Editar Grupos
    router.get('/editar-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.formEditarGrupo
    )
    router.post('/editar-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.editarGrupo
    )
    //Editar la imagen del grupo
    router.get('/imagen-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.formEditarImagen
    );

    //Editar la imagen del grupo
    router.get('/imagen-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.formEditarImagen
    );
    router.post('/imagen-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.subirImagen,
        gruposController.editarImagen
    );
    //Eliminar Grupos
    router.get('/eliminar-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.formEliminarGrupo
    );
    router.post('/eliminar-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.eliminarGrupo
    );
    //Reunion 
    router.get('/nueva-reunion',
        authController.usuarioAutenticado,
        reunionController.formNuevoReunion
    );

    router.post('/nueva-reunion',
        authController.usuarioAutenticado,
        reunionController.crearReunion
    );

    //editar reunion
    router.get('/editar-reunion/:id',
        authController.usuarioAutenticado,
        reunionController.formEditarReunion
    );

    router.post('/editar-reunion/:id',
        authController.usuarioAutenticado,
        reunionController.editarReunion
    );

    // Eliminar grupo
    router.get('/eliminar-reunion/:id',
        authController.usuarioAutenticado,
        reunionController.formEliminarReunion
    );

    router.post('/eliminar-reunion/:id',
        authController.usuarioAutenticado,
        reunionController.eliminarReunion
    );

    // Editar información de perfil    
    router.get('/editar-perfil',
        authController.usuarioAutenticado,
        usuariosController.formEditarPerfil
    );

    router.post('/editar-perfil',
        authController.usuarioAutenticado,
        usuariosController.editarPerfil
    );

    //Modificar el password
    router.get('/cambiar-password',
        authController.usuarioAutenticado,
        usuariosController.formCambiarPassword
    );
    router.post('/cambiar-password',
        authController.usuarioAutenticado,
        usuariosController.cambiarPassword
    );

    //Imagenes de perfil
    router.get('/imagen-perfil',
        authController.usuarioAutenticado,
        usuariosController.formSubirImagenPerfil
    );

    router.post('/imagen-perfil',
        authController.usuarioAutenticado,
        usuariosController.subirImagen,
        usuariosController.guardarImagenPerfil
    );

    //Formulario de contacto
    router.get('/formularioContacto',
    authController.usuarioAutenticado,
    usuariosController.formFormularioContacto,
    );
    router.post('/formularioContacto',
    authController.usuarioAutenticado,
    usuariosController.formularioContacto,
    );
    return router;
}