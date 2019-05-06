/*
 * TLS server example
 *
 */

// Dependencies
const tls = require('tls');
const fs = require('fs');
const path = require('path');

// Server options
const options = {
  'key' : fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
  'cert' : fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
};

// Create the server
const server = tls.createServer(options, connection => {
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
server.listen(6000, () => {
  console.log('Listening on port 6000');
});
