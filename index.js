function CalculateMatrix() {
    const matrix = GetMatrixFromInput();
    const rows = parseInt(document.getElementById('rows').value);
    const columns = parseInt(document.getElementById('columns').value);

    // Split the matrix into coefficient (A) and constants (B)
    const A = matrix.map(row => row.slice(0, columns - 1).map(Number)); // Coefficients
    const B = matrix.map(row => Number(row[columns - 1])); // Constants

    try {
        const steps = []; // To store steps for visualization
        const solution = gaussianEliminationVisualized(A, B, steps); // Call Gaussian elimination with steps
        displaySteps(steps);
        displayResult(solution);
        ValidateMatrix(matrix, rows, columns)
    } catch (err) {
        alert('Error: Unable to calculate the matrix. Check your inputs.');
    }
}

function gaussianEliminationVisualized(A, B, steps) {
    const M = A.length;

    // Add the initial matrix to steps
    steps.push({ A: JSON.parse(JSON.stringify(A)), B: [...B], action: 'Initial Matrix' });

    for (let k = 0; k < M; k++) {
        // Partial pivoting
        let maxRow = k;
        for (let i = k + 1; i < M; i++) {
            if (Math.abs(A[i][k]) > Math.abs(A[maxRow][k])) {
                maxRow = i;
            }
        }
        // Swap rows in A and B
        [A[k], A[maxRow]] = [A[maxRow], A[k]];
        [B[k], B[maxRow]] = [B[maxRow], B[k]];
        steps.push({ A: JSON.parse(JSON.stringify(A)), B: [...B], action: `Swapped Row ${k + 1} with Row ${maxRow + 1}` });

        // Make all rows below this one 0 in the current column
        for (let i = k + 1; i < M; i++) {
            const factor = A[i][k] / A[k][k];
            for (let j = k; j < M; j++) {
                A[i][j] -= factor * A[k][j];
            }
            B[i] -= factor * B[k];
            steps.push({ A: JSON.parse(JSON.stringify(A)), B: [...B], action: `Eliminated Row ${i + 1}, Column ${k + 1}` });
        }
    }

    // Back substitution
    const X = new Array(M);
    for (let i = M - 1; i >= 0; i--) {
        X[i] = B[i] / A[i][i];
        for (let j = i - 1; j >= 0; j--) {
            B[j] -= A[j][i] * X[i];
        }
    }
    steps.push({ A: JSON.parse(JSON.stringify(A)), B: [...B], action: 'Back Substitution' });

    return X;
}

function displaySteps(steps) {
    const stepsContainer = document.createElement('div');
    stepsContainer.id = 'steps-container';
    stepsContainer.innerHTML = '<h3>Solution Steps:</h3>';

    steps.forEach((step, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step';
        stepDiv.style.marginBottom = '20px';

        stepDiv.innerHTML = `<h4>Step ${index + 1}: ${step.action}</h4>`;
        stepDiv.innerHTML += matrixToHtml(step.A, step.B);

        stepsContainer.appendChild(stepDiv);
    });

    const matrixContainer = document.getElementById('matrix-container');
    matrixContainer.innerHTML = ''; // Clear previous output
    matrixContainer.appendChild(stepsContainer);
}

function matrixToHtml(A, B) {
    let html = '<table style="border-collapse: collapse; width: auto; text-align: center; margin-top: 10px;">';
    A.forEach((row, i) => {
        html += '<tr>';
        row.forEach(value => {
            html += `<td style="border: 1px solid black; padding: 5px;">${value.toFixed(4)}</td>`;
        });
        html += `<td style="border: 1px solid black; padding: 5px;">| ${B[i].toFixed(4)}</td>`;
        html += '</tr>';
    });
    html += '</table>';
    return html;
}

function displayResult(solution) {
    const resultDiv = document.createElement('div');
    resultDiv.innerHTML = '<h3>Final Solution:</h3>';
    resultDiv.style.marginTop = '20px';
    resultDiv.style.padding = '10px';
    resultDiv.style.border = '1px solid black';

    solution.forEach((value, index) => {
        const variable = columnToLetter(index);
        resultDiv.innerHTML += `<p>${variable} = ${value.toFixed(4)}</p>`;
    });

    document.getElementById('matrix-container').appendChild(resultDiv);
}

function ValidateMatrix(matrix, rows, columns) {
    // Check if matrix is empty
    if (!matrix || matrix.length === 0) {
        throw new Error('Matrix is empty');
    }

    // Check if rows and columns match matrix dimensions
    if (matrix.length !== rows || matrix.some(row => row.length !== columns)) {
        throw new Error('Matrix dimensions do not match specified rows and columns');
    }

    // Check for non-numeric entries
    const isNumeric = (value) => !isNaN(parseFloat(value)) && isFinite(Number(value));
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            if (!isNumeric(matrix[i][j])) {
                throw new Error(`Non-numeric value found at position (${i+1}, ${j+1})`);
            }
        }
    }

    // Check for zero determinant (singular matrix)
    const coefficientMatrix = matrix.map(row => row.slice(0, columns - 1).map(Number));
    const determinant = calculateDeterminant(coefficientMatrix);

    if (Math.abs(determinant) < 1e-10) {
        throw new Error('Matrix is singular. No unique solution exists.');
    }

    return true;
}

function calculateDeterminant(matrix) {
    // Base case for 1x1 and 2x2 matrices
    if (matrix.length === 1) return matrix[0][0];
    if (matrix.length === 2) {
        return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    }

    // Laplace expansion for larger matrices
    let det = 0;
    for (let j = 0; j < matrix.length; j++) {
        // Create submatrix by removing first row and current column
        const subMatrix = matrix.slice(1).map(row =>
            row.filter((_, colIndex) => colIndex !== j)
        );

        // Calculate determinant recursively with alternating sign
        det += Math.pow(-1, j) * matrix[0][j] * calculateDeterminant(subMatrix);
    }

    return det;
}


function columnToLetter(index) {
    return String.fromCharCode(104 + index); // Convert 0 -> h, 1 -> b, 2 -> c
}
