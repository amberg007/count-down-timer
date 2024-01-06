// control.js

let server = "192.168.0.123:1025";

// let ipAddress = "localhost";

// Add the mask to the time input
$(document).ready(function () {
  // $('#timeInput').mask('00:00');

  getAllTimers();


  document.getElementById('updateTimer').addEventListener('click', function () {
    const selectedUuid = document.getElementById('timerDropdown').value;
    const timeString = document.getElementById('timeInput').value;
    const durationInSeconds = convertTimeToSeconds(timeString);

    if (selectedUuid && durationInSeconds !== null) {
      updateTimer(selectedUuid, durationInSeconds);
    } else {
      console.error('Invalid input. Please ensure a timer is selected and time is correctly entered.');
    }
  });
});



/**
 * Load all Timer component to a dropdown
 */
function getAllTimers() {

  fetch(`http://${server}/v1/timers?chunked=false`)
    .then(response => response.json())
    .then(data => {
      populateDropdown(data);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
}


function populateDropdown(data) {
  const select = document.getElementById('timerDropdown');
  data.forEach(item => {
    const option = document.createElement('option');
    option.value = item.id.uuid;
    option.textContent = item.id.name;
    select.appendChild(option);
  });
}

function updateTimer(uuid, duration) {
  const url = `http://192.168.0.123:1025/v1/timer/${uuid}`;
  const data = {
    id: {
      uuid: uuid
    },
    allows_overrun: true,
    countdown: {
      duration: duration
    }
  };

  fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Timer updated successfully:', data);

      // startTimer();

    })
    .catch(error => {
      console.error('Error updating timer:', error);
    });
}

function convertTimeToSeconds(timeString) {
  const parts = timeString.split(':');
  if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    if (!isNaN(minutes) && !isNaN(seconds)) {
      return minutes * 60 + seconds;
    }
  }
  return null;
}

/////////////


function resetTimer() {
  timerOperation("reset");
}

function startTimer() {
  timerOperation("start");
}


function stopTimer() {
  timerOperation("stop");
}



function timerOperation(action) {
  const uuid = document.getElementById('timerDropdown').value;

  const url = `http://${server}/v1/timer/${uuid}/${action}`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Timer started successfully:', data);
    })
    .catch(error => {
      console.error('Error starting timer:', error);
    });
}
