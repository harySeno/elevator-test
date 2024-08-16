const canvas = document.getElementById('elevatorCanvas');
const ctx = canvas.getContext('2d');
const elevatorInput = document.getElementById('elevatorInput');
const floorInput = document.getElementById('floorInput');
const requestButton = document.getElementById('requestButton');

const totalFloors = 50;
const floorHeight = 14; // Each floor will have a height of 14px to fit 50 floors in the canvas
const elevatorWidth = 10; // Smaller elevator width
const elevatorHeight = 13; // Smaller elevator height to fit within the floor height

// Class representing an elevator.
class Elevator {
  constructor() {
    this.currentFloor = 0;
    this.previousFloor = 0;
    this.targetFloor = 0;
    this.animationId = null;
    this.state = 0;
  }
  // Resets the elevator
  reset() {
    this.currentFloor = 0;
    this.previousFloor = 0;
    this.targetFloor = 0;
    this.animationId = null;
    this.state = 0;
  }
}

// Create multiple elevators
const elevators = [new Elevator(), new Elevator(), new Elevator()];

let startTime = new Date();
let finishTime = null;

let deliveredCount = 0;
let timeNeeded = 0;

// Set "waiting" on the targeted floor
let waitingFloors = new Set();

function updateDeliverCount(v) {
  if (v !== undefined && v > 0) {
    deliveredCount += v;
  }
  document.getElementById("startTime").innerHTML = startTime.toLocaleString();
  
  if (finishTime) {
    document.getElementById("finishTime").innerHTML = finishTime.toLocaleString();
    document.getElementById("gapTime").innerHTML = getDateTimeSince(startTime);
  }

  document.getElementById("counter").innerHTML = deliveredCount;
}

function drawElevator() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw floors and floor numbers
  ctx.fillStyle = 'black';
  for (let i = 0; i < totalFloors; i++) {
    const yPosition = canvas.height - (i + 1) * floorHeight;
    ctx.fillText(`Floor ${i+1}`, 10, yPosition + floorHeight - 2);
    
    ctx.beginPath();
    ctx.moveTo(0, yPosition);
    ctx.lineTo(canvas.width, yPosition);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(110, yPosition);
    ctx.lineTo(110, yPosition + canvas.height);
    ctx.stroke();

    //ctx.fillText('test', 115, yPosition + floorHeight - 1);
    // ctx.stroke()
  }

  // Draw elevator
  let gapBetween = 0;

  for (let idx = 0; idx < elevators.length; idx++) {
    if (idx > 0) {
      gapBetween = idx * 15;
    }
    const pos = 55 + gapBetween;
    const elevator = elevators[idx];
    drawElevatorBox(
      pos, 
      canvas.height - (elevator.currentFloor + 1) * floorHeight + (floorHeight - elevatorHeight), 
      elevatorWidth, 
      elevatorHeight
    );

    // Draw the "Waiting" text for target floors
    if (waitingFloors.has(elevator.targetFloor)) {
      ctx.fillStyle = 'red';
      ctx.fillText('Waiting', 115, canvas.height - (elevator.targetFloor + 1) * floorHeight + floorHeight / 2);
    }
  }
}

function drawElevatorBox(xPos, yPos, wVal, hVal) {
  ctx.fillStyle = 'red';
  ctx.fillRect(xPos, yPos, wVal, hVal);
}

function animateElevator(idx, cb) {
  const elevator = elevators[idx];

  if (elevator.currentFloor < elevator.targetFloor) {
    elevator.currentFloor += 0.1;
    if (elevator.currentFloor > elevator.targetFloor) elevator.currentFloor = elevator.targetFloor;
  } else if (elevator.currentFloor > elevator.targetFloor) {
    elevator.currentFloor -= 0.1;
    if (elevator.currentFloor < elevator.targetFloor) elevator.currentFloor = elevator.targetFloor;
  }

  drawElevator();
  // Continue elevator until it reaches the target floor
  if (elevator.currentFloor !== elevator.targetFloor) {
    elevator.animationId = requestAnimationFrame(() => animateElevator(idx, cb));
  } else {
    elevator.previousFloor = elevator.currentFloor;
    cancelAnimationFrame(elevator.animationId);

    elevator.state = 0; // Elevator is now idle
    if (typeof cb === 'function') cb(elevator);

    // Remove "Waiting" text after it reaches
    waitingFloors.delete(elevator.targetFloor);

    // Check if there's a queued request
    const nextRequest = getElevatorParams(idx);
    if (nextRequest.length > 0) {
      const [nextMan, nextCb] = nextRequest;
      go(idx, nextMan, nextCb);
    }
  }
}

let elevatorParams = [];

function setElevatorParams(idx, ...params) {
  elevatorParams[idx] = params;
}

function getElevatorParams(idx) {
  return elevatorParams[idx] || [];
}

function clearElevatorParams(idx) {
  elevatorParams[idx] = [];
}

function startElevatorAnimation(idx) {
  animateElevator(idx, ...getElevatorParams(idx));
}

function mapSetIdxToElevator(idx, params) {
  setElevatorParams(idx, ...params);
}

function mapClearParamsIdxElevator(idx) {
  clearElevatorParams(idx);
}

function mapCallIdxToElevator(idx) {
  startElevatorAnimation(idx);
}

function go(idx, man, cb) {
  const elevator = elevators[idx];

  // Check if the elevator is already moving
  if (elevator.state === 1) {
    // Queue this request for later
    setElevatorParams(idx, man, cb);
    return;
  }

  // Set the "Waiting" text
  waitingFloors.add(man.from - 1);

  // Start moving to the man's floor
  elevator.targetFloor = man.from - 1;
  elevator.state = 1; // Set state to busy

  mapSetIdxToElevator(idx, [function(elevator) {
    setTimeout(function() {
      elevator.targetFloor = man.to - 1;
      mapClearParamsIdxElevator(idx);

      mapSetIdxToElevator(idx, [function(el) {
        if ((man.to - 1) === el.currentFloor) {
          updateDeliverCount(1);
          console.log(`Elevator ${idx + 1} delivered a passenger from floor ${man.from} to ${man.to}`);
        }

        if (typeof cb === 'function') {
          setTimeout(cb, 2000);
        }
      }]);

      mapCallIdxToElevator(idx);
    }, 2000);
  }]);

  mapCallIdxToElevator(idx);
}

function dispatchRequests() {
  mans.forEach((man, idx) => {
    const elevatorIdx = idx % elevators.length;
    go(elevatorIdx, man);
  });

  // Update finish time when all requests are handled
  finishTime = new Date();
  updateDeliverCount();
}

dispatchRequests(); // Handling requests in parallel

function getNextElevator(idx) {
  return (idx + 1) % elevators.length;
}

function getMan(idx) {
  return idx < mans.length ? mans[idx] : null;
}

function run(elvIdx, row) {
  if (row == mans.length) return;
  const m = getMan(row);
  go(elvIdx, m, function(){
    const m2 = getMan(row+1);
    if (m2 != null) {
      return run(getNextElevator(elvIdx), row+1)
    } 

    finishTime = new Date();
    updateDeliverCount();
  });
}

run(0, 0);
