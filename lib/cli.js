/*
 * CLI-related tasks
 *
 */

// Dependencies
const readline = require('readline');
const util = require('util');
const debug = util.debuglog('cli');

const events = require('events');
class _events extends events{};
const e = new _events();

// Isntantiate the CLI module object
const cli = {};

// Input processor
cli.processInput = (str) => {

  str = typeof(str) === 'string' && str.trim().length > 0 ? str.trim() : false;

  // Only process the input if the user actually wrote something. Otherwise - ignore
  if (str) {
    // Codify the unique strings that identify the unique questions allowed to be asked
    const uniqueInputs = [
      'man',
      'help',
      'exit',
      'stats',
      'list users',
      'more user info',
      'list checks',
      'more check info',
      'list logs',
      'more log info'
    ];

    // Go through the possible inputs and emit an event when a match is found
    let matchFound = false;
    let counter = 0;
    uniqueInputs.some((input) => {
      if (str.toLowerCase().indexOf(input) > -1) {
        matchFound = true;
        // Emit the event matching the unique input and include the full string given by the user
        e.emit(input, str);
        return true;
      };

    });

    // If no match is found, tell the user to try again
    if (!matchFound) {
      console.log('Sorry, try again');
    }
  }
};


// Init script
cli.init = () => {
  // Send the start message to the console in dark blue
  console.log('\x1b[34m%s\x1b[0m','The CLI is running');

  // Start the interface (it's possible to do this with repl, which does all that out-of-the-box)
  const _interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '>'
  });

  // Create an initial prompt
  _interface.prompt();

  // Handle each line of input separately (after user presses enter)
  _interface.on('line', (str) => {
    // Send to the input processer
    cli.processInput(str);

    // re-initialize the prompt afterwards
    _interface.prompt();

    // If the user stops the CLI, kill the associated process
    _interface.on('close', () => {
      process.exit(0);
    });
  });


};








// Export the module
module.exports = cli;
