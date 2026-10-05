// Dónde está el servidor (configurable por argumentos CLI o variables de entorno)
// Uso: node cliente/index.js [ip] [port] [protocol: tcp|udp]
module.exports = {
    ip: process.argv[2] || process.env.SERVER_HOST || "127.0.0.1",
    port: Number(process.argv[3]) || Number(process.env.SERVER_PORT) || 8080,
    protocol: process.argv[4] || process.env.PROTOCOL || "tcp",
};
