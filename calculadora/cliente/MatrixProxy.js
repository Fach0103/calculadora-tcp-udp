const ProxyRemoto = require("./ProxyRemoto");

class MatrixProxy extends ProxyRemoto {
    constructor() {
        super("Matrix.js", "Matrix");
    }
}

module.exports = MatrixProxy;
