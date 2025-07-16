const rows = 20;
const cols = 20;
let startNode = null;
let endNode = null;
let isMouseDown = false;
let drawingMode = null; // 'wall', 'erase'

const gridContainer = document.getElementById("grid-container");

function createGrid() {
    gridContainer.innerHTML = "";

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = row;
            cell.dataset.col = col;

            // Mouse Down: Start drawing
            cell.addEventListener("mousedown", (e) => {
                isMouseDown = true;
                handleCellAction(cell);
            });

            // Mouse Enter: Continue drawing if mouse is held
            cell.addEventListener("mouseenter", () => {
                if (isMouseDown) {
                    handleCellAction(cell);
                }
            });

            // Mouse Up: Stop drawing
            cell.addEventListener("mouseup", () => {
                isMouseDown = false;
            });

            gridContainer.appendChild(cell);
        }
    }

    // End drawing if mouse is released outside grid
    document.body.addEventListener("mouseup", () => {
        isMouseDown = false;
    });
}


function handleCellAction(cell) {
    if (cell === startNode || cell === endNode) return;

    if (!startNode) {
        startNode = cell;
        cell.classList.add("start");
    } else if (!endNode) {
        endNode = cell;
        cell.classList.add("end");
    } else {
        if (drawingMode === 'erase') {
            cell.classList.remove("wall");
        } else {
            cell.classList.add("wall");
        }
    }
}


//get neighbours
function getNeighbors(cell) {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const neighbors = [];

    const directions = [
        [0, 1],  [1, 0], 
        [0, -1], [-1, 0]
    ];

    for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;

        if (
            newRow >= 0 && newRow < rows &&
            newCol >= 0 && newCol < cols
        ) {
            const neighbor = document.querySelector(
                `[data-row="${newRow}"][data-col="${newCol}"]`
            );
            if (!neighbor.classList.contains("wall")) {
                neighbors.push(neighbor);
            }
        }
    }

    return neighbors;
}

//Dijkstra’s Algorithm Core Function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function startDijkstra() {
    if (!startNode || !endNode) {
        alert("Please set both start and end nodes.");
        return;
    }

    const distances = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const prev = Array.from({ length: rows }, () => Array(cols).fill(null));

    const startRow = parseInt(startNode.dataset.row);
    const startCol = parseInt(startNode.dataset.col);
    distances[startRow][startCol] = 0;

    const queue = [{ cell: startNode, dist: 0 }];

    while (queue.length > 0) {
        // Pick the node with the smallest distance
        queue.sort((a, b) => a.dist - b.dist);
        const { cell } = queue.shift();

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        if (visited[row][col]) continue;
        visited[row][col] = true;

        if (cell !== startNode && cell !== endNode) {
            cell.classList.add("visited");
            await sleep(20); // animation delay
        }

        if (cell === endNode) {
            reconstructPath(prev, endNode);
            return;
        }

        const neighbors = getNeighbors(cell);
        for (const neighbor of neighbors) {
            const nRow = parseInt(neighbor.dataset.row);
            const nCol = parseInt(neighbor.dataset.col);

            const alt = distances[row][col] + 1;
            if (alt < distances[nRow][nCol]) {
                distances[nRow][nCol] = alt;
                prev[nRow][nCol] = cell;
                queue.push({ cell: neighbor, dist: alt });
            }
        }
    }

    alert("No path found.");
}

//Reconstruct & Animate the Path
async function reconstructPath(prev, endNode) {
    let cell = endNode;

    while (cell) {
        if (cell !== startNode && cell !== endNode) {
            cell.classList.add("path");
            await sleep(30);
        }
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        cell = prev[row][col];
    }
}

//Reset Function
function resetGrid() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => {
        cell.classList.remove("start", "end", "wall", "visited", "path");
    });
    startNode = null;
    endNode = null;
}

function setDrawingMode(mode) {
    drawingMode = mode;
}

function clearPathOnly() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => {
        cell.classList.remove("visited", "path");
    });
}

createGrid();
