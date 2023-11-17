// display.js
let ipAddress = "localhost";

const socket = io(`http://${ipAddress}:3000`);
const timerElement = document.getElementById('timer');
const labelElement = document.getElementById('label');
const displayElement = document.getElementById('display-view');
let timerInterval; // Declare the interval variable globally

socket.on('update', (data) => {
  updateDisplay(data);
});

// Handle updates from the control view
socket.on('updateScale', (data) => {
  // update scale
  displayElement.style.scale = data.displayScale;
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
    if (isNegative && timeRemaining < -600000) {
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

  // update scale
  displayElement.style.scale = data.displayScale;
}
