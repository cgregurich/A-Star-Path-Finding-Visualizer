import * as Grid from "./grid.js";
import * as Settings from "./settings.js";

export let isAlgorithmRunning = false; 
export let isPathDrawing = false;
export let hasRan = false;
export let pathCells = [];


export function getCellGScore(cell){
    return parseInt(cell.dataset.gScore);
}

export function getCellHScore(cell){
    return parseInt(cell.dataset.hScore);
}

export function getCellFScore(cell){
    return parseInt(cell.dataset.fScore);
}

export function calculateStepCost(rootCell, adjacentCell){
    const rootRow = Grid.getCellRow(rootCell);
    const rootCol = Grid.getCellCol(rootCell);

    if (isDiagonal(rootCell, adjacentCell)) return 14;
    else return 10;
}

export function calculateGScore(rootCell, adjacentCell){
    const stepCost = calculateStepCost(rootCell, adjacentCell);
    const gScore = stepCost + getCellGScore(rootCell);
    return gScore;
}

export function calculateHScore(cell){
    return manhattanDistanceToEndCell(cell) * 10;
}

export function calculateFScore(cell){
    return getCellGScore(cell) + getCellHScore(cell);
}


export function manhattanDistanceToEndCell(cell){
    return Math.abs(Grid.getCellRow(cell) - Grid.getCellRow(Grid.endCell)) + Math.abs(Grid.getCellCol(cell) - Grid.getCellCol(Grid.endCell));
}

export function createPriorityQueue(){
    return new PriorityQueue({ comparator: function(cell1, cell2) 
        { return getCellFScore(cell1) - getCellFScore(cell2) } 
    });
}

export function isDiagonal(rootCell, adjCell){
    const rootRow = Grid.getCellRow(rootCell);
    const rootCol = Grid.getCellCol(rootCell);
    const adjRow = Grid.getCellRow(adjCell);
    const adjCol = Grid.getCellCol(adjCell);

    // since rootCell and adjCell are assumed to be adjacent, simply check if
    // they don't share a row AND don't share a column
    return rootRow != adjRow && rootCol != adjCol;
}

export function isGoingThroughWall(rootCell, adjCell){
    const rootRow = Grid.getCellRow(rootCell);
    const rootCol = Grid.getCellCol(rootCell);
    const adjRow = Grid.getCellRow(adjCell);
    const adjCol = Grid.getCellCol(adjCell);

    let o1 = Grid.cellsMatrix[rootRow][adjCol];
    let o2 = Grid.cellsMatrix[adjRow][rootCol];
    return (Grid.obstacles.includes(o1) && Grid.obstacles.includes(o2));
}

export function aStarRecursive(openQ, openSet, closedSet){
    const currentCell = openQ.dequeue();
    
    openSet.delete(currentCell);
    closedSet.add(currentCell);

    if (currentCell != Grid.startCell && currentCell != Grid.endCell){
        // mark it as closed
        Grid.animateFillIn(currentCell, Settings.CLOSED_COLOR);
    }
     
    const adjacents = Grid.getAdjacentCells(currentCell);

    for (let adjacent of adjacents){
        if (closedSet.has(adjacent)) continue;
        if (Grid.obstacles.includes(adjacent)) continue;
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
                if (adjacent != Grid.startCell && adjacent != Grid.endCell){
                    // mark it as open
                    Grid.animateFillIn(adjacent, Settings.OPEN_COLOR);
                }
            }
        }
        // Grid.updateCellDisplay(adjacent);
    }

    if (currentCell == Grid.endCell) {
        setTimeout(reconstructPath, Settings.TIME_BEFORE_RECONSTRUCT_PATH);
        isAlgorithmRunning = false;
        return;
    }

    // check if algorithm has been cancelled by user
    if (!isAlgorithmRunning) return;

    // keep recursively running the algorithm if there are more open cells
    if (openQ.length > 0){
        setTimeout(() => aStarRecursive(openQ, openSet, closedSet), localStorage.getItem("stepSpeed"));
        return;
    }

    // openQ is empty which means no path possible
    else {
        setTimeout(() => alert("No Path Found"), Settings.TIME_BEFORE_NO_PATH_FOUND_ALERT);
        isAlgorithmRunning = false;
    }
}

export function aStarStart(){

    // Setup the datastructures needed for the algorithm
    const openQ = createPriorityQueue();
    const openSet = new Set();
    const closedSet = new Set();
    openQ.queue(Grid.startCell);

    hasRan = true;
    isAlgorithmRunning = true;
    aStarRecursive(openQ, openSet, closedSet);
}

export function reconstructPath(){
    isPathDrawing = true;
    let currentCell = Grid.endCell;
    while (currentCell != undefined){
        pathCells.push(currentCell);
        currentCell = currentCell.cameFrom;
    }
    pathCells.reverse();
    
    let i = 0;
    const interval = setInterval(() => {
        const cell = pathCells[i++];
        if (cell != Grid.startCell && cell != Grid.endCell){
            Grid.animateFillIn(cell, Settings.PATH_COLOR);
        }
        
        if (i >= pathCells.length) {
            clearInterval(interval);
            isPathDrawing = false;
        }
    }, Settings.PATH_DRAW_SPEED);
}

export function hasPath(){
    return pathCells.length > 0;
}

export function setHasRan(value){
    hasRan = value;
}

export function setIsAlgorithmRunning(value){
    isAlgorithmRunning = value;
}

export function emptyPathCells(){
    pathCells = [];
}

