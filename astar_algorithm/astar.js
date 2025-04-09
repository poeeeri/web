const gridSize = 31;
const grid = document.getElementById("grid");

for(let x = 0; x < gridSize; x++){
    for(let y = 0; y < gridSize; y++){
        const cell = document.createElement("div");
        cell.classList.add("cell","wall");
        cell.dataset.x = x;
        cell.dataset.y = y;
        grid.appendChild(cell);
        cell.addEventListener("click", () => {
            if(cell.classList.contains("free")){
                cell.classList.remove("free");
                cell.classList.add("wall");
            }   else if(cell.classList.contains("wall")) {
                cell.classList.remove("wall");
                cell.classList.add("free");

            }
        });
        cell.addEventListener("click", () => {
            const start = document.querySelector(".start");
            const end = document.querySelector(".end");

            if(!start && cell.classList.contains("wall")) {
                cell.classList.remove("free");
                cell.classList.add("start");
                
            } else if(!end && start && cell.classList.contains("wall")) {
                cell.classList.remove("free");
                cell.classList.add("end");
            
            } else if(cell.classList.contains("start")){
                cell.classList.remove("start");
                cell.classList.add("free");
            } else if(cell.classList.contains("end")){
                cell.classList.remove("end");
                cell.classList.add("free");
            }

        });
    }
}


function getCell(x, y) {
    return document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
}

function addToFrontier(x, y) {
    const neighbour = getCell(x, y);
    if(neighbour && neighbour.classList.contains("wall")) {
        frontier.push(neighbour);
    }
}

const frontier = [];

// первый шаг алгоритма Прима для генерации лабиринта 
document.getElementById("generateButton").addEventListener("click", () => {
    const allCells = document.querySelectorAll(".cell");
    allCells.forEach(cell => {
        cell.classList.add("wall");
    });

    const index = Math.floor(Math.random() * allCells.length);
    const randomCell = allCells[index];
    randomCell.classList.remove("wall");
    randomCell.classList.add("free");
    const x = parseInt(randomCell.dataset.x);
    const y = parseInt(randomCell.dataset.y);
    addToFrontier(x, y - 2);
    addToFrontier(x, y + 2);
    addToFrontier(x - 2, y);
    addToFrontier(x + 2, y);

// второй шаг алгоритма Прима 
    while(frontier.length > 0) {
        const index = Math.floor(Math.random() * frontier.length);
        const current = frontier.splice(index, 1)[0];
        
        const x = parseInt(current.dataset.x);
        const y = parseInt(current.dataset.y);
    
        const directions = [
            [0, -2],
            [0, 2],
            [-2, 0],
            [2, 0]
        ];
    
        for(let [dx, dy] of directions) {
            let nx = x + dx;
            let ny = y + dy;
            const neighbour = getCell(nx, ny);
            if(neighbour && neighbour.classList.contains("free")){
                const wallX = (x + nx) / 2;
                const wallY = (y + ny) / 2;
                const wall = getCell(wallX, wallY);
    
                current.classList.remove("wall");
                current.classList.add("free");
    
                if(wall) {
                    wall.classList.remove("wall");
                    wall.classList.add("free");
                }
    
                for(let [dx, dy] of directions) {
                    addToFrontier(x + dx, y + dy);
                }
    
                break;
            }
        }
    }
});

function heuristic(neighbourX, endX, neighbourY, endY) {
    return Math.abs(neighbourX - endX) + Math.abs(neighbourY - endY);
}

// реализация алгоритма A*
function startAstar() {
const start = document.querySelector(".start");
const end = document.querySelector(".end");

const startX = parseInt(start.dataset.x); // считываем координаты start и end
const startY = parseInt(start.dataset.y);
const endX = parseInt(end.dataset.x);
const endY = parseInt(end.dataset.y);

let openSet = [];
let checkCell = [];
openSet.push({x: startX, y: startY});
let g = 0; //стоимомть пути от старта до этой клетки
let h = heuristic(startX, startY, endX, endY); // манхэттенское расстояние
let f = g + h; // общая стоимость

openSet.push({
    x: startX,
    y: startY,
    g: g,
    h: h,
    f: f,
    parent: null
});

while(openSet.length > 0){

}
}










 








