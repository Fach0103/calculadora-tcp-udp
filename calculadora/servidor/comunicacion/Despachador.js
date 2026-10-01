// Ejecuta una solicitud sobre cualquier clase y cualquier cantidad de parámetros.
// Lo comparten el servidor TCP (fase 3) y el UDP (fase 4).
const path = require("path");

const CLASES_DIR = path.join(__dirname, "..", "operaciones");

function respuesta(sts, msg, resp) {
    return { sts, msg, data: sts ? { resp } : {} };
}

async function despachar(req) {
    try {
        const { path: ruta, className, methodName, params = [] } = req;

        if (!ruta || !className || !methodName)
            throw new Error("Faltan campos: path, className o methodName");
        if (!Array.isArray(params)) throw new Error("params debe ser un arreglo");

        // Solo se permite cargar archivos dentro de servidor/operaciones
        const archivo = path.resolve(CLASES_DIR, ruta);
        if (!archivo.startsWith(CLASES_DIR + path.sep))
            throw new Error("Path fuera del directorio de operaciones");

        let modulo;
        try {
            modulo = require(archivo);
        } catch (e) {
            throw new Error(`No se pudo cargar "${ruta}"`);
        }

        const Clase = modulo[className] || (modulo.name === className ? modulo : modulo.default);
        if (typeof Clase !== "function")
            throw new Error(`Clase "${className}" no encontrada en ${ruta}`);

        if (methodName === "constructor" || methodName.startsWith("_"))
            throw new Error("Método no permitido");

        // Método de instancia o estático
        const objetivo = typeof Clase.prototype[methodName] === "function" ? new Clase() : Clase;
        if (typeof objetivo[methodName] !== "function")
            throw new Error(`Método "${methodName}" no existe en ${className}`);

        const resp = await objetivo[methodName](...params);
        return respuesta(true, "OK", resp);
    } catch (e) {
        return respuesta(false, e.message);
    }
}

// Recibe el texto crudo, devuelve el objeto respuesta (conserva el id si viene)
async function procesar(texto) {
    let req;
    try {
        req = JSON.parse(texto);
    } catch (e) {
        return respuesta(false, "JSON inválido");
    }
    const res = await despachar(req);
    if (req && req.id !== undefined) res.id = req.id;
    return res;
}

module.exports = { despachar, procesar };
