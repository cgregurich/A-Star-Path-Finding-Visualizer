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

export function setUp(){
    slider.addEventListener("input", sliderMoved);
    setStepSpeedFromLocalStorage();

}
const slider = document.querySelector(".slider");
const speedLabel = document.querySelector(".speed-label");

export let stepSpeed = slider.value;