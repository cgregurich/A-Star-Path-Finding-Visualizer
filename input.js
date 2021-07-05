import * as Grid from "./grid.js";
import * as AStar from "./astar.js";
import * as Settings from "./settings.js";

export let leftClickDragEnabled = false;

export function setUp(){
    applyMouseDownListeners();
    disableRightClickMenu();
    applyMouseOverListeners();
    applyKeypressListener();
}

export function disableLeftClickDrag(){
    leftClickDragEnabled = false;
}

export function enableLeftClickDrag(){
    leftClickDragEnabled = true;
}

export function applyMouseOverListeners(){
    for (let row of Grid.cellsMatrix){
        for (let cell of row){
            cell.addEventListener("mousemove", mouseOverCell);
        }
    }
}

export function applyMouseDownListeners(){
    for (let row of Grid.cellsMatrix){
        for (let cell of row){
            cell.addEventListener("mousedown", mouseDownOnCell);
        }
    }
}

export function applyKeypressListener(){
    document.addEventListener("keypress", keyPressed);
}

export function keyPressed(e){
    e.preventDefault();
    if (AStar.isPathDrawing) return;
    if (e.code == "Space"){
        if (AStar.isAlgorithmRunning) return;
        
        if (!Grid.startCell || !Grid.endCell){
            Grid.indicateCantStart();
            return;
        }
        if (AStar.hasRan){
            Grid.softReset();
        }
        AStar.aStarStart();
    }

    // Allows more interesting clear export functionality:
    // if algorithm has been run, hitting C to clear will clear
    // the path and the algorithm residue.
    // hitting C again will clear everything after that.
    if (e.code == "KeyC"){

        // cancel algorithm when it's in progress
        if (AStar.isAlgorithmRunning){
            AStar.setIsAlgorithmRunning(false);
            setTimeout(Grid.softReset, localStorage.getItem("stepSpeed")); 
            return;
        }
        // Used to do a softreset when there was no path found
        if (AStar.hasRan) Grid.softReset();
        else if (Grid.obstacles.length > 0) Grid.clearObstacles();
        else Grid.resetGrid();
    }
}


export function disableRightClickMenu(){
    document.addEventListener("contextmenu", e => e.preventDefault());
}

export function mouseDownOnCell(e){
    if (AStar.isAlgorithmRunning || AStar.isPathDrawing) return;
    if (AStar.hasPath() || AStar.hasRan) {
        Grid.softReset();
    }
    if (e.buttons == Settings.LEFT_CLICK){
        cellLeftClick(e.target);
    }
    else if (e.buttons == Settings.RIGHT_CLICK){
        cellRightClick(e.target);
    }
}

export function mouseOverCell(e){
    if (AStar.isAlgorithmRunning || AStar.isPathDrawing) return;
    if (e.buttons == Settings.NO_BUTTONS) return;
    if (AStar.hasRan || AStar.hasPath()) Grid.softReset();
    if (e.buttons == Settings.LEFT_CLICK) {
        if (!leftClickDragEnabled) {
            return;
        }
        cellLeftClick(e.target);
    }
    else if (e.buttons == Settings.RIGHT_CLICK){
        cellRightClick(e.target);
    }
}

export function cellLeftClick(cell){

    if (Array.from(cell.classList).includes("score")) cell = cell.parentElement;

    // user is placing start or end on an obstacle, so delete obstacle from array
    if (Grid.obstacles.includes(cell) && (!Grid.startCell || !Grid.endCell)){
        

        deleteObstacle(cell);
    }
    Grid.colorCell(cell);

    // one time mouseup listener so the drag effect isn't enabled too early
    // if it was, then you could make obstacles right after placing the end node
    // without letting go of left click; this is not desired behavior!
    if (Grid.startCell && Grid.endCell && !leftClickDragEnabled) {
        document.addEventListener("mouseup", () => leftClickDragEnabled = true, {once: true});
    }
}

export function cellRightClick(cell){
    if (Array.from(cell.classList).includes("score")) cell = cell.parentElement;
    if (cell != Grid.startCell && cell != Grid.endCell && !Grid.obstacles.includes(cell)) return;
    Grid.resetCell(cell);
}