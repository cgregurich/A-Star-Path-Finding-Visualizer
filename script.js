


import * as Grid from "./grid.js"

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

Grid.createGrid(ROW_COUNT, COL_COUNT, CELL_SIZE_PX);

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