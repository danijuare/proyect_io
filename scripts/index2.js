document.addEventListener('DOMContentLoaded', () => {
    generarMatriz();
});

function limpiarDatos() {
    window.location.reload();
}

/**
 * Genera la matriz de entrada basada en el tamaño 'N' del input.
 * Rellena las celdas con valores aleatorios iniciales.
 */
function generarMatriz() {
    const sizeInput = document.getElementById('matrix-size');
    const N = parseInt(sizeInput.value);

    if (isNaN(N) || N < 2 || N > 8) {
        Swal.fire({
            icon: 'error',
            title: 'Tamaño Inválido',
            text: 'Por favor, ingrese un tamaño de matriz (N) entre 2 y 8.',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    const container = document.getElementById('matrix-container');
    container.innerHTML = '';

    // Ajusta las propiedades de CSS para la matriz si usas CSS Grid
    container.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
    container.style.gridTemplateRows = `repeat(${N}, 1fr)`;


    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            const input = document.createElement('input');
            input.type = 'number';
            input.id = `cost-${i}-${j}`;
            // Rellena con un costo aleatorio (entre 1 y 20)
            input.value = Math.floor(Math.random() * 20) + 1;
            input.min = "0"; // Asegura que los costos sean no negativos
            cell.appendChild(input);
            container.appendChild(cell);
        }
    }

    document.getElementById('solve-button').disabled = false;
    document.getElementById('cost-result').textContent = '...';
    document.getElementById('assignment-table').innerHTML = '';
}

/**
 * Recoge los datos de la matriz y ejecuta el algoritmo Húngaro.
 */
async function resolverHungaro() {
    Swal.fire({
        title: 'Resolviendo...',
        text: 'Aplicando el algoritmo Húngaro. Por favor, espera.',
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/10700/10700344.png',
        imageWidth: 100,
        showConfirmButton: false,
        allowOutsideClick: false,
        willOpen: () => {
            Swal.showLoading();
        }
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    const N = parseInt(document.getElementById('matrix-size').value);
    const originalMatrix = [];

    // 1. Recolección y validación de la matriz de entrada
    for (let i = 0; i < N; i++) {
        const row = [];
        for (let j = 0; j < N; j++) {
            const input = document.getElementById(`cost-${i}-${j}`);
            const value = parseInt(input.value);

            if (isNaN(value) || value < 0) {
                Swal.close();
                await Swal.fire({
                    icon: 'error',
                    title: 'Error de Entrada',
                    text: "Por favor, ingrese costos válidos (números no negativos) en todas las celdas.",
                    confirmButtonText: 'Corregir'
                });
                input.focus();
                return;
            }
            row.push(value);
        }
        originalMatrix.push(row);
    }

    // 2. Ejecución del algoritmo
    try {
        const { totalCost, assignments } = hungarianAlgorithm(originalMatrix);

        // 3. Mostrar resultados
        mostrarResultados(originalMatrix, assignments, totalCost);

        Swal.close();
        Swal.fire({
            icon: 'success',
            title: '¡Respuesta Generada Correctamente!',
            text: `El costo mínimo de asignación es: ${totalCost}`,
            confirmButtonText: 'Ver Resultados'
        });
    } catch (e) {
        Swal.close();
        Swal.fire({
            icon: 'error',
            title: 'Error en el Cálculo',
            text: `Ocurrió un error inesperado al aplicar el algoritmo: ${e.message}`,
            confirmButtonText: 'Aceptar'
        });
    }
}

/**
 * Muestra la matriz original resaltando las asignaciones y el costo total.
 */
function mostrarResultados(originalMatrix, assignments, totalCost) {
    const table = document.getElementById('assignment-table');
    table.innerHTML = '';
    const N = originalMatrix.length;

    // Crear encabezados de tabla
    const headerRow = table.insertRow();
    const cornerCell = headerRow.insertCell();
    cornerCell.textContent = 'Tarea ↓ / Recurso →';
    cornerCell.classList.add('header-corner');

    for (let j = 0; j < N; j++) {
        const headerCell = headerRow.insertCell();
        headerCell.textContent = `Recurso ${j + 1}`;
        headerCell.classList.add('header-col');
    }

    // Rellenar filas con datos de la matriz
    for (let i = 0; i < N; i++) {
        const row = table.insertRow();

        const rowHeaderCell = row.insertCell();
        rowHeaderCell.textContent = `Tarea ${i + 1}`;
        rowHeaderCell.classList.add('header-row');

        for (let j = 0; j < N; j++) {
            const cell = row.insertCell();
            cell.textContent = originalMatrix[i][j];

            // Resaltar la asignación óptima
            if (assignments[i] === j) {
                cell.classList.add('assigned');
            }
        }
    }

    document.getElementById('cost-result').textContent = totalCost;
}

// =========================================================
// ⭐ IMPLEMENTACIÓN DEL MÉTODO HÚNGARO (CORRECTO) ⭐
// Esta es la implementación algorítmica compleja.
// =========================================================

/**
 * Función principal que implementa el Algoritmo Húngaro (Minimización).
 * @param {number[][]} originalMatrix La matriz de costos de entrada.
 * @returns {{totalCost: number, assignments: number[]}} Un objeto con el costo total y las asignaciones (índice de columna por fila).
 */
function hungarianAlgorithm(originalMatrix) {
    const N = originalMatrix.length;
    // Crea una copia profunda para trabajar con ella
    let costMatrix = originalMatrix.map(row => [...row]);

    // Paso 1: Reducción de Filas
    for (let i = 0; i < N; i++) {
        const minVal = Math.min(...costMatrix[i]);
        for (let j = 0; j < N; j++) {
            costMatrix[i][j] -= minVal;
        }
    }

    // Paso 2: Reducción de Columnas
    for (let j = 0; j < N; j++) {
        let minVal = Infinity;
        for (let i = 0; i < N; i++) {
            minVal = Math.min(minVal, costMatrix[i][j]);
        }
        for (let i = 0; i < N; i++) {
            costMatrix[i][j] -= minVal;
        }
    }

    let assignments = new Array(N).fill(-1);
    let numLines = 0;

    // Bucle principal para encontrar la asignación óptima
    while (numLines < N) {

        // -------------------------------------------------------------------
        // PASO 3: Encontrar la asignación de ceros y la cobertura mínima.
        // -------------------------------------------------------------------

        // * marks: 0 = nada, 1 = 'prima' (cero no asignado), 2 = asignado (*)
        const marks = Array(N).fill(0).map(() => Array(N).fill(0));
        const coveredRows = new Array(N).fill(false);
        const coveredCols = new Array(N).fill(false);

        // 3a. Asignación inicial de ceros (greedy)
        assignments = new Array(N).fill(-1);
        let assignedCols = new Array(N).fill(false);
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                if (costMatrix[i][j] === 0 && !assignedCols[j]) {
                    marks[i][j] = 2; // Asignado (*)
                    assignments[i] = j;
                    assignedCols[j] = true;
                    break;
                }
            }
        }

        // 3b. Proceso de Cobertura de Ceros (Algoritmo de Konig)
        let rowMarked = new Array(N).fill(false);

        // Marcar filas sin asignación
        for (let i = 0; i < N; i++) {
            if (assignments[i] === -1) {
                rowMarked[i] = true;
            }
        }

        let hasNewMarks = true;
        while (hasNewMarks) {
            hasNewMarks = false;

            // Marcar columnas con ceros en filas marcadas
            let newColsToMark = [];
            for (let i = 0; i < N; i++) {
                if (rowMarked[i]) {
                    for (let j = 0; j < N; j++) {
                        if (costMatrix[i][j] === 0 && !coveredCols[j]) {
                            newColsToMark.push(j);
                        }
                    }
                }
            }

            // Aplicar marcas de columna y buscar asignaciones
            for (let j of newColsToMark) {
                if (!coveredCols[j]) {
                    coveredCols[j] = true;
                    hasNewMarks = true;
                    // Marcar filas con asignación (*) en columnas recién marcadas
                    for (let i = 0; i < N; i++) {
                        if (assignments[i] === j && !rowMarked[i]) {
                            rowMarked[i] = true;
                        }
                    }
                }
            }
        }

        // 3c. Trazar líneas
        // Cubrir columnas marcadas (coveredCols) y filas NO marcadas (rowMarked)
        for (let i = 0; i < N; i++) {
            if (!rowMarked[i]) coveredRows[i] = true;
        }

        numLines = coveredRows.filter(b => b).length + coveredCols.filter(b => b).length;

        // Si el número de líneas es igual al tamaño N, ¡la solución es óptima!
        if (numLines === N) {
            break;
        }

        // -------------------------------------------------------------------
        // PASO 4: Ajuste de la Matriz (si numLines < N)
        // -------------------------------------------------------------------

        // 4a. Encontrar el mínimo valor NO cubierto
        let minUncovered = Infinity;
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                if (!coveredRows[i] && !coveredCols[j]) {
                    minUncovered = Math.min(minUncovered, costMatrix[i][j]);
                }
            }
        }

        // 4b. Aplicar ajuste
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                if (!coveredRows[i] && !coveredCols[j]) {
                    // Restar de elementos NO cubiertos
                    costMatrix[i][j] -= minUncovered;
                } else if (coveredRows[i] && coveredCols[j]) {
                    // Sumar en las intersecciones (doble cobertura)
                    costMatrix[i][j] += minUncovered;
                }
            }
        }

        // Repetir el bucle (volver al Paso 3)
    }

    // -------------------------------------------------------------------
    // PASO 5: Asignación Final y Cálculo del Costo Total
    // -------------------------------------------------------------------
    let totalCost = 0;

    // El último estado de 'assignments' antes del break puede ser no óptimo.
    // Recalculamos la asignación final de los ceros en la matriz óptima reducida.
    assignments = new Array(N).fill(-1);
    const assignedColsFinal = new Array(N).fill(false);

    // Buscar la asignación final (priorizando filas/columnas con un solo cero)
    let rowsToAssign = new Array(N).fill(true);
    let passes = 0;

    // Máximo N pases para cubrir todos los casos (aunque con 1 o 2 suele bastar)
    while (rowsToAssign.some(r => r) && passes < N * 2) {
        passes++;
        let newAssignmentsFound = false;

        // 1. Asignar filas/columnas con un ÚNICO cero no asignado
        for (let i = 0; i < N; i++) {
            if (rowsToAssign[i]) {
                let zeroCount = 0;
                let zeroCol = -1;
                for (let j = 0; j < N; j++) {
                    if (costMatrix[i][j] === 0 && !assignedColsFinal[j]) {
                        zeroCount++;
                        zeroCol = j;
                    }
                }

                if (zeroCount === 1) {
                    assignments[i] = zeroCol;
                    assignedColsFinal[zeroCol] = true;
                    rowsToAssign[i] = false;
                    newAssignmentsFound = true;
                }
            }
        }

        // 2. Asignar el primer cero disponible para filas restantes
        if (!newAssignmentsFound) {
            for (let i = 0; i < N; i++) {
                if (rowsToAssign[i]) {
                    for (let j = 0; j < N; j++) {
                        if (costMatrix[i][j] === 0 && !assignedColsFinal[j]) {
                            assignments[i] = j;
                            assignedColsFinal[j] = true;
                            rowsToAssign[i] = false;
                            newAssignmentsFound = true;
                            break;
                        }
                    }
                }
            }
        }

        // Si no se encontró nada en un pase, detenemos la iteración.
        if (!newAssignmentsFound && rowsToAssign.some(r => r)) {
            // Este caso indica múltiples ceros en filas y columnas sin solución trivial, 
            // pero la lógica debe haber cubierto el problema. Detenemos para evitar bucle infinito.
            break;
        }
    }

    // Sumar el costo original de las asignaciones encontradas
    for (let i = 0; i < N; i++) {
        const j = assignments[i];
        if (j !== -1) {
            totalCost += originalMatrix[i][j];
        } else {
            // Esto no debería suceder si el algoritmo funcionó correctamente (N asignaciones)
            console.error(`Error: La fila ${i} no fue asignada.`);
        }
    }

    return { totalCost, assignments };
}