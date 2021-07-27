let clicked = false;
let numRows = 20;
let numCols = 20;
let grid = [];
startX = 10;
startY = 5;
finishX = 15;
finishY = 15;
delay = 50;

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
        cell.style.backgroundColor = "green";
      } else if (row == finishY && col == finishX) {
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

function resetBoard() {
  // Reset the colors of the board
  // TO DO: EVERYTHING ELSE ie. passability of terrain
  let container = document.getElementById("grid");
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
    cell.style.backgroundColor = "gray";
  } else {
    node.isPassable = true;
    console.log("Now Passable");
    cell.style.backgroundColor = "white";
  }
}

// How does dijkstras work?
// Need to get from one node to another, find shortest path
// has a stack of nodes that need to be visited, starting node has a dist of zero and all others begin with infinity
// Pops nodes off the stack one by one in order of lowest distance, when they get popped off: get the distance for every adjacent node
// The node that gets popped off moves to the "visited" heap
// continue until you reach the finish node

var nodesToVisit = [];

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
  console.log(nodesToVisit);

  // Get the current node
  let currNode = nodesToVisit[0];
  // Get the proper cell in the html
  let currCellid = currNode.row.toString() + "," + currNode.col.toString();
  let currCell = document.getElementById(currCellid);

  // Remove the node from the list of nodes to visit
  nodesToVisit.shift();
  console.log(nodesToVisit);

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

  //  Get the adjacent Node distances
  let moves = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  // For each direction, try editing the distance for that node
  for (let i = 0; i < moves.length; i++) {
    // Check that the adjacent node is inside the bounds
    newRow = currNode.row + moves[i][0];
    newCol = currNode.col + moves[i][1];

    // If the new row or column is outside the bounds, skip it
    if (newRow < 0 || newRow >= grid.length) {
      continue;
    }
    if (newCol < 0 || newCol >= grid[currNode.row].length) {
      continue;
    }

    // Get the adjacent Node and its new Distance
    adjNode = grid[newRow][newCol];
    newDist = currNode.distance + adjNode.weight;
    // console.log("current distance: " + currNode.distance);
    // console.log("adjacent weight: " + adjNode.weight);
    // console.log("new distance: " + newDist);

    // If the adjacent node is a wall, dont update it
    if (adjNode.isPassable == false) {
      console.log("found a wall");
      continue;
    }

    //  If this is a better path than before, update the distance and previous Node
    if (adjNode.distance > newDist) {
      adjNode.distance = currNode.distance + adjNode.weight;
      adjNode.prevNode = currNode;
    }
  }

  // Try to add animations to the visit, including color change
  currCell.classList.add("cell-visited");

  // Run the recursion again after a delay
  setTimeout(dijkstrasRecursion, delay);
}

function backtrack(node) {
  // Get the proper cell in the html
  let cellid = node.row.toString() + "," + node.col.toString();
  let cell = document.getElementById(cellid);

  cell.classList.remove("cell-visited");
  cell.classList.add("cell-shortestpath");

  if (node.prevNode == node) {
    return;
  } else {
    backtrack(node.prevNode);
  }
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
  }
}
