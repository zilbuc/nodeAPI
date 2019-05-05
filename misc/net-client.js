/*
 * TCP (net) client example
 *
 */

// Dependencies
const net = require('net');

// Define the message to send
const outboundMessage = 'ping';

// Create the client
const client = net.createConnection({ 'port' : 6000 }, () => {
  // Send the message
  client.write(outboundMessage);
});

// Log out what server writes back, then kill the client
client.on('data', inboundMessage => {
  const messageString = inboundMessage.toString();
  console.log('I wrote '+outboundMessage+' and they said '+messageString);
  client.end();
});
