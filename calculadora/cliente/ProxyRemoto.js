// Clase base de los proxies. Cualquier método llamado sobre el proxy
// se envía al servidor; no hace falta escribir un método por operación.
const Cliente = require("./Cliente");
const config = require("./config");

class ProxyRemoto {
    constructor(path, className) {
        const cliente = new Cliente(config.ip, config.port);

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
