const passport = require('passport');
//Configuracion de passport para identificar al usuario
// si el usuario identificado existe te redirije a adminstracion si no te lleva inciar sesion
exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});

// revisa si el usuario esta autenticado o no
exports.usuarioAutenticado = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // sino esta autenticado
    return res.redirect('/iniciar-sesion');
}

// cerrar sesion
exports.cerrarSesion = (req, res, next) => {
    // si el usuario esta autenticado, cierra la sesion
    req.logout();
    req.flash('correcto', 'Cerraste sesión correctamente');
    res.redirect('/iniciar-sesion')
    next();
}
