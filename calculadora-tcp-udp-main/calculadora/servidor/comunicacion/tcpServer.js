// Servidor TCP
// Uso: node servidor/comunicacion/tcpServer.js [ip] [port]
const net = require("net");
const Despachador = require("./Despachador");

const IP = process.argv[2] || process.env.HOST || "0.0.0.0";
const PORT = Number(process.argv[3]) || Number(process.env.PORT) || 8080;

const despachador = new Despachador();

const server = net.createServer((socket) => {
    console.log("Cliente conectado:", socket.remoteAddress + ":" + socket.remotePort);

    let buffer = ""; // Un JSON por línea delimitado por \n
    socket.on("data", async (data) => {
        buffer += data.toString();
        let i;
        while ((i = buffer.indexOf("\n")) >= 0) {
            const linea = buffer.slice(0, i);
            buffer = buffer.slice(i + 1);
            if (!linea.trim()) continue;
            console.log("Solicitud recibida:", linea);
            const res = await despachador.procesar(linea);
            socket.write(JSON.stringify(res) + "\n");
        }
    });

    socket.on("end", () => console.log("Cliente desconectado:", socket.remoteAddress + ":" + socket.remotePort));
    socket.on("error", (err) => console.error("Error de socket:", err.message));
});

server.listen(PORT, IP, () => {
    console.log(`Servidor TCP escuchando en ${IP}:${PORT}`);
});
