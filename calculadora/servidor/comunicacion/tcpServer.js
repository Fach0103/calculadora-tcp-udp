// Servidor TCP
// Uso: node servidor/comunicacion/tcpServer.js [ip] [port]
const net = require("net");
const { procesar } = require("./Despachador");

const IP = process.argv[2] || "127.0.0.1";
const PORT = Number(process.argv[3]) || 8080;

const server = net.createServer((socket) => {
    console.log("Cliente conectado:", socket.remoteAddress + ":" + socket.remotePort);

    let buffer = ""; // un JSON por línea
    socket.on("data", async (data) => {
        buffer += data.toString();
        let i;
        while ((i = buffer.indexOf("\n")) >= 0) {
            const linea = buffer.slice(0, i);
            buffer = buffer.slice(i + 1);
            if (!linea.trim()) continue;
            console.log("Solicitud:", linea);
            const res = await procesar(linea);
            socket.write(JSON.stringify(res) + "\n");
        }
    });

    socket.on("end", () => console.log("Cliente desconectado"));
    socket.on("error", (err) => console.error("Error de socket:", err.message));
});

server.listen(PORT, IP, () => {
    console.log(`Servidor TCP abierto en ${IP}:${PORT}`);
});
