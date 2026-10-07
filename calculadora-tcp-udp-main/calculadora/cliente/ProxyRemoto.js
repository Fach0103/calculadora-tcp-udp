// Clase base de los proxies. Cualquier método llamado sobre el proxy
// se envía al servidor; el cliente permanece 100% tonto y sin lógica.
const ClienteTcp = require("./ClienteTcp");
const ClienteUdp = require("./ClienteUdp");
const config = require("./config");

class ProxyRemoto {
    constructor(path, className, protocol) {
        const proto = (protocol || config.protocol || "tcp").toLowerCase();

        // Inicializa el transporte necesario según la configuración (tcp, udp o ambos)
        const clienteTcp = (proto === "tcp" || proto === "ambos") ? new ClienteTcp(config.ip, config.port) : null;
        const clienteUdp = (proto === "udp" || proto === "ambos") ? new ClienteUdp(config.ip, config.port) : null;

        return new Proxy(Object.create(new.target.prototype), {
            get(_, methodName) {
                if (methodName === "disconnect") {
                    return () => {
                        if (clienteTcp) clienteTcp.disconnect();
                        if (clienteUdp) clienteUdp.disconnect();
                    };
                }
                if (typeof methodName === "symbol" || methodName === "then") return undefined;

                return async (...params) => {
                    const req = { path, className, methodName, params };

                    // Si el protocolo es 'ambos', envía por TCP y UDP en simultáneo
                    if (proto === "ambos") {
                        const [resTcp] = await Promise.all([
                            clienteTcp.enviar(req),
                            clienteUdp.enviar(req),
                        ]);
                        if (!resTcp.sts) throw new Error(resTcp.msg);
                        return resTcp.data.resp;
                    }

                    // Si es una sola conexión (solo tcp o solo udp)
                    const cliente = clienteTcp || clienteUdp;
                    const res = await cliente.enviar(req);
                    if (!res.sts) throw new Error(res.msg);
                    return res.data.resp;
                };
            },
        });
    }
}

module.exports = ProxyRemoto;
