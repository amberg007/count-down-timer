const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let countdownData = {
  timeRemaining: 300, // Initial time in seconds
  labelText: 'Countdown Timer',
};

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/display', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'display.html'));
});

app.get('/control', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'control.html'));
});

io.on('connection', (socket) => {
  // Send initial data to new connections
  socket.emit('update', countdownData);

  // Handle updates from the control view
  socket.on('update', (data) => {
    countdownData = data;
    io.emit('update', countdownData);
  });
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});