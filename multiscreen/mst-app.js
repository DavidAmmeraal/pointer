var Screen = require('./screen');
var Pointer = require('./pointer');
var chance = require('chance')();

var MSTApp = function() {

  //This contains all the screens in the application
  var screens = [];
  var pointers = [];

  var listeners = [
    {
      name: 'pointersChanged',
      serialize: function(){
        return pointers.map(function(pointer){
          return pointer.toObject();
        });
      },
      callbacks: []
    }
  ];

  function update(event){
    var listener = listeners.find(function(listener){
      return listener.name === event;
    });

    listener.callbacks.forEach(function(callback){
      var data = listener.serialize();
      var msg = {
        event: event,
        data: data
      };
      callback.fn(JSON.stringify(msg));
    });
  }

  /*
   * Functions that app exposes to outside world, internal state is not known!
   * Some things should be separated into a seperate reusabled app structure,
   * such as the generic addScreen and createScreen functions. movePointer is a
   * function that's specific to this application!
   *
   */

  return {
    movePointer: function(screenId, args) {
      console.log("movePointer( " + screenId + ")");
      var screen = screens.find(function(screen){
        return screen.getId() === screenId;
      });

      var pointer = pointers.find(function(pointer){
        if(pointer.getScreen()){
          return pointer.getScreen().getId() === screen.getId();
        }
      });

      if(!pointer){
        pointer = new Pointer(screen);
        pointers.push(pointer);
      }

      pointer.setXY.apply(pointer, args);

      update('pointersChanged');
    },
    createScreen: function() {
      console.log("createScreen()");
      var screen = new Screen();
      screens.push(screen);
      return screen.getId();
    },
    destroyScreen: function(screenId){
      console.log("destroyScreen(" + screenId + ")");
      var screen = screens.find(function(screen){
        return screen.getId() === screenId;
      });
      screens.splice(screens.indexOf(screen), 1);

      listeners.forEach(function(listener){
        var callbacksToRemove = [];
        listener.callbacks.forEach(function(callback){
          if(callback.screenId === screenId){
            callbacksToRemove.push(callback);
          }

          callbacksToRemove.forEach(function(callback){
            listener.callbacks.splice(listener.callbacks.indexOf(callback), 1);
          });
        });
      });

      pointers = pointers.filter(function(pointer){
        return pointer.getScreen() && pointer.getScreen().getId() !== screenId;
      });

      console.log("POINTERS ", pointers);

      update('pointersChanged');
    },
    screenExists: function(screenId){
      return !!screens.find(function(screen){
        return screen.getId() === screenId;
      });
    },
    register: function(screenId, event, callback){
      var listener = listeners.find(function(listener){
        return listener.name === event;
      });

      var screenCallback = listener.callbacks.find(function(callback){
        return callback.screenId === screenId;
      });

      console.log("screenID = " + screenId);

      if(!screenCallback){
        screenCallback = {
          screenId: screenId,
          id: chance.guid(),
          fn: callback
        };
        listener.callbacks.push(screenCallback);
      }else{
        screenCallback.fn = callback;
      }
      return screenCallback.id;
    },
    unregister: function(screenId, event, callbackId){
      var listener = listeners.find(event, function(listener){
        return listener.name === event;
      });

      var callback = listener.callbacks.find(function(callback){
        return callback.id === callbackId && callback.screenId === screenId;
      });

      listener.callbacks.splice(listener.callbacks.indexOf(callback), 1);
    }
  };
};

module.exports = MSTApp;
