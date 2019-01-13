/*
 * Primary file for the API
 *
 */

//Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;  // is used to get the payload
const config = require('./lib/config');
const fs = require('fs'); // file system module
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');

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

// Instantiate the HTTP server
const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res);
});

// Start the http server (...and have it listen on port 3000 or config.httpPort)
httpServer.listen(config.httpPort, () => console.log('The server is listening on port '+config.httpPort) );

// Instantiate the HTTPS server; cert.pem and key.pem have to be read synchronously for that
const httpsServerOptions = {
  'key' : fs.readFileSync('./https/key.pem'),
  'cert' : fs.readFileSync('./https/cert.pem')
};
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {

});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, () => console.log('The server is listening on port '+config.httpsPort) );


// Unified server - server logic for both http and https servers; The server should respond with a string;
const unifiedServer = (req, res) => {
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
    let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    // Construct the data object to send to the handler
    let data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject' : queryStringObject,
      'method' : method,
      'headers' : headers,
      'payload' : helpers.parseJsonToObject(buffer)
    };

    // Route the request to the handler specified in the router
    chosenHandler(data, (statusCode, payload) => {
      // Use the status code called back by the handler, or default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      // Use the payload called back by the handler or default to an empty object
      payload = typeof(payload) == 'object' ? payload : {};

      // Convert the payload to a JSON string
      let payloadString = JSON.stringify(payload);

      // Return the response
      res.setHeader('Content-Type', 'application/json'); // tells browser that we're sending JSON
      res.writeHead(statusCode);
      res.end(payloadString);

      console.log('Returning this response: ',statusCode, payloadString);
    });

    // Send the response
    // res.end('Hello World\n') // \n stars a new line;  to call on CLI: curl localhost:3000

    // console.log('Request received on path: '+trimmedPath+ ' with method: '+method+'  and with these query string parameters: ', queryStringObject);
    // console.log('Request received with these headers: ', headers);
    // console.log('Request received with this payload: ', buffer);

  });
};

// Define a request router
let router = {
  'ping' : handlers.ping,
  'users' : handlers.users
};
