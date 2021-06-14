const Reuniones = require('../../models/Reunion')
const Usuarios = require('../../models/Usuario')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const moment = require('moment')
const Grupos = require('../../models/Grupos')

const comprobarUrl =  (url)=>{
    const fs = require('fs');
    const resultado = fs.existsSync(url);
    return resultado
  }
exports.resultadoBusqueda = async (req,res)=>{
    
  //Leer detos de la url
  const {categoria,titulo} = req.query
      // si la categoria esta vacia
      let query;
      let reuniones =""
      if(categoria === ''){
        //Poner la categoria vacia cuando hacemos una busqueda solo con reunion
        //La siguiente consulta buscamos segun la query que el usuario a introducido en la busqueda
        query = '';
         reuniones = await Reuniones.findAll({ 
            where :  { 
                titulo : { [Op.iLike] :  '%' + titulo + '%' },
            },
            include: [
                {
                    model: Grupos, 
                    query
                },
                { 
                    model: Usuarios, 
                    attributes : ['id',  'nombre', 'imagen']
                }
            ]
        });
          
      } else {
          //Buscar por categorías o conjuntamente con la 
        reuniones = await Reuniones.findAll({ 
            where :  { 
                titulo : { [Op.iLike] :  '%' + titulo + '%' },
            },
            include: [
                {
                    model: Grupos, 
                    where : {
                        categoriaId : { [Op.eq] : categoria}
                    }
                },
                { 
                    model: Usuarios, 
                    attributes : ['id',  'nombre', 'imagen']
                }
            ]
        });
          
      }

    //renderizar la busqueda pasandale las variables
    res.render('busqueda',{
        nombrePagina : 'Resultados Búsqueda',
        reuniones,
        moment,
        comprobarUrl
    })
}