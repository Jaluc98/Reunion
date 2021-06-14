const path = require("path")
const webpack = require("webpack")
// Nos sirve para convertir los archivos a estaticos, empaquetar 
//aplicacion dinamique en archivos estaticos, que luego carga en el servidor
module.exports = {
    entry: './public/js/app.js',  
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, "./public/dist")
    },
    module: {
        rules: [    
        {
            test: /\.m?js$/,
            use: {
            loader: 'babel-loader',
            options: {
                presets: ['@babel/preset-env']
            }
            }
        }
        ]
    }
}