/*
 * TCP (net) server example
 *
 */

// Dependencies
const net = require('net');

// Create the server
const server = net.createServer(connection => {
  // Send the word 'pong'
  const outboundMessage = 'pong';
  connection.write(outboundMessage);

  // Log out the messages when client writes something
  connection.on('data', inboundMessage => {
    const messageString = inboundMessage.toString();
    console.log('I wrote '+outboundMessage+' and they said '+inboundMessage);
  });
});

// Listen on port 6000
server.listen(6000);
