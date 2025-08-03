const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
// const SerialPort = require('serialport');
const { SerialPort } = require('serialport');
// const Readline = require('@serialport/parser-readline');
const { ReadlineParser } = require('@serialport/parser-readline');

const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// ✅ Replace COM3 with your actual Arduino port (e.g., COM4, /dev/ttyUSB0 on Linux)
// const port = new SerialPort('COM4', { baudRate: 9600 });
const port = new SerialPort({
  path: 'COM4',
  baudRate: 9600
});

// const parser = port.pipe(new Readline({ delimiter: '\r\n' }));
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));


parser.on('data', (data) => {
  console.log('RFID Card ID:', data);
  io.emit('rfid', data); // Send to frontend
});

app.get('/', (req, res) => {
  res.send('RFID Server Running');
});

server.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
