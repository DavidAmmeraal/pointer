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
