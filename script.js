

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

function mouseDownOnCell(e){
    if (hasPath()) softReset();
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
    if (cell != startCell && cell != endCell && !obstacles.includes(cell)) return;
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

    // TODO: for testing, remove this
    // cell.innerText = "";

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

function resetGrid(){
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

function applyKeypressListener(){
    document.addEventListener("keypress", keyPressed);
}

function keyPressed(e){
    if (e.code == "Space"){
        e.preventDefault();
        if (!startCell || !endCell){
            alert("uh uh bud");
            return;
        }
        
        e.preventDefault();
        aStarAlgorithm();
    }
    if (e.code == "KeyC"){
        resetGrid();
    }
}


function disableRightClickMenu(){
    document.addEventListener("contextmenu", e => e.preventDefault());
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



function aStarAlgorithm(){

    const openQ = createPriorityQueue();
    const openSet = new Set();
    const closedSet = new Set();
    openQ.queue(startCell);
    // updateCellDisplay(startCell);


    while (openQ.length != 0){
        const currentCell = openQ.dequeue();
        
        openSet.delete(currentCell);
        closedSet.add(currentCell);
        // mark it as closed
        if (currentCell != startCell && currentCell != endCell){
            currentCell.style.backgroundColor = CLOSED_COLOR;
        }
        
        if (currentCell == endCell) {
            break;
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
                        // mark it as open?
                        adjacent.style.backgroundColor = OPEN_COLOR;
                    }
                }
            }
            // TODO: actually visualize the algorithm instead of just the path
            // updateCellDisplay(adjacent);
        }
    }
  
    if (endCell.cameFrom == undefined){
        // TODO: do something a little cleaner!
        alert("No path was found.");
        return;
    }
    reconstructPath();

    // TODO: refactor
    // one time event listener on grid click, that clears the path and resets the
    // "came froms", but leaves the obstacles and start and end cells for more tinkering
    // gridDiv.addEventListener("mousedown", softReset, {once: true});
}

function softReset(){
    if (endCell) endCell.cameFrom = undefined;
    clearPath();

    // TODO: come up with a better solution here
    cellsMatrix.forEach(row => row.forEach(cell => {
        if (cell != startCell && cell != endCell && !obstacles.includes(cell)) resetCell(cell);
    }));
}

function clearPath(){
    pathCells.forEach(cell => {
        if (cell != startCell && cell != endCell) resetCell(cell);
    });

    pathCells = [];
}

function reconstructPath(){
    let currentCell = endCell;
    while (currentCell != undefined){
        pathCells.push(currentCell);
        currentCell = currentCell.cameFrom;
    }
    pathCells.reverse();
    const MS = 50;
    let i = 0;
    const interval = setInterval(() => {
        const cell = pathCells[i++];
        if (cell != startCell && cell != endCell){
            animateFillIn(cell, "cyan")
        }
        
        if (i >= pathCells.length) clearInterval(interval);
    }, MS);
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
const START_COLOR = "green";
const END_COLOR = "red";
const OBSTACLE_COLOR = "blue";
const DEFAULT_COLOR = "white";
const CLOSED_COLOR = "magenta";
const OPEN_COLOR = "orange";
const CELL_BORDER_PX = 1;
const CELL_BORDER_COLOR = "black";
const CELL_BORDER = `${CELL_BORDER_PX}px solid ${CELL_BORDER_COLOR}`;
const CELL_SIZE_PX = 25;
const ROW_COUNT = calculateRowCount();
const COL_COUNT = calculateColCount();

// keys are html elements representing cells, values is 
// array of row and column in grid
let cellsMatrix = []; 
let startCell = null;
let endCell = null;
let obstacles = [];
let leftClickDragEnabled = false;
let pathCells = [];
const gridDiv = document.querySelector(".grid-div");
createGrid(ROW_COUNT, COL_COUNT, CELL_SIZE_PX);

applyMouseDownListeners();
disableRightClickMenu();
applyMouseOverListeners();
applyKeypressListener();


// FOR TESTING
document.querySelector(".btn").addEventListener("click", function(){
    console.log(`pathCells.length: ${pathCells.length}`);
});