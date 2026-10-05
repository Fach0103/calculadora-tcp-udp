const ProxyRemoto = require("./ProxyRemoto");

class OperacionesProxy extends ProxyRemoto {
    constructor() {
        super("Operaciones.js", "Operaciones");
    }
}

module.exports = OperacionesProxy;
