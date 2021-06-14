const Categorias = require('../models/Categorias');
const Reuniones = require('../models/Reunion');
const moment = require('moment');
const Sequelize = require('sequelize');
const Grupos = require('../models/Grupos');
const Usuarios = require('../models/Usuario');
const fs = require('fs');
const Op = Sequelize.Op
//Controlador de Pagina principal, exportamos la funcion del controlador home donde
//rederizamos la vista y le pasamos las variables para verlas en la vista
const comprobarUrl =  (url)=>{
    const fs = require('fs');
    const resultado = fs.existsSync(url);
    return resultado
}
exports.home = async (req, res) => {

    //Promise para consultas en el home

    const consultas = [];
    //Coger todas las categorias
    consultas.push(Categorias.findAll({}));
    //consultar las tres reuniones que se han creado
    consultas.push(Reuniones.findAll({
        attributes: ['slug', 'titulo', 'fecha', 'hora'],
        where: {
            fecha: { [Op.gte]: moment(new Date()).format("YYYY-MM-DD") }
        },
        limit: 3,
        order: [
            ['fecha', 'ASC']
        ],
        include: [
            {
                model: Grupos,
                attributes: ['imagen']

            },
            {
                model: Usuarios,
                attributes: ['id','nombre', 'imagen']
            }
        ]
    }));
    const [categorias, reunion] = await Promise.all(consultas);
    //Renderizar la pagina principal con sus respectiva variantes
    res.render('home', {
        nombrePagina: 'Inicio',
        categorias,
        reunion,
        moment,
        comprobarUrl
    })
};