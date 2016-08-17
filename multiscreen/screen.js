var chance = require('chance')();

/**
 * Simple model for a Screen. Only has an ID. Could include some simple
 * things such as parameters or whatever. Don't store too much on the screen
 * I'd suggest, otherwise it becomes hard to discern it's responsibility.
 */
var Screen = function(){
  var id = chance.guid();

  return {
    getId: function(){
      return id;
    }
  };
};

module.exports = Screen;
