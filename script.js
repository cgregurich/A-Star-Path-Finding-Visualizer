function setStepSpeedFromLocalStorage(){
    stepSpeed = localStorage.getItem("stepSpeed");
    if (!stepSpeed) stepSpeed = 50;
    slider.value = stepSpeed;
    speedLabel.textContent = `${stepSpeed}ms`;
}

function sliderMoved(e){
    stepSpeed = slider.value;
    speedLabel.textContent = `${stepSpeed}ms`;
    localStorage.setItem("stepSpeed", stepSpeed);
}


function createGrid(rowCount, colCount, cellSize){
    // Essentially put a matrix of divs as gridDiv's children
    // Makes a square
    for (let r=0; r<rowCount; r++){
        let rowDiv = createRowDiv();
        let cellsRow = [];
        for (let c=0; c<colCount; c++){
            let cell = createCell(cellSize);
            rowDiv.appendChild(cell);
            cell.dataset.row = r;
            cell.dataset.col = c;
            cellsRow.push(cell);
        }
        cellsMatrix.push(cellsRow);
        gridDiv.appendChild(rowDiv);
    }
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
    cell.style.border = CELL_BORDER;
    cell.classList.add("cell");
    cell.dataset.gScore = Infinity;
    createCellScoreChildren(cell);
    return cell;
}

function createCellScoreChildren(cell){
    const gScore = document.createElement("div");
    const hScore = document.createElement("div");
    const fScore = document.createElement("div");
    gScore.classList.add("score", "g-score");
    hScore.classList.add("score", "h-score");
    fScore.classList.add("score", "f-score");
    cell.appendChild(gScore);
    cell.appendChild(hScore);
    cell.appendChild(fScore);
}

function colorCell(cell){
    if (cell == startCell || cell == endCell) return;
    if (!startCell) setAsStart(cell);
    else if (!endCell) setAsEnd(cell);
    else setAsObstacle(cell);
}

function animateFillIn(cell, color){
    cell.style.animation = `fill-in-animation ${ANIMATION_TIME} ${ANIMATION_TIMING_FUNCTION}`;
    cell.style.backgroundImage = `linear-gradient(${color}, ${color})`;

    cell.addEventListener("animationend", () => {
        cell.style.animation = "none";
        cell.style.backgroundColor = color;
        cell.style.backgroundImage = "none";
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


    // once animation is over, change a few properties
    cell.addEventListener("animationend", () => {
        // remove the animation so it can be added later
        cell.style.animation = "none";

        // set bg so it appears unfilled
        cell.style.backgroundColor = DEFAULT_COLOR;

        // remove bg image so other colors can be visible
        cell.style.backgroundImage = "none";

        // re-apply mouse events since the animation is done
        cell.addEventListener("mousemove", mouseOverCell);
        cell.addEventListener("mousedown", mouseDownOnCell);

    }, {once: true});
}


function setAsStart(cell){
    animateFillIn(cell, START_COLOR);
    startCell = cell;
    startCell.dataset.gScore = 0;
    startCell.dataset.hScore = 0;
    startCell.dataset.fScore = 0;
}

function setAsEnd(cell){
    animateFillIn(cell, END_COLOR);
    endCell = cell;
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
    if (cell == startCell || cell == endCell) {
        leftClickDragEnabled = false;
    }
    if (cell == startCell) startCell = null;
    if (cell == endCell) endCell = null;
    if (obstacles.includes(cell)) deleteObstacle(cell);
    cell.cameFrom = undefined;
}

function deleteObstacle(cell){
    obstacles.splice(obstacles.indexOf(cell), 1);
}


function applyMouseOverListeners(){
    for (let row of cellsMatrix){
        for (let cell of row){
            cell.addEventListener("mousemove", mouseOverCell);
        }
    }
}

function applyMouseDownListeners(){
    for (let row of cellsMatrix){
        for (let cell of row){
            cell.addEventListener("mousedown", mouseDownOnCell);
        }
    }
}

function applyKeypressListener(){
    document.addEventListener("keypress", keyPressed);
}

function keyPressed(e){
    e.preventDefault();
    if (isPathDrawing) return;
    if (e.code == "Space"){
        // TODO: pause the algorithm?? yeesh
        if (isAlgorithmRunning) return;
        
        if (!startCell || !endCell){
            indicateCantStart();
            // alert("uh uh bud");
            return;
        }
        if (hasRan){
            softReset();
        }
        aStarStart();
    }

    // Allows more interesting clear functionality:
    // if algorithm has been run, hitting C to clear will clear
    // the path and the algorithm residue.
    // hitting C again will clear everything after that.
    if (e.code == "KeyC"){

        // cancel algorithm when it's in progress
        if (isAlgorithmRunning){
            isAlgorithmRunning = false;
            setTimeout(softReset, stepSpeed); 
            return;
        }
        // Used to do a softreset when there was no path found
        if (hasRan) softReset();
        else if (obstacles.length > 0) clearObstacles();
        else resetGrid();
    }
}


function disableRightClickMenu(){
    document.addEventListener("contextmenu", e => e.preventDefault());
}

function mouseDownOnCell(e){
    if (isAlgorithmRunning || isPathDrawing) return;
    if (hasPath() || hasRan) {
        softReset();
    }
    if (e.buttons == LEFT_CLICK){
        cellLeftClick(e.target);
    }
    else if (e.buttons == RIGHT_CLICK){
        cellRightClick(e.target);
    }
}

function mouseOverCell(e){
    if (isAlgorithmRunning || isPathDrawing) return;
    if (e.buttons == NO_BUTTONS) return;
    if (hasRan || hasPath()) softReset();
    if (e.buttons == LEFT_CLICK) {
        if (!leftClickDragEnabled) {
            return;
        }
        cellLeftClick(e.target);
    }
    else if (e.buttons == RIGHT_CLICK){
        cellRightClick(e.target);
    }
}

function cellLeftClick(cell){
    if (Array.from(cell.classList).includes("score")) cell = cell.parentElement;

    // user is placing start or end on an obstacle, so delete obstacle from array
    if (obstacles.includes(cell) && (!startCell || !endCell)){
        deleteObstacle(cell);
    }
    colorCell(cell);

    // one time mouseup listener so the drag effect isn't enabled too early
    // if it was, then you could make obstacles right after placing the end node
    // without letting go of left click; this is not desired behavior!
    if (startCell && endCell && !leftClickDragEnabled) {
        document.addEventListener("mouseup", () => leftClickDragEnabled = true, {once: true});
    }
}

function cellRightClick(cell){
    if (Array.from(cell.classList).includes("score")) cell = cell.parentElement;
    if (cell != startCell && cell != endCell && !obstacles.includes(cell)) return;
    resetCell(cell);
}

function shakeAnimation(element){
    element.classList.remove("shake");
    element.classList.add("shake");
    element.addEventListener("animationend", () => {
        element.classList.remove("shake");
    }, {once: true});
}

function indicateCantStart(){
    shakeAnimation(gridDiv);
}

function getAdjacentCells(rootCell){
    // return array of the 8 cells surrounding rootCell
    const rootRow = getCellRow(rootCell);
    const rootCol = getCellCol(rootCell);
    const adjacentCells = [];

    for (let r=rootRow-1; r<rootRow+2; r++){
        for (let c=rootCol-1; c<rootCol+2; c++){
            const cell = cellsMatrix[r]?.[c];
            // don't include rootCell or startCell or if cell is invalid i.e. 
            // we're at grid bounds, don't include it
            if (cell == rootCell || cell == startCell || !cell) continue;
            adjacentCells.push(cell);
        }
    }
    return adjacentCells;
}

function getCellRow(cell){
    return parseInt(cell.dataset.row);
}

function getCellCol(cell){
    return parseInt(cell.dataset.col);
}

function getCellGScore(cell){
    return parseInt(cell.dataset.gScore);
}

function getCellHScore(cell){
    return parseInt(cell.dataset.hScore);
}

function getCellFScore(cell){
    return parseInt(cell.dataset.fScore);
}

function calculateStepCost(rootCell, adjacentCell){
    const rootRow = getCellRow(rootCell);
    const rootCol = getCellCol(rootCell);

    if (isDiagonal(rootCell, adjacentCell)) return 14;
    else return 10;
}

function calculateGScore(rootCell, adjacentCell){
    const stepCost = calculateStepCost(rootCell, adjacentCell);
    const gScore = stepCost + getCellGScore(rootCell);
    return gScore;
}

function calculateHScore(cell){
    return manhattanDistanceToEndCell(cell) * 10;
}

function calculateFScore(cell){
    return getCellGScore(cell) + getCellHScore(cell);
}

function updateCellDisplay(cell){
    const gScoreDiv = cell.querySelector(".g-score");
    const hScoreDiv = cell.querySelector(".h-score");
    const fScoreDiv = cell.querySelector(".f-score");
    gScoreDiv.innerText = cell.dataset.gScore;
    hScoreDiv.innerText = cell.dataset.hScore;
    fScoreDiv.innerText = cell.dataset.fScore;
}

function manhattanDistanceToEndCell(cell){
    return Math.abs(getCellRow(cell) - getCellRow(endCell)) + Math.abs(getCellCol(cell) - getCellCol(endCell));
}

function createPriorityQueue(){
    return new PriorityQueue({ comparator: function(cell1, cell2) 
        { return getCellFScore(cell1) - getCellFScore(cell2) } 
    });
}

function isDiagonal(rootCell, adjCell){
    const rootRow = getCellRow(rootCell);
    const rootCol = getCellCol(rootCell);
    const adjRow = getCellRow(adjCell);
    const adjCol = getCellCol(adjCell);

    // since rootCell and adjCell are assumed to be adjacent, simply check if
    // they don't share a row AND don't share a column
    return rootRow != adjRow && rootCol != adjCol;
}

function isGoingThroughWall(rootCell, adjCell){
    const rootRow = getCellRow(rootCell);
    const rootCol = getCellCol(rootCell);
    const adjRow = getCellRow(adjCell);
    const adjCol = getCellCol(adjCell);

    let o1 = cellsMatrix[rootRow][adjCol];
    let o2 = cellsMatrix[adjRow][rootCol];
    return (obstacles.includes(o1) && obstacles.includes(o2));
}

function aStarRecursive(openQ, openSet, closedSet){
    const currentCell = openQ.dequeue();
    
    openSet.delete(currentCell);
    closedSet.add(currentCell);

    if (currentCell != startCell && currentCell != endCell){
        // mark it as closed
        animateFillIn(currentCell, CLOSED_COLOR);
    }
     
    const adjacents = getAdjacentCells(currentCell);

    for (let adjacent of adjacents){
        if (closedSet.has(adjacent)) continue;
        if (obstacles.includes(adjacent)) continue;
        if (isGoingThroughWall(currentCell, adjacent)) continue;
        
        const gScore = calculateGScore(currentCell, adjacent);
        if (gScore < getCellGScore(adjacent) || !openSet.has(adjacent)) {
            adjacent.dataset.gScore = gScore;
            adjacent.dataset.hScore = calculateHScore(adjacent);
            adjacent.dataset.fScore = getCellGScore(adjacent) + getCellHScore(adjacent);
            adjacent.cameFrom = currentCell;
            if (!openSet.has(adjacent)){
                openSet.add(adjacent);
                openQ.queue(adjacent);
                if (adjacent != startCell && adjacent != endCell){
                    // mark it as open
                    animateFillIn(adjacent, OPEN_COLOR);
                }
            }
        }
    }

    if (currentCell == endCell) {
        setTimeout(reconstructPath, TIME_BEFORE_RECONSTRUCT_PATH);
        isAlgorithmRunning = false;
        return;
    }

    // check if algorithm has been cancelled by user
    if (!isAlgorithmRunning) return;

    // keep recursively running the algorithm if there are more open cells
    if (openQ.length > 0){
        setTimeout(() => aStarRecursive(openQ, openSet, closedSet), stepSpeed);
        return;
    }

    // openQ is empty which means no path possible
    else {
        setTimeout(() => alert("No Path Found"), TIME_BEFORE_NO_PATH_FOUND_ALERT);
        isAlgorithmRunning = false;
    }
}

function aStarStart(){

    // Setup the datastructures needed for the algorithm
    const openQ = createPriorityQueue();
    const openSet = new Set();
    const closedSet = new Set();
    openQ.queue(startCell);

    hasRan = true;
    isAlgorithmRunning = true;
    aStarRecursive(openQ, openSet, closedSet);
}

function softReset(){
    hasRan = false;
    if (endCell) endCell.cameFrom = undefined;
    clearAlgorithmResidue();
    pathCells = [];
}

function clearObstacles(){
    for (let obstacle of obstacles){
        animateUnfill(obstacle);
    }
    obstacles = [];
}

function clearAlgorithmResidue(){
    for (let row of cellsMatrix){
        for (let cell of row){
            if (cell != startCell && cell != endCell && !obstacles.includes(cell)){
                resetCell(cell);
            }
        }
    }
}

function resetGrid(){
    hasRan = false;
    for (let row of cellsMatrix){
        for (let cell of row){
            resetCell(cell);
        }
    }
    leftClickDragEnabled = false;
}

function reconstructPath(){
    isPathDrawing = true;
    let currentCell = endCell;
    while (currentCell != undefined){
        pathCells.push(currentCell);
        currentCell = currentCell.cameFrom;
    }
    pathCells.reverse();
    
    let i = 0;
    const interval = setInterval(() => {
        const cell = pathCells[i++];
        if (cell != startCell && cell != endCell){
            animateFillIn(cell, PATH_COLOR);
        }
        
        if (i >= pathCells.length) {
            clearInterval(interval);
            isPathDrawing = false;
        }
    }, PATH_DRAW_SPEED);
}

function calculateRowCount(){
    return Math.floor(window.innerHeight / (CELL_SIZE_PX + CELL_BORDER_PX*2)) - 1;    
}

function calculateColCount(){
    return Math.floor(window.innerWidth / (CELL_SIZE_PX + CELL_BORDER_PX*2)) - 1;
}

function hasPath(){
    return pathCells.length > 0;
}

const ANIMATION_TIME = "0.3s";
const ANIMATION_TIMING_FUNCTION = "ease-in";

const NO_BUTTONS = 0;
const LEFT_CLICK = 1;
const RIGHT_CLICK = 2;
const BODY_COLOR = "lightgrey";
const START_COLOR = "#00DF1D";
const END_COLOR = "#df000d";
const DEFAULT_COLOR = "#c5c6c8";
const OBSTACLE_COLOR = "#3a284d";
const CLOSED_COLOR = "#46a29f";
const OPEN_COLOR = "#9478ba";
const PATH_COLOR = "#66fcf1";
const PATH_DRAW_SPEED = 50;
const TIME_BEFORE_RECONSTRUCT_PATH = 200;
const TIME_BEFORE_NO_PATH_FOUND_ALERT = 1000;
const CELL_BORDER_PX = 1;
const CELL_BORDER_COLOR = "black";
const CELL_BORDER = `${CELL_BORDER_PX}px solid ${CELL_BORDER_COLOR}`;
const CELL_SIZE_PX = 20;
const ROW_COUNT = calculateRowCount() - 2;
const COL_COUNT = calculateColCount() - 2;

// keys are html elements representing cells, values is 
// array of row and column in grid
let cellsMatrix = []; 
let startCell = null;
let endCell = null;
let obstacles = [];
let leftClickDragEnabled = false;
let isAlgorithmRunning = false;
let isPathDrawing = false;
let hasRan = false;
let pathCells = [];
document.querySelector("body").style.backgroundColor = BODY_COLOR;
const gridDiv = document.querySelector(".grid-div");
createGrid(ROW_COUNT, COL_COUNT, CELL_SIZE_PX);

const slider = document.querySelector(".slider");
const speedLabel = document.querySelector(".speed-label");
slider.addEventListener("input", sliderMoved);
let stepSpeed = slider.value;
setStepSpeedFromLocalStorage();



applyMouseDownListeners();
disableRightClickMenu();
applyMouseOverListeners();
applyKeypressListener();

import { startTutorial } from "./tutorial.js";
if (!localStorage.getItem("visited")){
    startTutorial();
    localStorage.setItem("visited", true);
}