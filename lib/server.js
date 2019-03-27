/*
 * Server-related tasks
 *
 */

//Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;  // is used to get the payload
const config = require('./config');
const fs = require('fs'); // file system module
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');
const util = require('util');
const debug = util.debuglog('server'); // NODE_DEBUG=server node index.js


// Testing CRUD:
// var _data = require('./lib/data');
// TESTING @TODO delete this
// _data.create('test', 'newFile', {'foo' : 'bar'}, (err) => {
//   console.log('this was the error:', err);
// });
// _data.read('test', 'newFile', (err, data) => {
//   console.log('this was the error:', err, '\n', 'this was the data:', data);
// });
// _data.update('test', 'newFile', {'fizz' : 'buzz'}, (err) => {
//   console.log('this was the error:', err);
// });
// _data.delete('test', 'newFile', (err) => {
//   console.log('this was the error:', err);
// });

// Testing Twilio:
// helpers.sendTwilioSms('4158375309', 'Hello!', (err) => {
//   console.log('This was the error: ', err);
// });

// Instantiate the server module object
const server = {};

// Instantiate the HTTP server
server.httpServer = http.createServer((req, res) => {
  server.unifiedServer(req, res);
});

// Instantiate the HTTPS server; cert.pem and key.pem have to be read synchronously for that
server.httpsServerOptions = {
  'key' : fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
  'cert' : fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
};
server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
  server.unifiedServer(req, res);
});

// Unified server - server logic for both http and https servers; The server should respond with a string;
server.unifiedServer = (req, res) => {
  // Get the URL and parse it
  let parsedUrl = url.parse(req.url, true);  // `true` calls query module; this allows parsedUrl.query

  // Get the path
  let path = parsedUrl.pathname; // pathname (a key for parsedUrl object) is untrimmed path that the user requested
  let trimmedPath = path.replace(/^\/+|\/+$/g, '') // trimming slashes from the path front and end

  // Get the query string as an object
  let queryStringObject = parsedUrl.query;

  // Get the HTTP Method
  let method = req.method.toLowerCase();

  // Get the headers as an object
  let headers = req.headers;

  // Get the payload, if any (payload comes in streams)
  let decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', (data) => {       // on data event callback function adds the stream to buffer
    buffer += decoder.write(data);
  });
  req.on('end', () => {            // .on('end') is called even if there's no payload and .on('data') was not invoked
    buffer += decoder.end();

    // Choose the handler this request should go to. if one is not found, use notFound
    let chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

    // If the request is within the public directory, use the public handler instead
    chosenHandler = trimmedPath.indexOf('public/') > -1 ? handlers.public : chosenHandler;

    // Construct the data object to send to the handler
    let data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject' : queryStringObject,
      'method' : method,
      'headers' : headers,
      'payload' : helpers.parseJsonToObject(buffer)
    };

    // Route the request to the handler specified in the router
    chosenHandler(data, (statusCode, payload, contentType) => {

      // Determine the type of response (fallback to JSON)
      contentType = typeof(contentType) === 'string' ? contentType : 'json';

      // Use the status code called back by the handler, or default to 200
      statusCode = typeof(statusCode) === 'number' ? statusCode : 200;

      // Return the response parts that are content-specific
      let payloadString = '';

      if (contentType === 'json') {
        res.setHeader('Content-Type', 'application/json'); // tells browser that we're sending JSON

        // Use the payload called back by the handler or default to an empty object
        payload = typeof(payload) === 'object' ? payload : {};

        // Convert the payload to a JSON string
        payloadString = JSON.stringify(payload);
      }

      if (contentType === 'html') {
        res.setHeader('Content-Type', 'text/html');
        payloadString = typeof(payload) === 'string' ? payload : '';
      }
      if (contentType === 'favicon') {
        res.setHeader('Content-Type', 'image/x-icon');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
      }
      if (contentType === 'css') {
        res.setHeader('Content-Type', 'text/css');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
      }
      if (contentType === 'png') {
        res.setHeader('Content-Type', 'image/png');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
      }
      if (contentType === 'jpg') {
        res.setHeader('Content-Type', 'image/jpeg');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
      }
      if (contentType === 'plain') {
        res.setHeader('Content-Type', 'text/plain');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
      }


      // Return the response-parts that are common to all content-types
      res.writeHead(statusCode);
      res.end(payloadString);

      // If the response is 200, print green, otherwise print red
      if (statusCode === 200) {
        debug('\x1b[32m%s\x1b[0m', method.toUpperCase()+'/'+trimmedPath+' '+statusCode);
      } else {
        debug('\x1b[31m%s\x1b[0m', method.toUpperCase()+'/'+trimmedPath+' '+statusCode);
      }
    });

    // Send the response
    // res.end('Hello World\n') // \n stars a new line;  to call on CLI: curl localhost:3000

    // console.log('Request received on path: '+trimmedPath+ ' with method: '+method+'  and with these query string parameters: ', queryStringObject);
    // console.log('Request received with these headers: ', headers);
    // console.log('Request received with this payload: ', buffer);

  });
};

// Define a request router
server.router = {
  '' : handlers.index,
  'account/create' : handlers.accountCreate,
  'account/edit' : handlers.accountEdit,
  'account/deleted' : handlers.accountDeleted,
  'session/create' : handlers.sessionCreate,
  'session/deleted' : handlers.sessionDeleted,
  'checks/all' : handlers.checksList,
  'checks/create' : handlers.checksCreate,
  'checks/edit' : handlers.checksEdit,
  'ping' : handlers.ping,
  'api/users' : handlers.users,
  'api/tokens' : handlers.tokens,
  'api/checks' : handlers.checks,
  'favicon.ico' : handlers.favicon,
  'public' : handlers.public
};

// Init script
server.init = () => {
  // Start the http server (...and have it listen on port 3000 or config.httpPort)
  server.httpServer.listen(config.httpPort, () => {
    console.log('\x1b[36m%s\x1b[0m','The server is listening on port '+config.httpPort);

  });

  // Start the HTTPS server
  server.httpsServer.listen(config.httpsPort, () => {
    console.log('\x1b[35m%s\x1b[0m','The server is listening on port '+config.httpsPort);
  });
};

// Export the module
module.exports = server;
