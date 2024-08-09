

// let server = "192.168.70.164:1025";
let server = "192.168.0.132:1025";

// let ipAddress = "localhost";

// Add the mask to the time input
$(document).ready(function () {

    getAllTimers();

    initializeActivePresenterServer();

    initializeUpdateTimerBtn();


    showExisingMsgs();


    setTimeout(() => {
        setInterval(fetchCurrentTimer, 1000);
    }, 2000);

});

const showExisingMsgs = function () {
    let message = window.localStorage.getItem('msgs');
    if (message) {
        $('#messageLabel').text(message);
    }
}

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
            // updateTimer(selectedUuid, durationInSeconds, selectedText);
            startTimer();
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


/** 
 * Populates the dropdown with all timers
 * Also populates the button groups with all timers
 * **/
function populateDropdown(data) {
    const select = document.getElementById('timerDropdown');
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id.uuid;
        option.textContent = item.id.name;
        $(option).attr('duration', item.countdown.duration);
        select.appendChild(option);
    });


    /** 
    let $buttonContainer = $('#buttonContainer');
    data.forEach(item => {
        let totalSeconds = item.countdown.duration;

        let hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        let minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        let seconds = (totalSeconds % 60).toString().padStart(2, '0');


        let formattedTime = `${hours}:${minutes}:${seconds}`;

        let button = `<button id="${item.id.uuid}" type="button" onclick="startButtonTimer(this)" class="m-1 btn-timer-item btn btn-success">${item.id.name} <br /> ${formattedTime}</button>`;
        $buttonContainer.append(button);
    });
    **/


}

function sendButtonMessage(msg, obj) {

    $('.btn-timer-item').removeClass('btn-danger btn-success fw-bold').addClass('btn-success');

    let newTimeString = $(obj).find('span').text();

    $(obj).addClass('btn-danger fw-bold');

    // set the timer input with new time string
    $("#timeInput").val(newTimeString);

    // console.log($(obj));

    window.localStorage.setItem('msgs', msg);
    $('#messageLabel').text(msg);
    // $("#timeInput").val($("#timerDisplay").text().substring(3));

    // sends the new message to the stage monitor
    sendMessage(msg);

    // updates & starts the timer
    startTimer();
}

function startButtonTimer(btn) {
    let timerId = $(btn).attr("id");

    let $timerEl = $("#timerDropdown");
    $timerEl.val(timerId);

    window.localStorage.setItem('activeTimer', timerId);
    $timerEl.trigger("change");

    resetTimer(); // reset all timers

    // start a new timer
    setTimeout(() => {
        startTimer();
    }, 400);

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


    // stop active timer
    resetTimer();


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

            // Set the value to the input element
            document.getElementById('timerDisplay').textContent = foundObject.time;

            // Process the data as needed
        })
        .catch(error => {
            console.error('Error fetching current timer:', error);
        });
}

function fetchCurrentTimerOnce() {
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

            // Set the value to the input element
            $("#timeInput").val($("#timerDisplay").text());

            // Process the data as needed
        })
        .catch(error => {
            console.error('Error fetching current timer:', error);
        });
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

function resetTimer() {
    // timerOperation("reset");
    const url = `http://${server}/v1/timers/reset`;

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

function startExistingTimer() {
    // timerOperation("start");
    const uuid = document.getElementById("timerDropdown").value;
    const url = `http://${server}/v1/timer/${uuid}/start`;


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
function startTimer() {
    // timerOperation("start");

    // get the timer to be set
    const uuid = document.getElementById("timerDropdown").value;
    const duration = convertTimeToSeconds($("#timeInput").val());
    const name = $("#messageLabel").text();

    if (duration === null) {
        alert("Invalid time format. Please use HH:MM format.");
        return;
    }

    const url = `http://${server}/v1/timer/${uuid}/start`;
    const data = {
        "allows_overrun": true,
        "countdown": {
            "duration": duration
        },
        "id": {
            "index": 0,
            "name": name,
            "uuid": uuid
        }
    };
    // Configuration for the fetch request
    const options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    };

    fetch(url, options)
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


function stopTimer() {
    timerOperation("stop");
}




