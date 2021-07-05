function createProgressSteps(){
    const hintProgressStep = document.querySelector(".hint-progress-steps");
    progressSteps = [];
    for (let i=0; i<hints.length; i++){
        const step = createStep();
        progressSteps.push(step);
        hintProgressStep.appendChild(step);
    }
    progressSteps[0].classList.add("hint-step--completed");
}

function createStep(){
    const step = document.createElement("div");
    step.classList.add("hint-step");
    return step;
}

function startTutorial(){
    isTutorialRunning = true;
    hintIndex = 0;
    hintContainer.style.display = "block";
    hintContainer.classList.remove("hint-container--closed");
    updateButtonsStates();
    updateHintText();
}

function stopTutorial(){
    isTutorialRunning = false;
    hintContainer.classList.add("hint-container--closed");
    resetProgressSteps();
}

function resetProgressSteps(){
    for (let step of progressSteps){
        step.classList.remove("hint-step--completed");
    }
    progressSteps[0].classList.add("hint-step--completed");
}

function hintIconClicked(){
    isTutorialRunning ? stopTutorial() : startTutorial();
}

function prevClicked(){
    hintIndex = clamp(0, hints.length-1, hintIndex-1);
    updateHintText();
    updateButtonsStates();
    updateProgressSteps();
    hintPrev.blur();
}

function nextClicked(){
    hintIndex = clamp(0, hints.length-1, hintIndex+1);
    updateHintText();
    updateButtonsStates();
    updateProgressSteps();
    hintNext.blur();
}

function updateProgressSteps(){
    progressSteps[hintIndex + 1]?.classList.remove("hint-step--completed");
    progressSteps[hintIndex].classList.add("hint-step--completed");
}

function updateButtonsStates(){
    if (hintIndex == hints.length - 1) {
        hintNext.innerText = "Done!";
        hintNext.addEventListener("click", stopTutorial, {once: true});
    }
    else {
        hintNext.removeEventListener("click", stopTutorial);
        hintNext.innerText = "Next";
    }

    hintIndex == 0 ? hintPrev.disabled = true : hintPrev.disabled = false;
}



function clamp(min, max, value){
    if (value > max) return max;
    if (value < min) return min;
    return value;
}

function updateHintText(){
    hintText.textContent = hints[hintIndex];
}


const hints = [
    "Left click to place the start node",
    "Left click again to place the end node",
    "And now left click to draw obstacles",
    "Right click to remove things",
    "Space to run the algorithm",
    "After it's done, C clears the algorithm's residue",
    "(So does left and right click)",
    "Hitting C again clears the obstacles",
    "And C a third time clears the start and end nodes",
    "Use the slider to change the speed of the algorithm",
    "That's it!"
];

const hintContainer = document.querySelector(".hint-container");
const hintText = document.querySelector(".hint-text");
const hintPrev = document.querySelector(".hint-prev");
const hintNext = document.querySelector(".hint-next");
const hintIcon = document.querySelector(".hint-icon");
const hintExit = document.querySelector(".hint-exit");
let progressSteps = [];

let hintIndex = 0;
let isTutorialRunning = false;

createProgressSteps();

hintPrev.addEventListener("click", prevClicked);
hintNext.addEventListener("click", nextClicked);
hintIcon.addEventListener("click", hintIconClicked);
hintExit.addEventListener("click", stopTutorial);

export { startTutorial };