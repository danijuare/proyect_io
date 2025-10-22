document.addEventListener('DOMContentLoaded', () => {
    generarMatriz();
});

function limpiarDatos() {
    window.location.reload();
}

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
    
    const costMatrixDiv = document.createElement('div');
    costMatrixDiv.className = 'cost-matrix';

    container.style.gridTemplateColumns = '';
    container.style.gridTemplateRows = '';

    for (let i = 0; i < N; i++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';

        for (let j = 0; j < N; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            
            const input = document.createElement('input');
            input.type = 'number';
            input.id = `cost-${i}-${j}`;
            input.value = Math.floor(Math.random() * 20) + 1;
            input.min = "0";
            
            cell.appendChild(input);
            rowDiv.appendChild(cell);
        }
        
        costMatrixDiv.appendChild(rowDiv);
    }

    container.appendChild(costMatrixDiv);

    document.getElementById('solve-button').disabled = false;
    document.getElementById('cost-result').textContent = '...';
    document.getElementById('assignment-table').innerHTML = '';
}

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

    try {
        const { totalCost, assignments } = hungarianAlgorithm(originalMatrix);

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


function mostrarResultados(originalMatrix, assignments, totalCost) {
    const table = document.getElementById('assignment-table');
    table.innerHTML = '';
    const N = originalMatrix.length;

    const headerRow = table.insertRow();
    const cornerCell = headerRow.insertCell();
    cornerCell.textContent = 'Tarea ↓ / Recurso →';
    cornerCell.classList.add('header-corner');

    for (let j = 0; j < N; j++) {
        const headerCell = headerRow.insertCell();
        headerCell.textContent = `Recurso ${j + 1}`;
        headerCell.classList.add('header-col');
    }

    for (let i = 0; i < N; i++) {
        const row = table.insertRow();

        const rowHeaderCell = row.insertCell();
        rowHeaderCell.textContent = `Tarea ${i + 1}`;
        rowHeaderCell.classList.add('header-row');

        for (let j = 0; j < N; j++) {
            const cell = row.insertCell();
            cell.textContent = originalMatrix[i][j];

            if (assignments[i] === j) {
                cell.classList.add('assigned');
            }
        }
    }

    document.getElementById('cost-result').textContent = totalCost;
}



function hungarianAlgorithm(originalMatrix) {
    const N = originalMatrix.length;
    let costMatrix = originalMatrix.map(row => [...row]);

    for (let i = 0; i < N; i++) {
        const minVal = Math.min(...costMatrix[i]);
        for (let j = 0; j < N; j++) {
            costMatrix[i][j] -= minVal;
        }
    }

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

    while (numLines < N) {
        const marks = Array(N).fill(0).map(() => Array(N).fill(0));
        const coveredRows = new Array(N).fill(false);
        const coveredCols = new Array(N).fill(false);

        assignments = new Array(N).fill(-1);
        let assignedCols = new Array(N).fill(false);
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                if (costMatrix[i][j] === 0 && !assignedCols[j]) {
                    marks[i][j] = 2;
                    assignments[i] = j;
                    assignedCols[j] = true;
                    break;
                }
            }
        }

        let rowMarked = new Array(N).fill(false);

        for (let i = 0; i < N; i++) {
            if (assignments[i] === -1) {
                rowMarked[i] = true;
            }
        }

        let hasNewMarks = true;
        while (hasNewMarks) {
            hasNewMarks = false;

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

            for (let j of newColsToMark) {
                if (!coveredCols[j]) {
                    coveredCols[j] = true;
                    hasNewMarks = true;
                    for (let i = 0; i < N; i++) {
                        if (assignments[i] === j && !rowMarked[i]) {
                            rowMarked[i] = true;
                        }
                    }
                }
            }
        }

        for (let i = 0; i < N; i++) {
            if (!rowMarked[i]) coveredRows[i] = true;
        }

        numLines = coveredRows.filter(b => b).length + coveredCols.filter(b => b).length;

        if (numLines === N) {
            break;
        }

        let minUncovered = Infinity;
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                if (!coveredRows[i] && !coveredCols[j]) {
                    minUncovered = Math.min(minUncovered, costMatrix[i][j]);
                }
            }
        }

        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                if (!coveredRows[i] && !coveredCols[j]) {
                    costMatrix[i][j] -= minUncovered;
                } else if (coveredRows[i] && coveredCols[j]) {
                    costMatrix[i][j] += minUncovered;
                }
            }
        }

    }

    let totalCost = 0;

    assignments = new Array(N).fill(-1);
    const assignedColsFinal = new Array(N).fill(false);

    let rowsToAssign = new Array(N).fill(true);
    let passes = 0;

    while (rowsToAssign.some(r => r) && passes < N * 2) {
        passes++;
        let newAssignmentsFound = false;

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

        if (!newAssignmentsFound && rowsToAssign.some(r => r)) {
            break;
        }
    }

    for (let i = 0; i < N; i++) {
        const j = assignments[i];
        if (j !== -1) {
            totalCost += originalMatrix[i][j];
        } else {
            console.error(`Error: La fila ${i} no fue asignada.`);
        }
    }

    return { totalCost, assignments };
}