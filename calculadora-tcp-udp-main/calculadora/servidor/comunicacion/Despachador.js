// Ejecuta una solicitud sobre cualquier clase y cualquier cantidad de parámetros usando Reflexión.
// Lo comparten el servidor TCP y el UDP.
const path = require("path");

const CLASES_DIR = path.join(__dirname, "..", "operaciones");

class Despachador {
    constructor(clasesDir = CLASES_DIR) {
        this.clasesDir = clasesDir;
    }

    formatearRespuesta(sts, msg, resp) {
        return { sts, msg, data: sts ? { resp } : {} };
    }

    async despachar(req) {
        try {
            const { path: ruta, className, methodName, params = [] } = req;

            if (!ruta || !className || !methodName) {
                throw new Error("Faltan campos: path, className o methodName");
            }
            if (!Array.isArray(params)) {
                throw new Error("El campo 'params' debe ser un arreglo");
            }

            // Solo se permite cargar archivos dentro de servidor/operaciones
            const archivo = path.resolve(this.clasesDir, ruta);
            if (!archivo.startsWith(this.clasesDir + path.sep)) {
                throw new Error("Path fuera del directorio de operaciones");
            }

            // Carga dinámica del módulo
            let modulo;
            try {
                modulo = require(archivo);
            } catch (e) {
                throw new Error(`No se pudo cargar "${ruta}": ${e.message}`);
            }

            // Reflexión: obtener la clase desde el módulo exportado
            let Clase = null;
            if (Reflect.has(modulo, className)) {
                Clase = Reflect.get(modulo, className);
            } else if (modulo.name === className) {
                Clase = modulo;
            } else if (modulo.default && (modulo.default.name === className || Reflect.has(modulo.default, className))) {
                Clase = modulo.default.name === className ? modulo.default : Reflect.get(modulo.default, className);
            } else if (typeof modulo === "function") {
                Clase = modulo;
            }

            if (typeof Clase !== "function") {
                throw new Error(`Clase "${className}" no encontrada en ${ruta}`);
            }

            if (methodName === "constructor" || methodName.startsWith("_")) {
                throw new Error("Método no permitido");
            }

            // Reflexión: determinar si el método es de instancia o estático
            let objetivo;
            const enPrototipo = Clase.prototype && Reflect.has(Clase.prototype, methodName);
            const enClase = Reflect.has(Clase, methodName);

            if (enPrototipo) {
                // Instanciación reflexiva mediante Reflect.construct
                objetivo = Reflect.construct(Clase, []);
            } else if (enClase) {
                objetivo = Clase;
            } else {
                throw new Error(`Método "${methodName}" no existe en ${className}`);
            }

            // Reflexión: obtener la referencia a la función
            const metodo = Reflect.get(objetivo, methodName);
            if (typeof metodo !== "function") {
                throw new Error(`"${methodName}" no es una función ejecutable en ${className}`);
            }

            // Invocación reflexiva del método mediante Reflect.apply
            const resp = await Reflect.apply(metodo, objetivo, params);
            return this.formatearRespuesta(true, "OK", resp);
        } catch (e) {
            return this.formatearRespuesta(false, e.message);
        }
    }

    // Recibe el texto crudo, devuelve el objeto respuesta (conserva el id si viene)
    async procesar(texto) {
        let req;
        try {
            req = JSON.parse(texto);
        } catch (e) {
            return this.formatearRespuesta(false, "JSON inválido");
        }

        const res = await this.despachar(req);
        if (req && req.id !== undefined) {
            res.id = req.id;
        }
        return res;
    }
}

// Instancia para mantener compatibilidad
const instanciaDefault = new Despachador();

module.exports = Despachador;
module.exports.Despachador = Despachador;
module.exports.despachar = (req) => instanciaDefault.despachar(req);
module.exports.procesar = (texto) => instanciaDefault.procesar(texto);
