const nodemailer = require('nodemailer');
const emailconfig = require('../config/emails');
const fs = require('fs');
const ejs = require('ejs');

//Configuracion para el servicio de envio de emial
let transportGmail = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user:emailconfig.user,
      pass:emailconfig.pass 
    }
});

exports.enviarEmailGmail = async (opciones) => {
    const status = ""
    //Leer el archivo para el mail
        const archivo = __dirname + `/../views/emails/${opciones.archivo}.ejs`;

    // Compilar el archivo, para mostrarlo en el correo
        const compilado = ejs.compile(fs.readFileSync(archivo,'utf-8'))

    // Crear el HTML del archivo compilado
        const html = compilado({url : opciones.url})

    // configurar las opciones del email
        const opcionesEmail = {
            from: 'noreplyreunion1@gmail.com',
            to:   opciones.usuario.email,
            subject: opciones.subject,
            html
        }
 
    // enviar el mail con las opciones anteriormente establecidas
    transportGmail.sendMail(opcionesEmail,(error, info)=>{
        if (error) {
            status = '500'
        } else {
            status = '200'

        }
      });
      return status
}       

exports.enviarFormulario = async (opciones) => {
   
    let status = ''
    // configurar las opciones del email
        const opcionesEmail = {
            from:  opciones.email,
            to: `noreplyreunion1@gmail.com,${opciones.email}` ,
            subject:`Mensage desde ${opciones.email}: ${opciones.asunto}`,
            text: opciones.descripcion
        }
    // enviar el mail con las opciones anteriormente establecidas
    transportGmail.sendMail(opcionesEmail,(error, info)=>{
        if (error) {
            status = '500'
        } else {
            status = '200'

        }
      });
      return status
}       

//Metodo antigua para enviar correos a una plataforma de simulacion de correos falsos.
// let transport = nodemailer.createTransport({
//     host : emailconfig.host,
//     port : emailconfig.port,
//     auth:{
//         user: emailconfig.user,
//         pass: emailconfig.pass
//     }
// });

// // let transport = nodemailer.createTransport({
// //     service : emailconfig.service,
// //     auth:{
// //         user: emailconfig.user,
// //         pass: emailconfig.pass
// //     }
// // });

// exports.enviarEmail = async (opciones) => {

//     //Leer el archivo para el mail
//         const archivo = __dirname + `/../views/emails/${opciones.archivo}.ejs`;

//     // Compilarlo
//         const compilado = ejs.compile(fs.readFileSync(archivo,'utf-8'))

//     // Crear el HTML
//         const html = compilado({url : opciones.url})
//     // configurar las opciones del email
//         const opcionesEmail = {
//             from: 'noreplyreunion1@gmail.com',
//             to:   opciones.usuario.email,
//             subject: opciones.subject,
//             html
//         }
//     // enviar el mail
//         const sendEmail = util.promisify(transport.sendMail, transport);
//         return sendEmail.call(transport,opcionesEmail);
// }  