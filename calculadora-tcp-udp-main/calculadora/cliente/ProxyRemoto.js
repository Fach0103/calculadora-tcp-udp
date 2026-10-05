// Clase base de los proxies. Cualquier método llamado sobre el proxy
// se envía al servidor; no hace falta escribir un método por operación.
const ClienteTcp = require("./ClienteTcp");
const ClienteUdp = require("./ClienteUdp");
const config = require("./config");

class ProxyRemoto {
    constructor(path, className) {
        const cliente = (config.protocol && config.protocol.toLowerCase() === "udp")
            ? new ClienteUdp(config.ip, config.port)
            : new ClienteTcp(config.ip, config.port);

        return new Proxy(Object.create(new.target.prototype), {
            get(_, methodName) {
                if (methodName === "disconnect") return () => cliente.disconnect();
                if (typeof methodName === "symbol" || methodName === "then") return undefined;

                return async (...params) => {
                    const res = await cliente.enviar({ path, className, methodName, params });
                    if (!res.sts) throw new Error(res.msg);
                    return res.data.resp;
                };
            },
        });
    }
}

module.exports = ProxyRemoto;
