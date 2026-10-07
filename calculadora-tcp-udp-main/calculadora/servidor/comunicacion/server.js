// Servidor Unificado (escucha TCP y UDP en el mismo puerto simultáneamente)
// Uso: node servidor/comunicacion/server.js [ip] [port]
const net = require("net");
const dgram = require("dgram");
const Despachador = require("./Despachador");

const IP = process.argv[2] || process.env.HOST || "0.0.0.0";
const PORT = Number(process.argv[3]) || Number(process.env.PORT) || 8080;

const despachador = new Despachador();

// 1. Servidor TCP
const tcpServer = net.createServer((socket) => {
    console.log(`[TCP] Cliente conectado: ${socket.remoteAddress}:${socket.remotePort}`);

    let buffer = ""; // Delimitado por salto de línea \n
    socket.on("data", async (data) => {
        buffer += data.toString();
        let i;
        while ((i = buffer.indexOf("\n")) >= 0) {
            const linea = buffer.slice(0, i);
            buffer = buffer.slice(i + 1);
            if (!linea.trim()) continue;
            console.log(`[TCP] Solicitud recibida:`, linea);
            const res = await despachador.procesar(linea);
            socket.write(JSON.stringify(res) + "\n");
        }
    });

    socket.on("end", () => {
        console.log(`[TCP] Cliente desconectado: ${socket.remoteAddress}:${socket.remotePort}`);
    });

    socket.on("error", (err) => {
        console.error(`[TCP] Error de socket:`, err.message);
    });
});

tcpServer.listen(PORT, IP, () => {
    console.log(`[TCP] Servidor escuchando en ${IP}:${PORT}`);
});

// 2. Servidor UDP
const udpServer = dgram.createSocket("udp4");

udpServer.on("message", async (msg, rinfo) => {
    const texto = msg.toString().trim();
    if (!texto) return;

    console.log(`[UDP] Solicitud recibida de ${rinfo.address}:${rinfo.port}:`, texto);
    const res = await despachador.procesar(texto);

    const respuestaBuffer = Buffer.from(JSON.stringify(res) + "\n");
    udpServer.send(respuestaBuffer, rinfo.port, rinfo.address, (err) => {
        if (err) {
            console.error(`[UDP] Error enviando respuesta a ${rinfo.address}:${rinfo.port}:`, err.message);
        }
    });
});

udpServer.on("listening", () => {
    const addr = udpServer.address();
    console.log(`[UDP] Servidor escuchando en ${addr.address}:${addr.port}`);
});

udpServer.on("error", (err) => {
    console.error(`[UDP] Error en servidor:`, err.message);
});

udpServer.bind(PORT, IP);

console.log(`\n========================================================`);
console.log(` Servidor Calculadora ACTIVO (TCP + UDP) en ${IP}:${PORT}`);
console.log(`========================================================\n`);
