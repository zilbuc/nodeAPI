/*
 * UDP server example
 *
 */

// Dependencies
const dgram = require('dgram');

// Create a server
const client = dgram.createSocket('udp4');

// Define a message and pull it into a buffer
const messageString = 'This is a message';
const messageBuffer = Buffer.from(messageString);

// Send the message
client.send(messageBuffer, 6000, 'localhost', err => {
  client.close();
});
