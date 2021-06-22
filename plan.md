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
NEED TO MATH CHECK THE CALCULATIONS FOR `firstStep()`
just implemented the firstStep thing.
I'd prefer to get a slightly cleaner, more DRY implementation.

kinda sorta understand the algorithm, was messing with 
just making the page do the first step of the process i.e. indicate which cells are the start node's neighbors. need to deal with grid bounds and obstacles. also trying to just see how the cellsMatrix works. I should be able to do what I was trying to do in `getCellsToCheck` (where i was changing the color by using the row and col for the matrix) but it wasn't working.


- also take a look at wtf you're doing with your function calls. in one area on 
a right click you call `cellRightClicked` which literally just called `resetCell`. Is
this `cellRightClicked` function really necessary?

### **TODO**
- CLEAN TODOS!
- clearing grid needs to also remove score text from cells
- some sort of indication that the algorithm can't be run when start and end aren't placed
- Figure out how the algorithm even works
  - What the different states of cells? 
  - What heuristic to use? Euclidean or Manhattan?


- Style the ui
- figure out how to animate the algorithm
- how to do like a time scale?
- change sizes of the grid?
- How to not make fat grids slow down the webpage??
- Maybe also do Dijkstra's?
- Maybe add a random maze generator?

### **BUGS**
- WTF IS THAT?? I CAN COLOR THE MFIN DIVS THAT DISPLAY THE SCORES????

### **COMPLETED TODOS**
- Make the ui on a basic level
- Implement basic clicking functionality


### **BUGS FIXED**
- no-drag for start and end works for initial placement, but if they're removed
then replaced, the drag functionality breaks (or rather, exists)
- sequence of events: place start, place end, place some obstacles. remove start or end
and place it on an obstacle => DOESN'T have the animated fill effect
- when you unfill then immediately try to fill, the block ends up uncolored


