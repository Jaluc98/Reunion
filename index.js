//Pagina principal donde tenemos la configuración de la aplicación.
//Import  
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const bodyParser = require('body-parser');
const routes = require('./routes');
const flash = require('connect-flash');
const session =  require('express-session');
const cookieParser = require('cookie-parser');
var expressValidator = require('express-validator');
const passport = require('./config/passport');
//Configuración y modelos de la base de datos
const db = require('./config/db')
    require('./models/Usuario')
    require('./models/Categorias')
    require('./models/Comentarios')
    require('./models/Grupos')
    require('./models/Reunion')
    db.sync().then(()=> console.log('DB Conectada')).catch((error)=>console.log(error));

    

// Variables de Desarrollo    
require('dotenv').config({path:'variable.env'});


//Variable donde guardamos la funcion express para ejecutar sus propiedades 
// y ejecutar el proyecto
const app = express();
// Body parser, leer formularios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Express validator (validación con bastantes funciones)
// api.use(expressValidator());

app.use(expressValidator());

//Habilitar plantillas EJS de express como template 
// Habilitamos paquetes de EJS
app.use(expressLayouts);
app.set('view engine','ejs');


//Ubicación vistas
//dirname nos da la ruta actual
app.set('views', path.join(__dirname,'./views'));

//archivos staticos 
app.use(express.static('public'));

//Habiliar Cookie parser

app.use(cookieParser());

//Crear la session

app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave : false,
    saveUninitialized : false
}))

// iniciar passport

app.use(passport.initialize());
app.use(passport.session());

//Agragar flash messages

app.use(flash())

// Middleware (usuario logueado, flash messages, fecha actual)

app.use((req, res, next)=>{
    res.locals.usuario =  {...req.user} || null;
    res.locals.mensajes = req.flash();
    const fecha = new Date();
    res.locals.year = fecha.getFullYear();
    next();
});

//Routing, configuración de rutas de la aplicació
app.use('/', routes());
// //Control sobre errores de página 404 y 500
// app.use(function(req, res, next){
//     res.status(404).render('404')
//     // res.status(500).render('500')
// });


//Agregar el Puerto donde queremos que se despliegue el servidor
app.listen(process.env.PORT, ()=>{
    console.log('El servidor esta funcionando')
});
