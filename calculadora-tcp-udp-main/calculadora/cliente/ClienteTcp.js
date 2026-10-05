// Cliente de transporte TCP
const net = require("net");

class ClienteTcp {
    constructor(host = "127.0.0.1", port = 8080) {
        this.host = host;
        this.port = port;
        this.socket = null;
        this.buffer = "";
        this.pendientes = [];
        this.conectando = null;
    }

    conectar() {
        if (this.socket && !this.socket.destroyed) {
            return Promise.resolve();
        }
        if (this.conectando) {
            return this.conectando;
        }

        this.conectando = new Promise((resolve, reject) => {
            this.socket = net.createConnection({ host: this.host, port: this.port }, () => {
                this.conectando = null;
                resolve();
            });

            this.socket.on("data", (data) => {
                this.buffer += data.toString();
                let i;
                while ((i = this.buffer.indexOf("\n")) >= 0) {
                    const linea = this.buffer.slice(0, i);
                    this.buffer = this.buffer.slice(i + 1);
                    if (!linea.trim()) continue;

                    let respuesta;
                    try {
                        respuesta = JSON.parse(linea);
                    } catch (err) {
                        console.error("Error al parsear JSON recibido:", err);
                        continue;
                    }

                    if (this.pendientes.length > 0) {
                        const { resolve } = this.pendientes.shift();
                        resolve(respuesta);
                    }
                }
            });

            this.socket.on("error", (err) => {
                this.conectando = null;
                while (this.pendientes.length > 0) {
                    const { reject } = this.pendientes.shift();
                    reject(err);
                }
            });

            this.socket.on("close", () => {
                this.socket = null;
                this.conectando = null;
            });
        });

        return this.conectando;
    }

    async enviar(datos) {
        await this.conectar();

        return new Promise((resolve, reject) => {
            this.pendientes.push({ resolve, reject });
            const mensaje = JSON.stringify(datos) + "\n";
            this.socket.write(mensaje, (err) => {
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
            this.socket.end();
            this.socket = null;
        }
    }
}

module.exports = ClienteTcp;
