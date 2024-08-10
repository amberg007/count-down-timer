const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const os = require('os');

const nmap = require('node-nmap');

// Get the network interfaces
const networkInterfaces = os.networkInterfaces();

// Extract the IP address
const ipAddress = process.env.SERVER_IP || 'localhost';

console.log('Server IP address:', ipAddress);


const dataFilePath = path.join(__dirname, 'countdownData.json');

let countdownData = loadCountdownData();

function loadCountdownData() {

  /**
   * 
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    const parsedData = JSON.parse(data);
    console.log('Loaded countdown data:', parsedData);
    return parsedData;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, create it with default data
      fs.writeFileSync(dataFilePath, JSON.stringify({
        timeRemaining: 300, // Initial time in seconds
        labelText: 'Countdown Timer',
      }, null, 2), 'utf8');
      console.log('Countdown data file created.');
      return {
        timeRemaining: 300,
        labelText: 'Countdown Timer',
      };
    } else {
      console.error('Error loading countdown data:', error.message);
    }
  }

   */

  return {
    timeRemaining: 300, // Default time in seconds
    labelText: 'Countdown Timer',
  };
}

function saveCountdownData() {
  const dataToSave = JSON.stringify(countdownData, null, 2);
  fs.writeFileSync(dataFilePath, dataToSave, 'utf8');
}

app.use(express.static(path.join(__dirname, 'public')));


app.get('/display', (req, res) => {
  const serverIp = process.env.SERVER_IP || 'localhost'; // Use the server IP from the environment variable or default to 'localhost'
  res.sendFile(path.join(__dirname, 'public', 'display.html'), { serverIp });
});

app.get('/control', (req, res) => {
  const serverIp = process.env.SERVER_IP || 'localhost'; // Use the server IP from the environment variable or default to 'localhost'
  res.sendFile(path.join(__dirname, 'public', 'control.html'), { serverIp });
});


io.on('connection', (socket) => {
  // Send initial data to new connections
  socket.emit('update', countdownData);

  // Handle updates from the control view
  socket.on('update', (data) => {
    countdownData = data;
    io.emit('update', countdownData);

    // saveCountdownData(); // Save the updated data
  });


  // Handle scale updates from the control view
  socket.on('updateScale', (data) => {
    data = { ...data, "test": "hello" };
    io.emit('updateScale', data);

    // logging
    console.log("recieved scale data: ", data)
  });
});

function updateTimer() {
  const isNegative = countdownData.timeRemaining < 0;

  const absoluteTime = isNegative ? Math.abs(countdownData.timeRemaining) : countdownData.timeRemaining;

  const hours = Math.floor(absoluteTime / 3600);
  const minutes = Math.floor((absoluteTime % 3600) / 60);
  const seconds = absoluteTime % 60;

  const formattedHours = isNegative ? `-${hours < 10 ? '0' : ''}${hours}` : `${hours < 10 ? '0' : ''}${hours}`;
  const formattedMinutes = `${minutes < 10 ? '0' : ''}${minutes}`;
  const formattedSeconds = `${seconds < 10 ? '0' : ''}${seconds}`;

  const updatedDisplayTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;

  countdownData.timeRemaining--;


  /** this code stops further execution when timer reaches -10 */
  if (isNegative && countdownData.timeRemaining < -600) {
    clearInterval(timerInterval);
    io.emit('update', {
      timeRemaining: countdownData.timeRemaining,
      labelText: countdownData.labelText,
      displayTime: updatedDisplayTime,
    });
    return;
  }

  // Open browser only once when the server starts
  if (!isNegative && countdownData.timeRemaining === 299) {
    // openBrowserOnDisplay(1);
  }

  saveCountdownData(); // Save the updated data after each interval

  io.emit('update', {
    timeRemaining: countdownData.timeRemaining,
    labelText: countdownData.labelText,
    displayTime: updatedDisplayTime, // Use the updated display time
  });
}


let timerInterval = setInterval(updateTimer, 1000);

server.listen(80, async () => {

  // get system information
  //  const si = require('systeminformation');
  //  si.graphics()
  //   .then(data => console.log(data.displays))
  //   .catch(error => console.error(error));

  console.log(`ugyc timer control is running on http://streamer.local`);
  console.log(`============= !! important !! ================`);
  console.log(`============= PLEASE DONT CLOSE WINDOW, JUST MINIMIZE IT ================`);
  console.log("");
  console.log("");
  console.log("");
  console.log("");
  console.log("Enter this url in the browser on any device in church that is");
  console.log("connected to any of the wifi");
  console.log("");
  console.log("streamer.local");
  console.log("");
  console.log("");
  console.log("e.g Pastor Salu's mobile phone chrome browser");
  console.log("");
  console.log("");
  console.log("");
  console.log("");
  console.log("===========================================================================");
  // const open = (await import('open')).default;
  // open(`http://${ipAddress}:3000/display`);
});

