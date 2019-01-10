/*
 * Primary file for the API
 *
 */

//Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;  // used to get the payload

// The server should respond with a string
const server = http.createServer((req, res) => {

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
      'payload' : buffer
    };

    // Route the request to the handler specified in the router
    chosenHandler(data, (statusCode, payload) => {
      // Use the status code called back by the handler, or default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      // Use the payload called back by the handler or default to an empty object
      payload = typeof(payload) == 'object' ? payload : {};

      // Convert the payload to a string
      let payloadString = JSON.stringify(payload);

      // Return the response
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
});

// Start the server and have it listen on port 3000
server.listen(3000, () => console.log('The server is listening on port 3000 now') );

// Define the handlers
let handlers = {};

// Sample handler
handlers.sample = (data, callback) => {
  // Callback a http status code and a payload object
  callback(406, {'name' : 'sample handler'})
};

// 'Not found' handler
handlers.notFound = (data, callback) => {
  callback(404);  // no payload
};

// Define a request router
let router = {
  'sample' : handlers.sample
};
