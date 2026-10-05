class Operaciones {
    sumar(x, y) { return x + y; }
    restar(x, y) { return x - y; }
    mult(x, y) { return x * y; }
    div(x, y) {
        if (y === 0) throw new Error("No se puede dividir entre cero");
        return x / y;
    }
    // Ejemplo con cantidad variable de parámetros
    sumarTodos(...numeros) { return numeros.reduce((a, b) => a + b, 0); }
}

module.exports = Operaciones;
