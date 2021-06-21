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

TODO: FIXME: READ THIS!!
- kinda sorta got the animations (fill and unfill) to work... except: when you try
to fill before the unfill is finished, or try to unfill before the fill is finished.
^^^^ actually seems like it only occurs when you right click then left click 
(i.e. cell is filled, all fine and dandy, you try to unfill it then fill it before the unfill
animation is done. Maybe it has something to do with the fact that the unfill function
temporarily removes the listener then reapplies it? But isn't that only mouseover not mousedown???)
what you should look at is using the start node, see if the startnode exists when this glitch occurs, (both ways)
and just dig into it and solve it!
- also take a look at wtf you're doing with your function calls. in one area on 
a right click you call `cellRightClicked` which literally just called `resetCell`. Is
this `cellRightClicked` function really necessary?

### **TODO**
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
- 

### **COMPLETED TODOS**
- Make the ui on a basic level
- Implement basic clicking functionality


### **BUGS FIXED**
- no-drag for start and end works for initial placement, but if they're removed
then replaced, the drag functionality breaks (or rather, exists)
- sequence of events: place start, place end, place some obstacles. remove start or end
and place it on an obstacle => DOESN'T have the animated fill effect


