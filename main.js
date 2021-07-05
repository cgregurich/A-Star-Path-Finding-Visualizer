import * as Grid from "./grid.js";
import * as Input from "./input.js";
import * as Tutorial from "./tutorial.js";
import * as Settings from "./settings.js";
import * as Slider from "./slider.js";

document.querySelector("body").style.backgroundColor = Settings.BODY_COLOR;

Grid.createGrid();
Slider.setUp();
Input.setUp();


// Run tutorial if user is new to the page
if (!localStorage.getItem("visited")){
    Tutorial.startTutorial();
    localStorage.setItem("visited", true);
}

// window.addEventListener("resize", () => alert("Looks like you resized the page. Refresh the page for the grid to adjust to the new window size!"));