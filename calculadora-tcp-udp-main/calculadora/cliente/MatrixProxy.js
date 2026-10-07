const ProxyRemoto = require("./ProxyRemoto");

class MatrixProxy extends ProxyRemoto {
    constructor(protocol) {
        super("Matrix.js", "Matrix", protocol);
    }
}

module.exports = MatrixProxy;
