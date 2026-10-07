const ProxyRemoto = require("./ProxyRemoto");

class OperacionesProxy extends ProxyRemoto {
    constructor(protocol) {
        super("Operaciones.js", "Operaciones", protocol);
    }
}

module.exports = OperacionesProxy;
