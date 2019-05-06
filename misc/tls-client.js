/*
 * TLS client example
 *
 */

// Dependencies
const tls = require('tls');
const fs = require('fs');
const path = require('path');

// Server options (only needed when SSL certificate is self-signed)
const options = {
  'ca' : fs.readFileSync(path.join(__dirname,'/../https/cert.pem')),
  checkServerIdentity: () => { return null; }
};

// Define the message to send
const outboundMessage = 'ping';

// Create the client
const client = tls.connect(6000, options, () => {
  // Send the message
  client.write(outboundMessage);
});

// Log out what server writes back, then kill the client
client.on('data', inboundMessage => {
  const messageString = inboundMessage.toString();
  console.log('I wrote '+outboundMessage+' and they said '+messageString);
  client.end();
});
