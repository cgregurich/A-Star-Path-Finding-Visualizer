## <ins>Basic functionality</ins>

1. Select start point
2. Select end point
3. Build walls/obstacles
4. Run

Shows the path finding algorithm at work.

## <ins>Basic design of the UI</ins>
- Grid of cells
- That's about it

## <ins>Basic user input</ins>
- First click places start
- Second click places end
- Any click/drag after that draws obstacles
- Right click to remove placed spots
- If start cell is right clicked, then it gets put on the top of the "stack" of things to be placed on left click. Same with end cell. However, if both the start and end cells are not placed, then start cell has first priority. How tf will that work??? Simple check, something like?
<pre>
on left click:
if start not placed:
    place start
else if end not placed:
    place end
else
    place obstacle
</pre>
* Space to run the algorithm

### **CURRENT TASK**

### **WHERE I LEFT OFF**
- disabling input as algorithm run sorta implemented. needs to be tested further. 
- i'd prefer to make the isAlgorithmRunning bit of aStarRecursive a little more DRY (repeating isAlgorithmRunning = false twice)


### **TODO**
- line for found path, instead of/as well as colored cells
- understand how the algorithm animation even works. set timeout, conditionals, aStarAlgorithm vs aStarStep, etc.!!
- implement a slider. find the upper and lower bound of time for the algorithm (depends on cell size tho) and make a (CLEAN) slider that uses these bounds as a function
- IDEA: change the event listeners to being on the grid, then deducing which cell
was clicked using idk pixels and shit, instead of n^2 application of event listeners.
see if this makes fat grids run better??
- animate/color the entire process, not just the path
- after algorithm runs, what should happen?
- figure out how to deal with unreachable end cell
- SHOULD I SWITCH OBSTACLES DS TO A SET???
- some sort of indication that the algorithm can't be run when start and end aren't placed
- Figure out how the algorithm even works
- make some clean basic tutorial ("click to place start". "click to place end" 
"now draw some walls" "space to run" "want to start over? hit c. or keep drawing" and so on)
- draw path as a line instead of as blocks such as: https://qiao.github.io/PathFinding.js/visual/



- Style the ui
- figure out how to animate the algorithm
- how to do like a time scale?
- change sizes of the grid?
- How to not make fat grids slow down the webpage??
- Maybe also do Dijkstra's?
- Maybe add a random maze generator?

### **BUGS**
- path has been found. clicking (left or right) outside of the grid and dragging in
bypasses the softReset functionality!!
- path has been found. grid is cleared with c. click (left or right) on a cell, gets an error.
- interuppting the algorithm by clicking (need to also check C, space, etc.)
- path has been found. right clicking the grid clears the path, but instantly, not as an animation
- deal with how things work when the algorithm is running (c should stop it, space pause? what about clicking??)
- when no path is found, clicking and stuff doesn't clear the colored cells
- disappointing mouse functionality after path is found. does drag work? right click? etc.
- hitting space after algorithm is finished is bad because it doesn't clear the algorithm residue, so fs up the whole enchilada. 

### **COMPLETED TODOS**
- Make the ui on a basic level
- Implement basic clicking functionality
- understand the algorithm
- implement the algorithm
- a lot of other stuff, let's be real
- spend 2.5 hours trying to get requirejs to work only to
put a second script in my html like a barbarian
- don't color the end and start cell when showing the path
- fix the wall phasing problem



### **BUGS FIXED**
- no-drag for start and end works for initial placement, but if they're removed
then replaced, the drag functionality breaks (or rather, exists)
- sequence of events: place start, place end, place some obstacles. remove start or end
and place it on an obstacle => DOESN'T have the animated fill effect
- when you unfill then immediately try to fill, the block ends up uncolored
- WTF IS THAT?? I CAN COLOR THE MFIN DIVS THAT DISPLAY THE SCORES????
- path has been found. Right clicking on a path cell skips the unfill animation, and
creates an infinite error loop (not yet investigated)


