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

updateDeliverCount();

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

    ctx.fillText('Waiting', 115, (elevator.targetFloor - 1) * floorHeight);
    ctx.stroke();
  }
}

function drawElevatorBox(xPos, yPos, wVal, hVal) {
  ctx.fillStyle = 'red';
  ctx.fillRect(xPos, yPos, wVal, hVal);
}

function animateElevator(idx, cb) {
  const elevator = elevators[idx];

  elevator.state = 1;

  if (elevator.currentFloor < elevator.targetFloor) {
    let gap = elevator.targetFloor - elevator.currentFloor; // 50 - 10 = 40
    let inLinear = parseInt(elevator.targetFloor / 5); // 50 / 5 = 10
    if (gap < 5) {
      // slower movement on near floor
      elevator.currentFloor += 0.1; // Speed of the elevator
    } else if (elevator.currentFloor === 0 && elevator.currentFloor <= inLinear) {
      elevator.currentFloor += 0.1;
    } else if (elevator.currentFloor > 0 && (elevator.currentFloor - 5) < inLinear) {
      elevator.currentFloor += 0.1;
    } else {
      elevator.currentFloor += 0.2; // Speed of the elevator
    }
    if (elevator.currentFloor > elevator.targetFloor) elevator.currentFloor = elevator.targetFloor;
  } else if (elevator.currentFloor > elevator.targetFloor) {
    let gap = elevator.currentFloor - elevator.targetFloor;
    if (elevator.previousFloor > 0) {
      let inLinear = parseInt(elevator.previousFloor / 5);
      if (gap < 5) {
        elevator.currentFloor -= 0.1; // Speed of the elevator
      } else if (elevator.currentFloor > parseInt(inLinear * 5)) {
        elevator.currentFloor -= 0.1;
      } else {
        elevator.currentFloor -= 0.2; // Speed of the elevator
      }
    } else {
      if (gap < 5) {
        elevator.currentFloor -= 0.1; // Speed of the elevator
      } else {
        elevator.currentFloor -= 0.2; // Speed of the elevator
      }
    }

    if (elevator.currentFloor < elevator.targetFloor) {
      elevator.currentFloor = elevator.targetFloor;
    }
  }

  drawElevator();
// Continue elevator until it reaches the target floor
  if (elevator.currentFloor !== elevator.targetFloor) {
    elevator.animationId = requestAnimationFrame(() => animateElevator(idx, cb));
  } else {
    elevator.previousFloor = elevator.currentFloor;
    cancelAnimationFrame(elevator.animationId);

    elevator.state = 0;
    if (typeof cb === 'function') cb(elevator);
  }
}

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

drawElevator(0, 0); // Initial drawing
drawElevator(1, 0); // Initial drawing
drawElevator(2, 0); // Initial drawing

let elvParams1 = [];
function setElevatorParams1() {
  elvParams1 = arguments;
}
function getElevatorParams1(){
  return elvParams1;
}
function clearElevatorParams1() {
  elvParams1 = [];
}

let elvParams2 = [];
function setElevatorParams2() {
  elvParams2 = arguments;
}
function getElevatorParams2(){
  return elvParams2;
}
function clearElevatorParams2() {
  elvParams2 = [];
}

let elvParams3 = [];
function setElevatorParams3() {
  elvParams3 = arguments;
}
function getElevatorParams3(){
  return elvParams3;
}
function clearElevatorParams3() {
  elvParams3 = [];
}

function animateElevator1(){
  animateElevator.apply(null, [0, ...getElevatorParams1()])
}
function animateElevator2(){
  animateElevator.apply(null, [1, ...getElevatorParams2()])
}
function animateElevator3(){
  animateElevator.apply(null, [2, ...getElevatorParams3()])
}

function mapSetIdxToElevator(idx, params) {
  if (idx === 2) {
    setElevatorParams3.apply(null, params)
  }

  if (idx === 1) {
    setElevatorParams2.apply(null, params)
  }

  if (idx === 0) {
    setElevatorParams1.apply(null, params)
  }
}

function mapClearParamsIdxElevator(idx) {
  if (idx === 2) {
    clearElevatorParams3()
  }

  if (idx === 1) {
    clearElevatorParams2()
  }

  if (idx === 0) {
    clearElevatorParams1()
  }
}

function mapCallIdxToElevator(idx) {
  if (idx === 2) {
    animateElevator3()
  }

  if (idx === 1) {
    animateElevator2()
  }

  if (idx === 0) {
    animateElevator1()
  }
}

// todo random
function go(idx, man, cb) {
  const elv = elevators[idx];
    // go to the man floor first
    elv.targetFloor = man.from - 1;
    mapSetIdxToElevator(idx, [function(elv) {

      setTimeout(function(){
        elv.targetFloor = man.to - 1;
        mapClearParamsIdxElevator(idx);
        mapSetIdxToElevator(idx, [function(el){
          if ((man.to - 1) == el.currentFloor) {
            updateDeliverCount(1)
          }

          // next
          if (typeof cb === 'function') {
            setTimeout(cb, 2000);
          }
        }])
        mapCallIdxToElevator(idx);
      }, 2000)
    }]);

    mapCallIdxToElevator(idx);
}

function getNextElevator(idx) {
  if (idx === 2) return 0;
  return idx + 1;
}

function getMan(idx) {
  if (idx === mans.length) return null;
  return mans[idx];
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
  })
}

run(0, 0)

