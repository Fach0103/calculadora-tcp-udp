// Cliente de transporte UDP
const dgram = require("dgram");

class ClienteUdp {
    constructor(host = "127.0.0.1", port = 8081) {
        this.host = host;
        this.port = port;
        this.socket = null;
        this.pendientes = [];
    }

    inicializar() {
        if (this.socket) return;
        this.socket = dgram.createSocket("udp4");

        this.socket.on("message", (msg) => {
            try {
                const respuesta = JSON.parse(msg.toString().trim());
                if (this.pendientes.length > 0) {
                    const { resolve } = this.pendientes.shift();
                    resolve(respuesta);
                }
            } catch (err) {
                console.error("Error al parsear respuesta UDP:", err);
            }
        });

        this.socket.on("error", (err) => {
            console.error("Error en socket UDP:", err);
            while (this.pendientes.length > 0) {
                const { reject } = this.pendientes.shift();
                reject(err);
            }
        });
    }

    async enviar(datos) {
        this.inicializar();

        return new Promise((resolve, reject) => {
            this.pendientes.push({ resolve, reject });
            const mensaje = Buffer.from(JSON.stringify(datos) + "\n");
            this.socket.send(mensaje, this.port, this.host, (err) => {
                if (err) {
                    const idx = this.pendientes.findIndex((p) => p.resolve === resolve);
                    if (idx !== -1) this.pendientes.splice(idx, 1);
                    reject(err);
                }
            });
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}

module.exports = ClienteUdp;
