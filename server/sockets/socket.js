const { io } = require("../server");

const { Usuarios } = require("../classes/usuarios");
const usuario = new Usuarios();

const { crearMensaje } = require("../utils/utils");

io.on("connection", (client) => {
    console.log("Usuario conectado");

    client.on("entrarChat", (data, callback) => {
        if (!data.nombre || !data.sala) {
            return callback({
                err: true,
                mensaje: "El nombre y la sala son necesarios",
            });
        }

        client.join(data.sala);

        usuario.agregarPersona(client.id, data.nombre, data.sala);

        client.broadcast
            .to(data.sala)
            .emit("listaPersonas", usuario.getPersonasPorSala(data.sala));

        client.broadcast
            .to(data.sala)
            .emit(
                "crearMensaje",
                crearMensaje("Administrador", `${data.nombre} se ha unido al chat`)
            );

        callback(usuario.getPersonasPorSala(data.sala));
    });

    client.on("enviarMensaje", (data, callback) => {
        let persona = usuario.getPersona(client.id);

        let mensaje = crearMensaje(persona.nombre, data.mensaje);

        client.broadcast.to(persona.sala).emit("crearMensaje", mensaje);

        callback(mensaje);
    });

    client.on("disconnect", () => {
        let personaBorrada = usuario.borrarPersona(client.id);

        client.broadcast
            .to(personaBorrada.sala)
            .emit(
                "crearMensaje",
                crearMensaje(
                    "Administrador",
                    `${personaBorrada.nombre} abandono el chat`
                )
            );

        client.broadcast
            .to(personaBorrada.sala)
            .emit("listaPersonas", usuario.getPersonasPorSala(personaBorrada.sala));
    });

    //Mensajes privados
    //Lo que va a hacer el servidor cuando alguien quiera mandar un mensaje privado a alguien
    client.on("mensajePrivado", (data) => {
        let persona = usuario.getPersona(client.id);

        client.broadcast
            .to(data.para)
            .emit("mensajePrivado", crearMensaje(persona.nombre, data.mensaje));
    });
});