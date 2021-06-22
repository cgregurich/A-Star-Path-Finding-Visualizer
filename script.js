function createGrid(numCells, cellSize){
    // Essentially put a matrix of divs as gridDiv's children
    // Makes a square
    for (let r=0; r<numCells; r++){
        let rowDiv = createRowDiv();
        let cellsRow = [];
        for (let c=0; c<numCells; c++){
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
    cell.style.border = "1px solid black";
    cell.classList.add("cell");
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

function mouseDownOnCell(e){
    if (e.buttons == LEFT_CLICK){
        cellLeftClick(e.target);
    }
    else if (e.buttons == RIGHT_CLICK){
        cellRightClick(e.target);
    }
}

function mouseOverCell(e){
    if (e.buttons == NO_BUTTONS) return;
    if (e.buttons == LEFT_CLICK) {
        if (!leftClickDragEnabled) return;
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
    // if (cell != startCell && cell != endCell && !obstacles.includes(cell)) return;
    resetCell(cell);
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

    // temporarily remove the mouse events to avoid interrupting the animation
    cell.removeEventListener("mousemove", mouseOverCell);
    cell.removeEventListener("mousedown", mouseDownOnCell);

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
}

function resetGrid(){
    startCell = null;
    endCell = null;
    obstacles = [];
    gridDiv.childNodes.forEach(row => row.childNodes.forEach(cell => resetCell(cell)));
    leftClickDragEnabled = false;
}

function deleteObstacle(cell){
    obstacles.splice(obstacles.indexOf(cell), 1);
}


function applyMouseOverListeners(){
    gridDiv.childNodes.forEach(row => row.childNodes.forEach(cell => cell.addEventListener("mousemove", mouseOverCell)));
}

function applyMouseDownListeners(){
    gridDiv.childNodes.forEach(row => row.childNodes.forEach(cell => cell.addEventListener("mousedown", mouseDownOnCell)));
}

function applySpaceListener(){
    document.addEventListener("keypress", resetGrid);
}

function disableRightClickMenu(){
    gridDiv.childNodes.forEach(row => row.childNodes.forEach(cell => {
        cell.addEventListener("contextmenu", e => e.preventDefault());
    }));
}

// #TODO: kinda sorta for testing?
function firstStep(){
    const adjacents = getAdjacentCells(startCell);
    adjacents.forEach(cell => {
        cell.style.backgroundColor = ADJACENT_COLOR;
        setGScoreData(cell, calculateGScore(startCell, cell));
        setHScoreData(cell, calculateHScore(cell));
        setFScoreData(cell, calculateFScore(cell));
        updateCellDisplay(cell);
    });
}

function getAdjacentCells(rootCell){
    // return array of the 8 cells surrounding rootCell
    const rootRow = parseInt(rootCell.dataset.row);
    const rootCol = parseInt(rootCell.dataset.col);
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

function calculateGScore(rootCell, adjacentCell){
    const rootRow = rootCell.dataset.row;
    const rootCol = rootCell.dataset.col;

    // cell in the same row or col means it's orthogonally located
    if (adjacentCell.dataset.row == rootRow || adjacentCell.dataset.col == rootCol){
        // score of 10 denotes cell is orthogonal i.e. up/down/left/right
        return 10;
    }
    else{
        // score of 14 denotes cell is diagonal due to Pythagorean theorem
        return 14;
    }
}

function calculateHScore(cell){
    return manhattanDistanceToEndCell(cell) * 10;
}

function calculateFScore(cell){
    return parseInt(cell.dataset.gScore) + parseInt(cell.dataset.hScore);
}

function setCellData(cell, dataName, dataValue){
    cell.setAttribute(dataName, dataValue);
}

function setGScoreData(cell, gScore){
    cell.dataset.gScore = gScore;
}

function setHScoreData(cell, hScore){
    cell.dataset.hScore = hScore;
}

function setFScoreData(cell, fScore){
    cell.dataset.fScore = fScore;
}

function setCellScoresData(cell, g, h, f){
    cell.dataset.gScore = g;
    cell.dataset.hScore = h;
    cell.dataset.fScore = f;
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
    return Math.abs(cell.dataset.row - endCell.dataset.row) + Math.abs(cell.dataset.col - endCell.dataset.col);
}

const ANIMATION_TIME = ".3s";
const ANIMATION_TIMING_FUNCTION = "ease-in";

const NO_BUTTONS = 0;
const LEFT_CLICK = 1;
const RIGHT_CLICK = 2;
const START_COLOR = "green";
const END_COLOR = "red";
const OBSTACLE_COLOR = "blue";
const DEFAULT_COLOR = "white";
const ADJACENT_COLOR = "rgb(238, 126, 238)";
const CELLS = 6;
const CELL_SIZE_PX = 75;

// keys are html elements representing cells, values is 
// array of row and column in grid
let cellsMatrix = []; 
let startCell = null;
let endCell = null
let obstacles = [];
let leftClickDragEnabled = false;

const gridDiv = document.querySelector(".grid-div");
createGrid(CELLS, CELL_SIZE_PX);


applyMouseDownListeners();
disableRightClickMenu();
applyMouseOverListeners();
applySpaceListener();

// TESTING STUFF TODO: remove this
const btn = document.querySelector(".btn");
btn.addEventListener("click", () => {
    firstStep();
});
