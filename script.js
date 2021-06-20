function createGrid(numCells, cellSize){
    // Essentially put a matrix of divs as gridDiv's children
    // Makes a square
    for (let r=0; r<numCells; r++){
        let rowDiv = createRowDiv();
        for (let c=0; c<numCells; c++){
            let cell = createCell(cellSize);
            rowDiv.appendChild(cell);
        }
        gridDiv.appendChild(rowDiv);
    }
    gridDiv;
}

function createRowDiv(){
    const rowDiv = document.createElement("div");
    rowDiv.style.display = "flex";
    return rowDiv;
}

function createCell(cellSize){
    let cell = document.createElement("div");
    cell.style.backgroundColor = DEFAULT_COLOR;
    cell.style.width = `${cellSize}px`;
    cell.style.height = `${cellSize}px`;
    cell.style.border = "1px solid black";
    cell.classList.add("cell", "uncolored");
    return cell;
}


function cellLeftClick(cell){
    colorCell(cell);

    // one time mouseup listener so the drag effect isn't enabled too early
    // if it was, then you could make obstacles right after placing the end node
    // without letting go of left click; this is not desired behavior!
    if (startNode && endNode && !leftClickDragEnabled) {
        document.addEventListener("mouseup", () => leftClickDragEnabled = true, {once: true});
    }
}

function colorCell(cell){
    if (cell == startNode || cell == endNode) return;
    if (!startNode) setAsStart(cell);
    else if (!endNode) setAsEnd(cell);
    else setAsObstacle(cell);
    applyColoredClass(cell);
}

function applyColoredClass(cell){
    cell.classList.add("colored");
    cell.classList.remove("uncolored");
}

function applyUncoloredClass(cell){
    cell.classList.add("uncolored");
    cell.classList.remove("colored");
}

function cellRightClick(cell){
    resetCell(cell);
}

function mouseDownOnCell(e){
    if (e.buttons == LEFT_CLICK){
        cellLeftClick(e.target);
    }
    else if (e.buttons == RIGHT_CLICK){
        cellRightClick(e.target);
    }
}

function mouseOverCell(e){
    if (e.buttons == LEFT_CLICK) {
        if (!leftClickDragEnabled) return;
        colorCell(e.target);
    }
    else if (e.buttons == RIGHT_CLICK){
        resetCell(e.target);
    }
}

function applyMouseOverListeners(){
    gridDiv.childNodes.forEach(row => row.childNodes.forEach(cell => cell.addEventListener("mousemove", mouseOverCell)));
}

function applyMouseDownListeners(){
    gridDiv.childNodes.forEach(row => row.childNodes.forEach(cell => cell.addEventListener("mousedown", mouseDownOnCell)));
}

function disableRightClickMenu(){
    gridDiv.childNodes.forEach(row => row.childNodes.forEach(cell => {
        cell.addEventListener("contextmenu", e => e.preventDefault());
    }));
}

function setAsStart(cell){
    cell.style.backgroundImage = `linear-gradient(${START_COLOR}, ${START_COLOR})`;
    startNode = cell;
}

function setAsEnd(cell){
    endNode = cell;
    cell.style.backgroundImage = `linear-gradient(${END_COLOR}, ${END_COLOR})`;
}

function setAsObstacle(cell){
    if (!obstacles.includes(cell)) {
        obstacles.push(cell);
        cell.style.backgroundImage = `linear-gradient(${OBSTACLE_COLOR}, ${OBSTACLE_COLOR})`;
     }
}


function resetCell(cell){
    applyUncoloredClass(cell);
    // start or end have been removed, which means the mouse drag effect needs
    // to be disabled
    if (cell == startNode || cell == endNode) {
        leftClickDragEnabled = false;
    }
    if (cell == startNode) startNode = null;
    if (cell == endNode) endNode = null;
    if (obstacles.includes(cell)) obstacles.splice(obstacles.indexOf(cell), 1);
}




const LEFT_CLICK = 1;
const RIGHT_CLICK = 2;
const START_COLOR = "green";
const END_COLOR = "red";
const OBSTACLE_COLOR = "blue";
const DEFAULT_COLOR = "white";


let startNode = null;
let endNode = null
let obstacles = [];
let leftClickDragEnabled = false;

const gridDiv = document.querySelector(".grid-div");
createGrid(25, 25);


applyMouseDownListeners();
disableRightClickMenu();
applyMouseOverListeners();




// WHERE I LEFT OFF: 

// trying to get this dope color fill effect to work. It sort of works BUT
// - bug where when you color an obstacle, then remove it, that cell is no longer
// able to be colored
// - try to make it work for start, end, and obstacle node. I'm not sure how to 
// make the css and js work together.
// - also mess with different things like speed, border radius, and timing function.