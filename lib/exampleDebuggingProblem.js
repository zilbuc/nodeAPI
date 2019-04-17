/*
 * Library that demonstrates something throwing when it's init() is called
 *
 */

// Container for the module
const example = {};

// Init function
example.init = () => {
  // This is an intentionally created error (bar is not defined)
  const foo = bar;
};






// Export the module
module.exports = example;
