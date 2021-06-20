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
- still working on the cool like animated fill-in effect for drawing the squares.
I mean it's pretty good, only issue is if I were to place a start or end node on
an obstacle node, it's just instantly placed which is lame. I was working in the 
sandbox file to see if making an animation would help at all. Not sure. brains fried.
l8r sk8r

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

### **BUGS**
- sequence of events: place start, place end, place some obstacles. remove start or end
and place it on an obstacle => DOESN'T have the animated fill effect

### **COMPLETED TODOS**
- Make the ui on a basic level
- Implement basic clicking functionality


### **BUGS FIXED**
- no-drag for start and end works for initial placement, but if they're removed
then replaced, the drag functionality breaks (or rather, exists)


