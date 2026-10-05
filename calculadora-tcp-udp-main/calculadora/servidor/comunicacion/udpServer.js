// Servidor UDP
// Uso: node servidor/comunicacion/udpServer.js [ip] [port]
const dgram = require("dgram");
const Despachador = require("./Despachador");

const IP = process.argv[2] || process.env.HOST || "0.0.0.0";
const PORT = Number(process.argv[3]) || Number(process.env.PORT) || 8081;

const despachador = new Despachador();
const server = dgram.createSocket("udp4");

server.on("message", async (msg, rinfo) => {
    const texto = msg.toString().trim();
    if (!texto) return;

    console.log(`Solicitud UDP recibida de ${rinfo.address}:${rinfo.port}:`, texto);
    const res = await despachador.procesar(texto);

    const respuestaBuffer = Buffer.from(JSON.stringify(res) + "\n");
    server.send(respuestaBuffer, rinfo.port, rinfo.address, (err) => {
        if (err) {
            console.error(`Error enviando respuesta UDP a ${rinfo.address}:${rinfo.port}:`, err.message);
        }
    });
});

server.on("listening", () => {
    const addr = server.address();
    console.log(`Servidor UDP escuchando en ${addr.address}:${addr.port}`);
});

server.on("error", (err) => {
    console.error("Error en servidor UDP:", err.message);
    server.close();
});

server.bind(PORT, IP);
