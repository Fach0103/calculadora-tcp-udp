// Dónde está el servidor (se puede cambiar con variables de entorno)
module.exports = {
    ip: process.env.SERVER_HOST || "127.0.0.1",
    port: Number(process.env.SERVER_PORT) || 8080,
};
