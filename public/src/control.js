// control.js

const socket = io('http://localhost:3000');

// Control view
function updateTimer() {
  const timeInput = document.getElementById('timeInput').value;
  const labelInput = document.getElementById('labelInput').value;

  // Regular expression to match the HH:mm:ss format
  const timeFormatRegex = /^(?:[01]\d|2[0-3]):(?:[0-5]\d):(?:[0-5]\d)$/;

  if (!timeFormatRegex.test(timeInput)) {
    alert('Please enter the time in the format HH:mm:ss. For example, 01:05:20');
    return;
  }

  const [hours, minutes, seconds] = timeInput.split(':').map(Number);
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  const newData = {
    timeRemaining: totalSeconds,
    labelText: labelInput,
  };

  socket.emit('update', newData);
}