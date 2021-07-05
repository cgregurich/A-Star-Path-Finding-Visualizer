import * as Settings from "./settings.js";
import * as AStar from "./astar.js";
import * as Input from "./input.js";

export let cellsMatrix = [];
const gridDiv = document.querySelector(".grid-div");
export let startCell = null;
export let endCell = null;
export let obstacles = [];

export function createGrid(){    const cellSize = Settings.CELL_SIZE_PX;
    // Essentially put a matrix of divs as gridDiv's children
    // Makes a square
    const rowCount = calculateRowCount();
    const colCount = calculateColCount();
    for (let r=0; r<rowCount; r++){
        let rowDiv = createRowDiv();
        let cellsRow = [];
        for (let c=0; c<colCount; c++){
            let cell = createCell();
            rowDiv.appendChild(cell);
            cell.dataset.row = r;
            cell.dataset.col = c;
            cellsRow.push(cell);
        }
        cellsMatrix.push(cellsRow);
        gridDiv.appendChild(rowDiv);
    }
}

export function createRowDiv(){
    const rowDiv = document.createElement("div");
    rowDiv.style.display = "flex";
    return rowDiv;
}

export function createCell(){
    let cell = document.createElement("div");
    cell.style.backgroundColor = Settings.DEFAULT_COLOR;
    cell.style.width = `${Settings.CELL_SIZE_PX}px`;
    cell.style.height = `${Settings.CELL_SIZE_PX}px`;
    cell.style.border = Settings.CELL_BORDER;
    cell.classList.add("cell");
    cell.dataset.gScore = Infinity;
    createCellScoreChildren(cell);
    return cell;
}

export function createCellScoreChildren(cell){
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

export function colorCell(cell){
    if (cell == startCell || cell == endCell) return;
    if (!startCell) setAsStart(cell);
    else if (!endCell) setAsEnd(cell);
    else setAsObstacle(cell);
}

export function animateFillIn(cell, color){
    cell.style.animation = `fill-in-animation ${Settings.ANIMATION_TIME} ${Settings.ANIMATION_TIMING_FUNCTION}`;
    cell.style.backgroundImage = `linear-gradient(${color}, ${color})`;

    cell.addEventListener("animationend", () => {
        cell.style.animation = "none";
        cell.style.backgroundColor = color;
        cell.style.backgroundImage = "none";
    }, {once: true});
}


export function animateUnfill(cell){

    // remember the cells color to use for the unfill animation
    const currentCellColor = cell.style.backgroundColor;

    // since the cell's animation color will be its current color, need to change
    // cell's bg so the animation is visible (eg. green animation on a green bg would
    // have no visible effect)
    cell.style.backgroundColor = Settings.DEFAULT_COLOR;

    // add the animation to the style so it begins
    cell.style.animation = `unfill-animation ${Settings.ANIMATION_TIME} ${Settings.ANIMATION_TIMING_FUNCTION}`;

    // tell the CSS what color to use for the animation
    cell.style.backgroundImage = `linear-gradient(${currentCellColor}, ${currentCellColor})`;


    // once animation is over, change a few properties
    cell.addEventListener("animationend", () => {
        // remove the animation so it can be added later
        cell.style.animation = "none";

        // set bg so it appears unfilled
        cell.style.backgroundColor = Settings.DEFAULT_COLOR;

        // remove bg image so other colors can be visible
        cell.style.backgroundImage = "none";

        // re-apply mouse events since the animation is done
        cell.addEventListener("mousemove", Input.mouseOverCell);
        cell.addEventListener("mousedown", Input.mouseDownOnCell);

    }, {once: true});
}


export function setAsStart(cell){
    animateFillIn(cell, Settings.START_COLOR);
    startCell = cell;
    startCell.dataset.gScore = 0;
    startCell.dataset.hScore = 0;
    startCell.dataset.fScore = 0;
}

export function setAsEnd(cell){
    animateFillIn(cell, Settings.END_COLOR);
    endCell = cell;
}

export function setAsObstacle(cell){
    if (!obstacles.includes(cell)) {
        animateFillIn(cell, Settings.OBSTACLE_COLOR);
        obstacles.push(cell);
     }
}


export function resetCell(cell){
    animateUnfill(cell);
    // start or end have been removed, which means the mouse drag effect needs
    // to be disabled
    if (cell == startCell || cell == endCell) {
        Input.disableLeftClickDrag();
    }
    if (cell == startCell) startCell = null;
    if (cell == endCell) endCell = null;
    if (obstacles.includes(cell)) deleteObstacle(cell);
    cell.cameFrom = undefined;
    clearScoreText(cell);
}

function clearScoreText(cell){
    const scoreDivs = cell.querySelectorAll(".score");
    for (let div of scoreDivs){
        div.innerText = "";
    }
}

export function updateCellDisplay(cell){
    const gScoreDiv = cell.querySelector(".g-score");
    const hScoreDiv = cell.querySelector(".h-score");
    const fScoreDiv = cell.querySelector(".f-score");
    gScoreDiv.innerText = cell.dataset.gScore;
    hScoreDiv.innerText = cell.dataset.hScore;
    fScoreDiv.innerText = cell.dataset.fScore;
}

export function deleteObstacle(cell){
    obstacles.splice(obstacles.indexOf(cell), 1);
}



export function shakeAnimation(element){
    element.classList.remove("shake");
    element.classList.add("shake");
    element.addEventListener("animationend", () => {
        element.classList.remove("shake");
    }, {once: true});
}

export function indicateCantStart(){
    shakeAnimation(gridDiv);
}

export function getAdjacentCells(rootCell){
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

export function getCellRow(cell){
    return parseInt(cell.dataset.row);
}

export function getCellCol(cell){
    return parseInt(cell.dataset.col);
}


export function softReset(){
    AStar.setHasRan(false);
    if (endCell) endCell.cameFrom = undefined;
    clearAlgorithmResidue();
    AStar.emptyPathCells();
}

export function clearObstacles(){
    for (let obstacle of obstacles){
        animateUnfill(obstacle);
    }
    obstacles = [];
}

export function clearAlgorithmResidue(){
    for (let row of cellsMatrix){
        for (let cell of row){
            if (cell != startCell && cell != endCell && !obstacles.includes(cell)){
                resetCell(cell);
            }
        }
    }
}

export function resetGrid(){
    AStar.setHasRan(false);
    for (let row of cellsMatrix){
        for (let cell of row){
            resetCell(cell);
        }
    }
    Input.disableLeftClickDrag();
}

export function calculateRowCount(){
    return Math.floor(window.innerHeight / (Settings.CELL_SIZE_PX + Settings.CELL_BORDER_SIZE_PX*2)) - Math.floor(80 / Settings.CELL_SIZE_PX);
}

export function calculateColCount(){
    const margins = 0.25 * window.innerWidth; // % of window size as left and right margins
    console.log(margins);
    return Math.floor(window.innerWidth / (Settings.CELL_SIZE_PX + Settings.CELL_BORDER_SIZE_PX*2)) - Math.floor(margins / Settings.CELL_SIZE_PX);
}
