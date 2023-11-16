// display.js

const socket = io('http://localhost:3000');
const timerElement = document.getElementById('timer');
const labelElement = document.getElementById('label');
const displayElement = document.getElementById('display-view');
let timerInterval; // Declare the interval variable globally

socket.on('update', (data) => {
  updateDisplay(data);
});


// scale data subscription
socket.on('updateScale', (data) => {
  updateScaleOnDisplay(data);
});

function updateDisplay(data) {
  let timeRemaining = data.timeRemaining;

  function updateTimer() {
    const isNegative = timeRemaining < 0;

    const absoluteTime = isNegative ? Math.abs(timeRemaining) : timeRemaining;

    const hours = Math.floor(absoluteTime / 3600);
    const minutes = Math.floor((absoluteTime % 3600) / 60);
    const seconds = absoluteTime % 60;

    const formattedHours = isNegative ? `-${hours < 10 ? '0' : ''}${hours}` : `${hours < 10 ? '0' : ''}${hours}`;
    const formattedMinutes = `${minutes < 10 ? '0' : ''}${minutes}`;
    const formattedSeconds = `${seconds < 10 ? '0' : ''}${seconds}`;

    const displayTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;

    timerElement.textContent = displayTime;
    timeRemaining--;

    // You can customize this part based on your requirements
    if (isNegative && timeRemaining < -600) {
      clearInterval(timerInterval);
      timerElement.textContent = '00:00:00';
    }
  }

  // Initial update
  updateTimer();

  // Set up interval to update timer every second
  clearInterval(timerInterval); // Clear existing interval before setting up a new one
  timerInterval = setInterval(updateTimer, 1000);

  // Update label
  labelElement.textContent = data.labelText;
}


function updateScaleOnDisplay(data) {
  console.log('data on scale: ', data);


  // change the scale of the UI if scale value was sent
  let displayScale = data.displayScale;

  if (displayScale) {
    console.log("display scale data: ", displayScale);

    displayElement.style.scale = displayScale;
  }

}