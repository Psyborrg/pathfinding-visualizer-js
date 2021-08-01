//Global Variables
let clicked = false;
let numRows = 40;
let numCols = 40;
let grid = [];
let startX = 10;
let startY = 5;
let finishX = 15;
let finishY = 15;
var nodesToVisit = [];
let delay = 25;
let density = 60;

function initializeBoard() {
  // LOOP + ADD CELLS
  let container = document.getElementById("grid");
  for (let row = 0; row < numRows; row++) {
    let row_array = [];
    for (let col = 0; col < numCols; col++) {
      node = new Node(row, col);
      row_array.push(node);
      let cell = document.createElement("div");
      cell.className = "cell";
      var id = row.toString() + "," + col.toString();
      //   cell.innerHTML = id;
      cell.setAttribute("id", id);

      // Set background colors based on if they are the start, finish, or neither
      if (row == startY && col == startX) {
        node.isStart = true;
        node.prevNode = node;
        node.distance = 0;
        cell.style.backgroundColor = "green";
      } else if (row == finishY && col == finishX) {
        node.isFinish = true;
        cell.style.backgroundColor = "red";
      } else {
        cell.style.backgroundColor = "white";
      }

      //   Add listeners for mouse actions, used to change the terrain type and move the start and end cells
      cell.addEventListener("mousedown", mousedown);
      cell.addEventListener("mouseover", mouseover);
      cell.addEventListener("mouseup", mouseup);

      function mousedown() {
        clicked = true;
        console.log(this.classList);
        togglePassable(this);
      }

      function mouseover() {
        if (clicked == true) {
          togglePassable(this);
        }
      }

      function mouseup() {
        clicked = false;
      }

      container.appendChild(cell);
    }
    grid.push(row_array);
  }
  console.table(grid);
}

function changeCellColor(node, color) {
  let cellid = node.row.toString() + "," + node.col.toString();
  let cell = document.getElementById(cellid);
  cell.style.backgroundColor = color;
}

function resetBoard() {
  // Reset the colors of the board
  // TO DO: EVERYTHING ELSE ie. passability of terrain
  // let container = document.getElementById("grid");
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      let cellid = row.toString() + "," + col.toString();
      let cell = document.getElementById(cellid);
      cell.remove();
    }
  }
  grid = [];
  nodesToVisit = [];
  initializeBoard();
}

function togglePassable(cell) {
  cellid = cell.id;
  node = grid[cellid.split(",")[0]][cellid.split(",")[1]];
  if (node.isPassable) {
    node.isPassable = false;
    console.log("Now unpassable");
    changeCellColor(node, "gray");
  } else {
    node.isPassable = true;
    console.log("Now Passable");
    changeCellColor(node, "white");
  }
}

function startSearch() {
  // Get the selector
  var select = document.getElementById("algorithms");
  // See what algorithm was selected
  var algorithm = select.options[select.selectedIndex].text;
  console.log(algorithm + " has been selected");

  if (algorithm === "Dijkstras") {
    initializeDijkstras();
  } else if (algorithm === "Breadth-First Search") {
    initializeBreadthFirstSearch();
  } else if (algorithm === "Depth-First Search") {
    initializeDepthFirstSearch();
  } else if (algorithm === "Greedy Best-First Search") {
    initializeGreedyBestFirstSearch();
  }
  // TO DO:
  // INCLUDE THE ABILITY TO RUN OTHER ALGORITHMS
}

// How does dijkstras work?
// Need to get from one node to another, find shortest path
// has a stack of nodes that need to be visited, starting node has a dist of zero and all others begin with infinity
// Pops nodes off the stack one by one in order of lowest distance, when they get popped off: get the distance for every adjacent node
// The node that gets popped off moves to the "visited" heap
// continue until you reach the finish node

function initializeDijkstras() {
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      // Get the node object in the grid array
      let node = grid[row][col];
      // Get the proper cell in the html
      let cellid = row.toString() + "," + col.toString();
      let cell = document.getElementById(cellid);

      // Make sure colors are correct
      if (row == startY && col == startX) {
        cell.classList.add("cell-start");
        node.isStart = true;
        node.distance = 0;
        // Set prevNode to node, used for backtracking the path
        node.prevNode = node;
      } else if (row == finishY && col == finishX) {
        cell.classList.add("cell-finish");
        node.isFinish = true;
        // Set the distance to infinity
        node.distance = Number.POSITIVE_INFINITY;
        // Make sure that no other nodes are set as the start or finish
      } else if (node.isPassable == false) {
        cell.classList.add("cell-unpassable");
        node.isStart = false;
        node.isFinish = false;
        // Set the distance to infinity
        node.distance = Number.POSITIVE_INFINITY;
      } else {
        node.isStart = false;
        node.isFinish = false;
        // Set the distance to infinity
        node.distance = Number.POSITIVE_INFINITY;
      }

      // Add the nodes to the nodesToVisit array
      nodesToVisit.push(node);
    }
  }
  dijkstrasRecursion();
}

function dijkstrasRecursion() {
  // Sort the array of nodes to visit
  nodesToVisit.sort((a, b) => (a.distance > b.distance ? 1 : -1));

  // Get the current node
  let currNode = nodesToVisit.shift();
  // Get the proper cell in the html
  let currCellid = currNode.row.toString() + "," + currNode.col.toString();
  let currCell = document.getElementById(currCellid);

  // If the node popped has a distance of infinity, return because there is no path
  if (currNode.distance == Number.POSITIVE_INFINITY) {
    console.log("No path available");
    return;
  }
  // If the current node is the finish, then backtrack for the shortest path
  if (currNode.isFinish == true) {
    console.log("Found the shortest path, distance: " + currNode.distance);
    backtrack(currNode);
    return;
  }

  // change the distance values for the neighbors
  checkNeighbors(currNode);
  // Set the current node to have been visited
  currNode.visited = true;

  // Try to add animations to the visit, including color change
  currCell.classList.add("cell-visited");

  // Run the recursion again after a delay
  setTimeout(dijkstrasRecursion, delay);
}

// Finds the shortest path by backtracking through the previous nodes
function backtrack(node) {
  // Get the proper cell in the html
  let cellid = node.row.toString() + "," + node.col.toString();
  let cell = document.getElementById(cellid);

  // Try to add amimations to the shortest path
  cell.classList.remove("cell-visited");
  cell.classList.add("cell-shortestpath");

  if (node.prevNode == node) {
    return;
  } else {
    backtrack(node.prevNode);
  }
}

// Searches using breadthfirstsearch
// How to?
// Make a queue of nodes to visit, add their neighbors to the queue
function initializeBreadthFirstSearch() {
  startNode = grid[startY][startX];
  nodesToVisit.push(startNode);
  breadthFirstSearch();
}

function breadthFirstSearch() {
  // Base case for if no more nodes to check, ie no path available
  if (nodesToVisit.length == 0) {
    console.log("No path found");
    return;
  }

  // Get the first element in the array (queue)
  currNode = nodesToVisit.shift();
  // Get the proper cell in the html
  let currCellid = currNode.row.toString() + "," + currNode.col.toString();
  let currCell = document.getElementById(currCellid);

  // If the current node is the finish, then backtrack for the shortest path
  if (currNode.isFinish == true) {
    console.log("Found the shortest path, distance: " + currNode.distance);
    backtrack(currNode);
    return;
  }

  // check the neighbors
  checkNeighbors(currNode);

  // Set the current node to have been visited
  currNode.visited = true;
  // Try to add animations to the visit, including color change
  currCell.classList.add("cell-visited");
  // Run the recursion again after a delay
  setTimeout(breadthFirstSearch, delay);
}

function checkNeighbors(node) {
  let moves = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  // For each direction, add the node to the queue of nodes to visit
  for (let i = 0; i < moves.length; i++) {
    // Check that the adjacent node is inside the bounds
    newRow = node.row + moves[i][0];
    newCol = node.col + moves[i][1];

    // If the new row or column is outside the bounds, skip it
    if (newRow < 0 || newRow >= numRows) {
      continue;
    }
    if (newCol < 0 || newCol >= numCols) {
      continue;
    }

    // Get the adjacent Node
    adjNode = grid[newRow][newCol];

    // If the adjacent node is a wall or has been visited before, dont add it to the list
    if (adjNode.isPassable == false) {
      console.log("found a wall");
      continue;
    } else {
      // Update the greed heuristic
      heuristic =
        Math.abs(adjNode.row - finishY) + Math.abs(adjNode.col - finishX);
      adjNode.greedHeuristic = heuristic;

      //  If this is a better path than before, update the distance and previous Node
      newDist = node.distance + 1;
      if (adjNode.distance > newDist) {
        adjNode.distance = node.distance + node.weight;
        adjNode.prevNode = node;
      }
    }

    // If it has already been visited, dont add it to the list
    if (adjNode.visited == true) {
      console.log("already looked at this node");
      continue;
    } else {
      let adjCellid = adjNode.row.toString() + "," + adjNode.col.toString();
      let adjCell = document.getElementById(adjCellid);
      adjCell.style.backgroundColor = "orange";
      // Otherwise add it to the queue and set its prevNode to the currNode
      adjNode.prevNode = node;

      // add the adjacent node if it isnt already in the queue
      if (!nodesToVisit.includes(adjNode)) {
        nodesToVisit.push(adjNode);
      }
    }
  }
}

// Searches using depthfirstsearch
// How to?
// Make a stack of nodes to visit, add their neighbors to the queue
function initializeDepthFirstSearch() {
  startNode = grid[startY][startX];
  nodesToVisit.push(startNode);
  depthFirstSearch();
}

function depthFirstSearch() {
  // Base case for if no more nodes to check, ie no path available
  if (nodesToVisit.length == 0) {
    console.log("No path found");
    return;
  }

  // Get the first element in the array (stack)
  currNode = nodesToVisit.pop();
  // Get the proper cell in the html
  let currCellid = currNode.row.toString() + "," + currNode.col.toString();
  let currCell = document.getElementById(currCellid);

  // If the current node is the finish, then backtrack for the shortest path
  if (currNode.isFinish == true) {
    console.log("Found the shortest path, distance: " + currNode.distance);
    backtrack(currNode);
    return;
  }

  // check the neighbors
  checkNeighbors(currNode);

  // Set the current node to have been visited
  currNode.visited = true;
  // Try to add animations to the visit, including color change
  currCell.classList.add("cell-visited");
  // Run the recursion again after a delay
  setTimeout(depthFirstSearch, delay);
}

// Starter function for the recursion
function initializeGreedyBestFirstSearch() {
  // Set the heuristic for the start node
  startHeuristic = Math.abs(startY - finishY) + Math.abs(startX - finishX);
  startNode = grid[startY][startX];
  startNode.greedHeuristic = startHeuristic;
  nodesToVisit.push(startNode);
  greedyBestFirstSearch();
}

// Recursively find the greeedy path
function greedyBestFirstSearch() {
  // Base case for if no more nodes to check, ie no path available
  if (nodesToVisit.length == 0) {
    console.log("No path found");
    return;
  }

  // Sort the array of nodes to visit
  nodesToVisit.sort((a, b) => (a.greedHeuristic > b.greedHeuristic ? 1 : -1));

  // Get the first element in the array
  currNode = nodesToVisit.shift();
  // Get the proper cell in the html
  let currCellid = currNode.row.toString() + "," + currNode.col.toString();
  let currCell = document.getElementById(currCellid);

  // If the current node is the finish, then backtrack for the shortest path
  if (currNode.isFinish == true) {
    console.log("Found the shortest path, distance: " + currNode.distance);
    backtrack(currNode);
    return;
  }

  // check the neighbors
  checkNeighbors(currNode);

  // Set the current node to have been visited
  currNode.visited = true;
  // Try to add animations to the visit, including color change
  currCell.classList.add("cell-visited");
  // Run the recursion again after a delay
  setTimeout(greedyBestFirstSearch, delay);
}

// Finds the shortest path by backtracking through the previous nodes
function backtrack(node) {
  // Get the proper cell in the html
  let cellid = node.row.toString() + "," + node.col.toString();
  let cell = document.getElementById(cellid);

  // Try to add amimations to the shortest path
  cell.classList.remove("cell-visited");
  cell.classList.add("cell-shortestpath");

  if (node.prevNode == node) {
    return;
  } else {
    backtrack(node.prevNode);
  }
}

// Functions that allow for the random generation of walls
function generateWalls() {
  resetBoard();
  addOuterWalls();
  addInnerWalls(true, 1, numCols - 2, 1, numRows - 2);
}

function addOuterWalls() {
  for (var i = 0; i < numRows; i++) {
    // If the top or bottom row, fill it all in
    if (i == 0 || i == numRows - 1) {
      for (var j = 0; j < numCols; j++) {
        node = grid[i][j];
        node.isPassable = false;
        changeCellColor(node, "gray");
      }
    } else {
      // Otherwise just fill in the first and last column
      node = grid[i][0];
      node.isPassable = false;
      changeCellColor(node, "gray");
      node = grid[i][numCols - 1];
      node.isPassable = false;
      changeCellColor(node, "gray");
    }
  }
}

function addInnerWalls(h, minX, maxX, minY, maxY) {
  if (h) {
    if (maxX - minX < 2) {
      return;
    }

    var y = Math.floor(randomNumber(minY, maxY) / 2) * 2;
    addHWall(minX, maxX, y);

    addInnerWalls(!h, minX, maxX, minY, y - 1);
    addInnerWalls(!h, minX, maxX, y + 1, maxY);
  } else {
    if (maxY - minY < 2) {
      return;
    }

    var x = Math.floor(randomNumber(minX, maxX) / 2) * 2;
    addVWall(minY, maxY, x);

    addInnerWalls(!h, minX, x - 1, minY, maxY);
    addInnerWalls(!h, x + 1, maxX, minY, maxY);
  }
}

function addHWall(minX, maxX, y) {
  var hole = Math.floor(randomNumber(minX, maxX) / 2) * 2 + 1;

  for (var i = minX; i <= maxX; i++) {
    if (i == hole) {
      node = grid[y][i];
      node.isPassable = true;
      changeCellColor(node, "white");
    } else {
      node = grid[y][i];
      node.isPassable = false;
      changeCellColor(node, "gray");
    }
  }
}

function addVWall(minY, maxY, x) {
  var hole = Math.floor(randomNumber(minY, maxY) / 2) * 2 + 1;

  for (var i = minY; i <= maxY; i++) {
    if (i == hole) {
      node = grid[i][x];
      node.isPassable = true;
      changeCellColor(node, "white");
    } else {
      node = grid[i][x];
      node.isPassable = false;
      changeCellColor(node, "gray");
    }
  }
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Recursive Division Algorithm for wall generation
// How to?
// Choose an area to be divided, at the start this will be the whole board
// Divide the chosen area by constructing a line through it at some random point
// Choose a location in the wall and build a single gap at random
// If the divided portions are big enough (height and width greater than 1) add the new arreas to the stack
// Stop when there are no more areas to divide

// function recursiveDivision(startRow, endRow, startCol, endCol) {
//   console.log("Started dividing");

//   // Calculate dimensions of the region
//   let height = endRow - startRow;
//   let width = endCol - startCol;

//   // Check for base case, if area = 1
//   if (height <= 1 && width <= 1) {
//     console.log("Finished constructing maze");
//     return;
//   }

//   // Divide the region in two
//   orientationValue = Math.floor(Math.random() * (width + height));
//   console.log(orientationValue);

//   // If the random value is greater than the width, divide horizontally
//   if (orientationValue > width) {
//     wallIndex = Math.floor(Math.random() * width);
//     // console.log("supposed to be horizontal");
//     for (i = startCol; i < endCol; i++) {
//       node = grid[startRow + wallIndex][i];
//       node.isPassable = false;
//       changeCellColor(node, "gray");
//     }
//     removeRandomWall(wallIndex, wallIndex, startCol, endCol);
//     recursiveDivision();
//   } else {
//     // Vertical wall
//     wallIndex = Math.floor(Math.random() * height);
//     for (i = startRow; i < endRow; i++) {
//       node = grid[i][startCol + wallIndex];
//       node.isPassable = false;
//       changeCellColor(node, "gray");
//     }
//     removeRandomWall(startRow, endRow, wallIndex, wallIndex);
//     recursiveDivision();
//   }
// }

// function removeRandomWall(startRow, endRow, startCol, endCol) {
//   let height = endRow - startRow;
//   let width = endCol - startCol;
//   // If vertical
//   if (endRow > startRow) {
//     wallIndex = Math.floor(Math.random() * height);
//     node = grid[wallIndex][startCol];
//     node.isPassable = true;
//     changeCellColor(node, "white");
//   } else {
//     // If horizontal
//     wallIndex = Math.floor(Math.random() * width);
//     node = grid[startRow][wallIndex];
//     node.isPassable = true;
//     changeCellColor(node, "white");
//   }
// }

// 1. Collect all the cells in the maze into a single region.
// 2. Split the region into two, using the following process:
//    2.1 Choose two cells from the region at random as “seeds”. Identify one as subregion A and one as subregion B. Put them into a set S.
//    2.2 Choose a cell at random from S. Remove it from the set.
//    2.3 For each of that cell’s neighbors, if the neighbor is not already associated with a subregion, add it to S, and associate it with the same subregion as the cell itself.
//    2.4 Repeat 2.2 and 2.3 until the entire region has been split into two.
// 3. Construct a wall between the two regions by identifying cells in one region that have neighbors in the other region. Leave a gap by omitting the wall from one such cell pair.
// 4. Repeat 2 and 3 for each subregion, recursively.
function nonStandardRecursiveDivision() {
  console.log("Started blobby division");

  // Split into two
  // Get the seeds for the splitting
}

// Declaration for Node class that will hold the information for each cell
class Node {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.isStart = false;
    this.isFinish = false;
    this.isPassable = true;
    this.weight = 1;
    this.prevNode = null;
    this.distance = Number.POSITIVE_INFINITY;
    this.visited = false;
    this.greedHeuristic = Number.POSITIVE_INFINITY;
  }
}
