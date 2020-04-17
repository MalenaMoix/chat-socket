var socket = io();

var params = new URLSearchParams(window.location.search);
if (!params.has("nombre") || !params.has("sala")) {
    window.location = "index.html";
    throw new Error("El nombre y la sala son necesarios");
}

var usuario = {
    nombre: params.get("nombre"),
    sala: params.get("sala"),
};

socket.on("connect", function() {
    console.log("Conectado al servidor");

    socket.emit("entrarChat", usuario, function(respuesta) {
        console.log("Usuarios conectados:", respuesta);
    });
});

socket.on("disconnect", function() {
    console.log("Perdimos conexión con el servidor");
});

/*socket.emit(
    "enviarMensaje", {
        mensaje: "Hola a todos",
    },
    function(resp) {
        console.log("respuesta server: ", resp);
    }
);*/

socket.on("crearMensaje", function(mensaje) {
    console.log("Servidor:", mensaje);
});

//Escuchar cuando un usuario entra o sale del chat
socket.on("listaPersonas", function(personas) {
    console.log(personas);
});

//Mensajes privados
socket.on("mensajePrivado", function(mensaje) {
    console.log("Mensaje privado:", mensaje);
});