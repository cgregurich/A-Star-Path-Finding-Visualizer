class Cell{
    constructor(row, column){
        this.domElement = this.createDomElement(CELL_SIZE_PX);
        this.row = row;
        this.column = column;
    }

    createDomElement(cellSize){
        let cell = document.createElement("div");
        cell.style.backgroundColor = DEFAULT_COLOR;
        cell.style.width = `${cellSize}px`;
        cell.style.height = `${cellSize}px`;
        cell.style.border = "1px solid black";
        return cell;
    }

    getDomElement(){
        return this.domElement;
    }

    getX(){
        return this.x;
    }

    getY(){
        return this.y;
    }



}



function createGrid(numCells, cellSize){
    // Essentially put a matrix of divs as gridDiv's children
    // Makes a square
    for (let r=0; r<numCells; r++){
        let rowDiv = createRowDiv();
        for (let c=0; c<numCells; c++){
            let cell = new Cell(r, c);
            rowDiv.appendChild(cell.getDomElement());
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
    // user is placing start or end on an obstacle, so delete obstacle from array
    if (obstacles.includes(cell) && (!startNode || !endNode)){
        deleteObstacle(cell);
    }
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

function animateFillIn(cell, color){
    cell.style.animation = `fill-in-animation ${ANIMATION_TIME} ${ANIMATION_TIMING_FUNCTION}`;
    cell.style.backgroundImage = `linear-gradient(${color}, ${color})`;

    cell.addEventListener("animationend", () => {
        cell.style.animation = "none";
        cell.style.backgroundColor = color;
    }, {once: true});
}


function animateUnfill(cell){

    // remember the cells color to use for the unfill animation
    const currentCellColor = cell.style.backgroundColor;

    // since the cell's animation color will be its current color, need to change
    // cell's bg so the animation is visible (eg. green animation on a green bg would
    // have no visible effect)
    cell.style.backgroundColor = DEFAULT_COLOR;

    // add the animation to the style so it begins
    cell.style.animation = `unfill-animation ${ANIMATION_TIME} ${ANIMATION_TIMING_FUNCTION}`;

    // tell the CSS what color to use for the animation
    cell.style.backgroundImage = `linear-gradient(${currentCellColor}, ${currentCellColor})`;

    // temporarily remove the mouse events to avoid interrupting the animation
    cell.removeEventListener("mousemove", mouseOverCell);
    cell.removeEventListener("mousedown", mouseDownOnCell);

    // once animation is over, change a few properties
    cell.addEventListener("animationend", () => {
        // remove the animation so it can be added later
        cell.style.animation = "none";

        // set bg so it appears unfilled
        cell.style.backgroundColor = DEFAULT_COLOR;

        // set bg to defaultcolor 
        cell.style.backgroundImage = `linear-gradient(${DEFAULT_COLOR}, ${DEFAULT_COLOR})`;

        // re-apply mouse events since the animation is done
        cell.addEventListener("mousemove", mouseOverCell);
        cell.addEventListener("mousedown", mouseDownOnCell);

    }, {once: true}); // 
}


function setAsStart(cell){
    animateFillIn(cell, START_COLOR);
    startNode = cell;
}

function setAsEnd(cell){
    animateFillIn(cell, END_COLOR);
    endNode = cell;
}

function setAsObstacle(cell){
    if (!obstacles.includes(cell)) {
        animateFillIn(cell, OBSTACLE_COLOR);
        obstacles.push(cell);
     }
}


function resetCell(cell){
    animateUnfill(cell);
    // start or end have been removed, which means the mouse drag effect needs
    // to be disabled
    if (cell == startNode || cell == endNode) {
        leftClickDragEnabled = false;
    }
    if (cell == startNode) startNode = null;
    if (cell == endNode) endNode = null;
    if (obstacles.includes(cell)) deleteObstacle(cell);
}

function deleteObstacle(cell){
    obstacles.splice(obstacles.indexOf(cell), 1);
}



const ANIMATION_TIME = ".3s";
const ANIMATION_TIMING_FUNCTION = "ease-in";

const LEFT_CLICK = 1;
const RIGHT_CLICK = 2;
const START_COLOR = "green";
const END_COLOR = "red";
const OBSTACLE_COLOR = "blue";
const DEFAULT_COLOR = "white";
const CELLS = 25;
const CELL_SIZE_PX = 25;

let startNode = null;
let endNode = null
let obstacles = [];
let leftClickDragEnabled = false;

const gridDiv = document.querySelector(".grid-div");
createGrid(CELLS, CELL_SIZE_PX);


applyMouseDownListeners();
disableRightClickMenu();
applyMouseOverListeners();


// TESTING STUFF TODO: remove this
const btn = document.querySelector(".btn");
btn.addEventListener("click", () => {
    console.log(`startNode`);
    console.log(startNode);
});
