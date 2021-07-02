import * as Grid from "./grid.js";
import * as Input from "./input.js";
import * as Tutorial from "./tutorial.js";
import * as Settings from "./settings.js";

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


document.querySelector("body").style.backgroundColor = Settings.BODY_COLOR;

Grid.createGrid();

const slider = document.querySelector(".slider");
const speedLabel = document.querySelector(".speed-label");
slider.addEventListener("input", sliderMoved);
let stepSpeed = slider.value;
setStepSpeedFromLocalStorage();



Input.applyMouseDownListeners();
Input.disableRightClickMenu();
Input.applyMouseOverListeners();
Input.applyKeypressListener();

if (!localStorage.getItem("visited")){
    Tutorial.startTutorial();
    localStorage.setItem("visited", true);
}