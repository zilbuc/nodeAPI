/*
 * Primary file for the debug testing
 *
 */

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');
const exampleDebuggingProblem = require('./lib/exampleDebuggingProblem');

// Declare the app
const app ={};

// Init function
app.init = () => {
  // Start the server
  debugger;
  server.init();
  debugger;

  // Start the workers
  debugger;
  workers.init();
  debugger;

  // Start the CLI, but make sure it starts last
  debugger;
  setTimeout(() => {
    cli.init();
    debugger;
  }, 50);
  debugger;

  // Set foo at 1
  let foo = 1;
  console.log('Just assigne 1 to foo');
  debugger;
  // Increment foo
  foo++;
  console.log('Just incremented foo');
  debugger;
  // Square foo
  foo = foo * foo;
  console.log('Just squared foo');
  debugger;
  // Convert foo to a string
  foo = foo.toString();
  console.log('Just converted foo to string');
  debugger;
  // Call the init script that will throw
  exampleDebuggingProblem.init();
  console.log('Just called the library');
  debugger;
};

// Execute
app.init();

// Export the app
module.exports = app;
