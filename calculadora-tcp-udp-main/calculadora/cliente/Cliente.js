const OperacionesProxy = require("./OperacionesProxy");
const MatrixProxy = require("./MatrixProxy");

async function main() {
    let ops = new OperacionesProxy();

    let r = await ops.sumar(5, 3);
    console.log(r);

    let r2 = await ops.restar(10, 4);
    console.log(r2);

    let r3 = await ops.mult(3, 4);
    console.log(r3);

    let r4 = await ops.div(10, 2);
    console.log(r4);

    let matrix = new MatrixProxy();

    let r5 = await matrix.suma([[1, 2], [3, 4]], [[5, 6], [7, 8]]);
    console.log(r5);

    let r6 = await matrix.inversa([[4, 7], [2, 6]]);
    console.log(r6);

    ops.disconnect();
    matrix.disconnect();
}

main();
