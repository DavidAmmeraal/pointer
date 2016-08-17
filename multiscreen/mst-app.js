var Screen = require('./screen');
var Pointer = require('./pointer');
var chance = require('chance')();

/**
 * This is the actual multiscreen application. It exposes functions that change
 * the internal state of the application. A developer can call these functions
 * through a MSTInterface, like in this example: multiscreen/mst-http-interface
 * or multiscreen/mst-socket-interface
 *
 * A developer can also register to receive events about what changed in the
 * internal state of the program. In this example, the way domain model is
 * structured is rather simple in unsophisticated, but the way how an external
 * user interacts with the application is more important in the context of
 * this demo.
 */
var MSTApp = function() {

  //This contains all the screens in the application
  var screens = [];
  var pointers = [];

  /**
   * This is where all the listeners for the events are stored. A listener
   * should have a 'name' a 'serialize' function that returns the data we want
   * to send to the client and a 'callbacks' array, that contains all the
   * callbacks that should be called when the event is triggered.
   */
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

  /**
   * A private function that can be called within the app. This will trigger
   * the callback calls for the listeners of this event, it will call the
   * callback with the data returned from the listeners serialize() function.
   */
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
   * Functions that app exposes to outside world, internal state is not
   * directly reachable.
   *
   * Some things should be separated into a seperate reusable app structure,
   * such as the generic addScreen and createScreen functions. movePointer is a
   * function that's specific to this application!
   *
   */

  return {
    /**
     * Moves a Pointer to new coordinates. After this is done calls the update()
     * for the 'pointersChanged' event. All the listeners to this event will be
     * updated with the new data (either through HTTP or Websocket)
     */
    movePointer: function(screenId, args) {
      console.log("movePointer( " + screenId + ")");

      //Find the screen in the list of screens
      var screen = screens.find(function(screen){
        return screen.getId() === screenId;
      });

      //Find the pointer for this screen.
      var pointer = pointers.find(function(pointer){
        if(pointer.getScreen()){
          return pointer.getScreen().getId() === screen.getId();
        }
      });

      //If it doesn't exist, we create a new pointer
      if(!pointer){
        pointer = new Pointer(screen);
        pointers.push(pointer);
      }

      //We change the coordinates of the pointer
      pointer.setXY.apply(pointer, args);

      //We call the update() function for the 'pointersChanged' event.
      update('pointersChanged');
    },
    /**
     * Creates a new Screen. Should be called when the client is initialised.
     * Returns the ID of this new screen, so the client can pass this in future
     * requests.
     */
    createScreen: function() {
      var screen = new Screen();
      screens.push(screen);
      return screen.getId();
    },
    /**
     * Destroy the listeners that where created by this screen. Remove from
     * list of screens. Should be called when the client exits, or the
     * connection is lost.
     *
     * The current demo doesn't rebuild screens when a connection is picked
     * back up again.
     */
    destroyScreen: function(screenId){
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

      /**
       * This should be more sophisticated. You want to subscribe events
       * to application lifecycle events I guess. Right now this is more or less
       * hardcoded.
       */
      update('pointersChanged');
    },
    /**
     * Checks wether a screen for the given screenId exists.
     */
    screenExists: function(screenId){
      return !!screens.find(function(screen){
        return screen.getId() === screenId;
      });
    },
    /**
     * This is where the client can events to events. The pass their screenId,
     * name of the event and the callback to be called when the event occurs.
     *
     * The callback will be added to the callbacks array for the listener of the
     * specified event.
     */
    register: function(screenId, event, callback){
      var listener = listeners.find(function(listener){
        return listener.name === event;
      });

      var screenCallback = listener.callbacks.find(function(callback){
        return callback.screenId === screenId;
      });

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
    /**
     * This is where the client can unsubscribe from events. 
     */
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
