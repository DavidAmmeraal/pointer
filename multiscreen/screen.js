var chance = require('chance')();

var Screen = function(updater){
  var id = chance.guid();

  return {
    getId: function(){
      return id;
    },
    update: function(msg){
      updater.send(msg);
    }
  };
};

module.exports = Screen;
