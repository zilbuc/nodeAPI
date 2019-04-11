/*
 * CLI-related tasks
 *
 */

// Dependencies
const readline = require('readline');
const util = require('util');
const debug = util.debuglog('cli');
const os = require('os');
const v8 = require('v8');

const events = require('events');
class _events extends events{};
const e = new _events();

// Isntantiate the CLI module object
const cli = {};


// Input handlers
e.on('man', (str) => {
  cli.responders.help();
});

e.on('help', (str) => {
  cli.responders.help();
});

e.on('exit', (str) => {
  cli.responders.exit();
});

e.on('stats', (str) => {
  cli.responders.stats();
});

e.on('list users', (str) => {
  cli.responders.listUsers();
});

e.on('more user info', (str) => {
  cli.responders.moreUserInfo(str);
});

e.on('list checks', (str) => {
  cli.responders.listChecks(str);
});

e.on('more check info', (str) => {
  cli.responders.moreCheckInfo(str);
});

e.on('list logs', (str) => {
  cli.responders.listLogs();
});

e.on('more log info', (str) => {
  cli.responders.moreLogInfo(str);
});


// Responders object
cli.responders = {};

// Help / Man
cli.responders.help = () => {

  // Codify the commands and their explanations
  const commands = {
    'exit' : 'Kill the CLI (and the rest of the application)',
    'man' : 'Show this help page',
    'help' : 'Alias of the "man" command',
    'stats' : 'Get statistics on the underlying operating system and resource utilization',
    'List users' : 'Show a list of all the registered (undeleted) users in the system',
    'More user info --{userId}' : 'Show details of a specified user',
    'List checks --up --down' : 'Show a list of all the active checks in the system, including their state. The "--up" and "--down flags are both optional."',
    'More check info --{checkId}' : 'Show details of a specified check',
    'List logs' : 'Show a list of all the log files available to be read (compressed and uncompressed)',
    'More log info --{logFileName}' : 'Show details of a specified log file',
  };

  // Show a header for the help page that is as wide as a screen
  cli.horizontalLine();
  cli.centered('CLI MANUAL');
  cli.horizontalLine();
  cli.verticalSpace(2);

  // Show each command, followed by it's explanation in white and yellow respectively
  for (let key in commands) {
    if (commands.hasOwnProperty(key)) {
      let value = commands[key];
      let line = '\x1b[33m' + key + '\x1b[0m';
      let padding = 60 - line.length;
      for (let i = 0; i < padding; i++) {
        line+=' ';
      }
      line+=value;
      console.log(line);
      cli.verticalSpace(1);
    }
  }

  cli.verticalSpace(1);

  // End with another horizontal line
  cli.horizontalLine();

};

// Create a vertical space
cli.verticalSpace = (lines) => {
  lines = typeof(lines) === 'number' && lines > 0 ? lines : 1;
  for (let i = 0; i < lines; i++) {
    console.log('');
  }
};

// Create a horizontal line across the screen
cli.horizontalLine = () => {
  // Get the available screen size
  const width = process.stdout.columns;

  let line = '';
  for (let i = 0; i < width; i++) {
    line+='-';
  }
  console.log(line);

}

// Create centered text on the screen
cli.centered = (str) => {
  str = typeof(str) === 'string' && str.trim().length > 0 ? str.trim() : '';

  // Get the available s creen size
  const width = process.stdout.columns;

  // Calculate the left padding
  const leftPadding = Math.floor((width - str.length) / 2);

  // Put in left padded spaces before the string itself
  let line = '';
  for (let i = 0; i < leftPadding; i++) {
    line+=' ';
  }
  line+=str;
  console.log(line);
}

// Exit
cli.responders.exit = () => {
  process.exit(0);
};

// Stats
cli.responders.stats = () => {
  // Compile an object of stats
  const stats = {
    'Load Average' : os.loadavg().join(' '),
    'CPU Count' : os.cpus().length,
    'Free Memory' : os.freemem(),
    'Current Malloced Memory' : v8.getHeapStatistics().malloced_memory,
    'Peak Malloced Memory' : v8.getHeapStatistics().peak_malloced_memory,
    'Allocated Heap Used (%)' : Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
    'Available Heap Allocated (%)' : Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100),
    'Uptime' : os.uptime()+' Seconds'
  };

  // Create a header for the stats 
  cli.horizontalLine();
  cli.centered('SYSTEM STATISTICS');
  cli.horizontalLine();
  cli.verticalSpace(2);

  // Log each stat
  for (let key in stats) {
    if (stats.hasOwnProperty(key)) {
      let value = stats[key];
      let line = '\x1b[33m' + key + '\x1b[0m';
      let padding = 60 - line.length;
      for (let i = 0; i < padding; i++) {
        line+=' ';
      }
      line+=value;
      console.log(line);
      cli.verticalSpace(1);
    }
  }

  cli.verticalSpace(1);

  // End with another horizontal line
  cli.horizontalLine();

};

// List users
cli.responders.listUsers = () => {
  console.log('You asked to list users');
};

// More user info
cli.responders.moreUserInfo = (str) => {
  console.log('You asked for more user info', str);
};

// List checks
cli.responders.listChecks = (str) => {
  console.log('You asked to list checks', str);
};

// More check info
cli.responders.moreCheckInfo = (str) => {
  console.log('You asked for more check info', str);
};

// List logs
cli.responders.listLogs = () => {
  console.log('You asked to list logs');
};

// More logs info
cli.responders.moreLogInfo = (str) => {
  console.log('You asked for more log info', str);
};


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
