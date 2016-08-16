var Scene = function(screen){
  var pointers = [], background;

  return {
    getPointers: function(){
      return pointers;
    },
    getBackground: function(){
      return background;
    },
    addPointer: function(pointer){
      pointers = pointers.concat([pointer]);
    },
    getScreen: function(){
      return screen;
    }
  };
};
