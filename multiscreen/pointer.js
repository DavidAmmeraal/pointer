/**
 * Simple model for a pointer, has an X and Y coordinate, and knows to what
 * screen it belongs.
 */
var Pointer = function(screen){

  var x = 0, y = 0;

  return {
    getScreen: function(){
      return screen;
    },
    getXY: function(){
      return {x: x, y: y};
    },
    setXY: function(newX, newY){
      x = newX;
      y = newY;
    },
    //Makes the model a simple object that can JSONified
    toObject: function(){
      return {
        x: x,
        y: y,
        screenId: screen.getId()
      };
    }
  };
};

module.exports = Pointer;
