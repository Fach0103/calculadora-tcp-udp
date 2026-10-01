class Matrix {
    suma(mA, mB) {
        if (mA.length !== mB.length || mA[0].length !== mB[0].length)
            throw new Error("Las matrices deben tener las mismas dimensiones");
        return mA.map((fila, i) => fila.map((v, j) => v + mB[i][j]));
    }

    // Inversa por Gauss-Jordan
    inversa(m) {
        const n = m.length;
        if (!m.every((f) => f.length === n)) throw new Error("La matriz debe ser cuadrada");
        const a = m.map((f, i) => [...f, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
        for (let c = 0; c < n; c++) {
            let p = c;
            for (let r = c + 1; r < n; r++) if (Math.abs(a[r][c]) > Math.abs(a[p][c])) p = r;
            if (Math.abs(a[p][c]) < 1e-12) throw new Error("La matriz es singular (no tiene inversa)");
            [a[c], a[p]] = [a[p], a[c]];
            const piv = a[c][c];
            a[c] = a[c].map((v) => v / piv);
            for (let r = 0; r < n; r++) {
                if (r === c) continue;
                const f = a[r][c];
                a[r] = a[r].map((v, k) => v - f * a[c][k]);
            }
        }
        return a.map((f) => f.slice(n));
    }
}

module.exports = Matrix;
