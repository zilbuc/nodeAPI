/*
 * UDP server example
 *
 */

// Dependencies
const dgram = require('dgram');

// Create a server
const server = dgram.createSocket('udp4');

server.on('message', (messageBuffer, sender) => {
  const messageString = messageBuffer.toString();
  console.log(messageString);
});

// Bind to port 6000
server.bind(6000);
