// control.js

let server = "192.168.70.165:1025";

// let ipAddress = "localhost";

// Add the mask to the time input
$(document).ready(function () {
  // $('#timeInput').mask('00:00');

  getAllTimers();

  initializeActivePresenterServer();

  initializeUpdateTimerBtn();



  setTimeout(() => {
    // fetchCurrentTimer();
    setInterval(fetchCurrentTimer, 1000);
  }, 2000);

});


const initializeActivePresenterServer = () => {
  // get all clients in the same local network
  // load the clients in a drop down
}


const initializeUpdateTimerBtn = () => {
  // event handler for when "Update Timer" button is clicked on
  document.getElementById('updateTimer').addEventListener('click', function () {
    const selectedUuid = document.getElementById('timerDropdown').value;
    const selectElement = document.getElementById("timerDropdown");
    const selectedText = selectElement.options[selectElement.selectedIndex].text;
    const timeString = document.getElementById('timeInput').value;
    const durationInSeconds = convertTimeToSeconds(timeString);

    if (selectedUuid && durationInSeconds !== null) {
      updateTimer(selectedUuid, durationInSeconds, selectedText);
    } else {
      console.error('Invalid input. Please ensure a timer is selected and time is correctly entered.');
    }
  });


  // event handler for when "Send Message" button is clicked on
  document.getElementById('sendMessage').addEventListener('click', function () {
    const messageInput = document.getElementById('messageInput').value;

    if (messageInput && messageInput !== null) {
      sendMessage(messageInput);
    } else {
      console.error('Invalid input. Please enter a message to send to stage.');
    }
  });



}


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

function updateTimer(uuid, duration, selectedText) {
  const url = `http://${server}/v1/timer/${uuid}`;
  const data = {
    id: {
      uuid: uuid,
      name: selectedText
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

      // setTimeout(() => {
      //   resetTimer();

      //   setTimeout(() => {
      //     startTimer();
      //   }, 300);
      // }, 300);

    })
    .catch(error => {
      console.error('Error updating timer:', error);
    });
}


function sendMessage(message) {
  const url = `http://${server}/v1/stage/message`;

  fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json', // Specify the content type
    },
    body: JSON.stringify(message) // Send the message directly as a JSON string
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok (${response.status} ${response.statusText})`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Message sent successfully:', data);
    })
    .catch(error => {
      console.error('Error sending message:', error);
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

function findObjectByUuid(dataArray, uuid) {
  return dataArray.find(item => item.id.uuid === uuid);
}

function fetchCurrentTimer() {
  const uuid = document.getElementById("timerDropdown").value;
  fetch(`http://${server}/v1/timers/current?chunked=false`) // Replace with your actual API endpoint
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {


      const jsonData = data;
      const foundObject = findObjectByUuid(jsonData, uuid);

      console.log('Current timer data:', foundObject);

      // Set the value to the input element
      document.getElementById('timerDisplay').textContent = foundObject.time;

      // Process the data as needed
    })
    .catch(error => {
      console.error('Error fetching current timer:', error);
    });
}




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
