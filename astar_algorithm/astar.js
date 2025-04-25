const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");

let gridSize = 7;
let cellSize = canvas.width / gridSize;

let grid = [];
let startSet = false;
let endSet = false;
let start = null;
let end = null;
let openSet = [];
let closedSet = [];
let cameFrom = {};
let currentNode = null;
let pathFound = false;
let searchInterval = null;

function initGrid(){
    grid = [];
    for (let y = 0; y < gridSize; y++){
        let row = [];
        for (let x = 0; x < gridSize; x++){
            row.push(1);
        }
        grid.push(row);
    }
}

function drawGrid(){
    for (let y = 0; y < gridSize; y++){
        for (let x = 0; x < gridSize; x++){
            switch(grid[y][x]){
                case 0: ctx.fillStyle = "black"; break; // стена
                case 1: ctx.fillStyle = "#0b332e"; break; // проход
                case 2: ctx.fillStyle = "greenyellow"; break; // старт
                case 3: ctx.fillStyle = "red"; break; // финиш
                case 4: ctx.fillStyle = "cyan"; break; // путь найден
                case 5: ctx.fillStyle = "lightblue"; break; // рассматривается
                case 6: ctx.fillStyle = "#ccc"; break; // просмотрено
            }
            
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            
            ctx.strokeStyle = "#999";
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}

initGrid();
drawGrid();


document.getElementById("applySizeButton").addEventListener("click", function(event){
    let newSize = parseInt(document.getElementById("gridSizeInput").value);
    if (isNaN(newSize) || newSize < 5 || newSize > 50){
        alert("Введите размер от 5 до 50");
        return;
    }

    gridSize = newSize;
    cellSize = canvas.width / gridSize;

    startSet = false;
    endSet = false;
    start = null;
    end = null;

    initGrid();
    drawGrid();
});

canvas.addEventListener("click", function(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX-rect.left;
    const mouseY = event.clientY-rect.top;

    const x = Math.floor(mouseX/ cellSize);
    const y = Math.floor(mouseY/ cellSize);

    const cell = grid[y][x];

    if (cell === 2) {
        grid[y][x] = 1;
        start = null;
        startSet = false;
    } else if (cell === 3) {
        grid[y][x] = 1;
        end = null;
        endSet = false;
    }

    // установка начальной точки
    else if (!startSet){
        start = {x, y};
        startSet = true;
        grid[y][x] = 2;
    } // установка конечной точки
    else if (!endSet && (x !== start.x || y !== start.y)){
        end = {x, y};
        endSet = true;
        grid[y][x] = 3;
    }

    // переключение стен/проходов
    else if (grid[y][x] === 0) {
        grid[y][x] = 1;
    } else if (grid[y][x] === 1) {
        grid[y][x] = 0;
    }

    drawGrid();

});

document.getElementById("clearFieldButton").addEventListener("click", function(event){
    initGrid();
    start = null;
    end = null;
    startSet = false;
    endSet = false;
    drawGrid();
});

document.getElementById("findPathButton").addEventListener("click", function(event){
    if (start && end){
        startAstarSearch();
    }
});

document.getElementById("generateMazeButton").addEventListener("click", function(event){
    generateMaze();
});

// реализация алгоритма A*
function createNode(x, y, g = 0, h = 0, parent = null){
    return {
        x,
        y,
        g,              // расстояние от старта
        h,             // эвристика до цели
        f: g + h,     // общее значение 
        parent       // для восстановления пути
    };
}

function heuristic(a, b){
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getNeighbors(node){
    const dirs = [
        {dx: -1, dy: 0}, 
        {dx: 1, dy: 0},
        {dx: 0, dy: -1},
        {dx: 0, dy: 1},
    ];

    const neighbors = [];

    for (dir of dirs){
        
        // считаем ноые координаты соседа, к которому можно перейти из текущей node, сдвигаясь в направлении dir
        const newX = node.x + dir.dx;
        const newY = node.y + dir.dy;

        // проверяем, не выходит ли новая клетка за границы поля
        if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize){
            neighbors.push({x: newX, y: newY});
        }
    }

    return neighbors;
}


function startAstarSearch(){
    openSet = [];
    closedSet = [];
    cameFrom = {};
    pathFound = false;

    if (!start || !end){
        alert("Сначала выберите начальную и конечную точку!");
        return;
    }

    const startNode = createNode(start.x, start.y, 0, heuristic(start, end));
    openSet.push(startNode);
    currentNode = null;

    searchInterval = setInterval(aStarStep, 50);

}

function aStarStep(){
    if (openSet.length === 0){
        clearInterval(searchInterval);
        alert("Путь не найден");
        return;
    }

    // выбираем узел с миним f
    let currentIndex = 0;
    for (let i = 1; i < openSet.length; i++){
        if (openSet[i].f < openSet[currentIndex].f){
            currentIndex = i;
        }
    }
    
    currentNode = openSet[currentIndex];

    // если достигли конца - путь найден
    if (currentNode.x === end.x && currentNode.y === end.y){
        clearInterval(searchInterval);
        pathFound = true;
        drawFinalPath(currentNode);
        return;
    }

    openSet.splice(currentIndex, 1);
    closedSet.push(currentNode);

    if (grid[currentNode.y][currentNode.x] !== 2 && grid[currentNode.y][currentNode.x] !== 3) {
        grid[currentNode.y][currentNode.x] = 6; // просмотрено
    }

    const neighbors = getNeighbors(currentNode);
    for (neighbor of neighbors){
        const key = `${neighbor.x},${neighbor.y}`;

        // стены или уже просмотренные - пропускаем
        if (grid[neighbor.y][neighbor.x] === 0 || closedSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
            continue;
        }

        const prob_g = currentNode.g + 1; // вычисление нью стоимости пути до соседа

        // проверяем, есть ли уже этот сосед в openSet
        let neighborNode = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);
        
        // если нет, добавляем новый узел
        if (!neighborNode){
            neighborNode = createNode(neighbor.x, neighbor.y, prob_g, heuristic(neighbor, end), currentNode);
            openSet.push(neighborNode);
            cameFrom[key] = currentNode;
            if (grid[neighbor.y][neighbor.x] !== 2 && grid[neighbor.y][neighbor.x] !== 3) { // lightblue — рассматривается
                grid[neighbor.y][neighbor.x] = 5;
            } 
        
        // если узел уже есть, но наш путь к нему короче обновляем
        } else if (prob_g < neighborNode.g){
            neighborNode.g = prob_g;
            neighborNode.f = neighborNode.g + neighborNode.h;
            neighborNode.parent = currentNode;
            cameFrom[key] = currentNode;
        }
    }

    drawGrid();
}

function drawFinalPath(currentNode){
    let current = currentNode;

    // Пока у узла есть родитель, идём назад по пути
    while (current.parent) {
        if (grid[current.y][current.x] !== 2 && grid[current.y][current.x] !== 3) {
            grid[current.y][current.x] = 4; 
        }
        current = current.parent;
    }

    drawGrid(); 
}


function generateMaze(){
    for (let y = 0; y < gridSize; y++){
        for (let x = 0; x < gridSize; x++){
            grid[y][x] = 0;
        }
    }

    drawGrid();
    
    // случайная стартовая точка
    let startX = Math.floor(Math.random() * gridSize);
    let startY = Math.floor(Math.random() * gridSize);

    grid[startY][startX] = 1; // делем её проходом

    let walls = []; // масив соседних стен

    const dirs = [
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 }
    ];

    for (let dir of dirs){
        let nx = startX + dir.dx;
        let ny = startY + dir.dy;
        if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize){
            walls.push({x: nx, y: ny, fromX: startX, fromY: startY});

        } 
    }


    while(walls.length > 0){
        let randIndex = Math.floor(Math.random() * walls.length);
        let wall = walls[randIndex];
        let oppositeX = wall.x + (wall.x - wall.fromX);
        let oppositeY = wall.y + (wall.y - wall.fromY);

        if (oppositeX >= 0 && oppositeX < gridSize && oppositeY >= 0 && oppositeY < gridSize){ // проверяем, что не вышли за границы поля
            // проверяем, можно ли расширить лабиринт через эту стену
            if (grid[oppositeY][oppositeX] === 0){
                if (grid[wall.y][wall.x] === 0){
                    // делаем текущую стену и протиоположную клетку проходом
                    grid[wall.y][wall.x] = 1;
                    grid[oppositeY][oppositeX] = 1;

                    // добавляем новые соседние стены
                    for (let dir of dirs){
                        let nx = oppositeX + dir.dx;
                        let ny = oppositeY + dir.dy;
                        if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize){
                            if (grid[ny][nx] === 0){
                                walls.push({x: nx, y: ny, fromX: oppositeX, fromY: oppositeY});
                            }
                        }
                    }
                }
            }
        }

        walls.splice(randIndex, 1);
    }


    // убираем стены по краям 
    for (let i = 0; i < gridSize; i++) {
        grid[0][i] = 1; // верхняя граница
        grid[gridSize - 1][i] = 1; // нижняя граница
        grid[i][0] = 1; // левая граница
        grid[i][gridSize - 1] = 1; // правая граница
    }

    drawGrid();

}














 








