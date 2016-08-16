var io = require('socket.io-client');
var cookie = require('js-cookie');

/**
 * Single and only gateway for connecting to server. For quickness sake done through websockets now.
 * Future implementations could detect if websockets are supported, if not it should default to HTTP.
 *
 **/
var eddie = function(){

  //Connect to websocket
  var socket = io.connect();

  //This contains the listeners to the events we've subscribed to.
  var eventListeners = [];

  //The screenID, will be set after connecting to the server
  var screenId;

  //This attempts to connect to the server. Will resolve once connected.
  var connected = (function(){
    return new Promise(function(resolve, reject){
      socket.emit('mst-screen-load', {});
      socket.on('mst-screen-loaded', function(data){
        screenId = data.screenId;
        resolve();
      });
    });
  })();

  /**
   * When we receive an mst-update message, we know that we've received new data
   * for a listener. This callback will find the listener and send the new data.
   */
  socket.on('mst-update', function(msg){
    var data = JSON.parse(msg);

    //Let's see if there's a listener defined for the data.
    var eventListener = eventListeners.find(function(listener){
      return listener.event === data.event;
    });

    //If there's an event listener defined, call all the callbacks.
    if(eventListener){
      eventListener.callbacks.forEach(function(callback){
        callback(data.data);
      });
    }
  });

  return {
    //Function to send messages to the Multiscreen App from the client.
    putLou: function(msg){
      //We first need to wait for eddie to connect
      connected.then(function(){
        msg.screenId = screenId;
        /**
         * When we send a message of type mst-message, the server knows to
         * interpret this message as a message to the Multiscreen App. The
         * messages are received by multiscreen/mst-socket-interface.js
         */
        socket.emit('mst-message', JSON.stringify(msg));
      });
    },

    /**
     * This is where we register for events. All the events you can subscribe
     * to are listed in multiscreen/mst-app.js. You can subscribe to an event
     * type and pass along a callback that will be called when the event occurs.
     *
     * When the event occurs it's handled using the mst-update callback above.
     */
    register: function(event, callback){
      //We first need to wait for eddie to connect
      connected.then(function(){
        var msg = {
          screenId: screenId,
          event: event
        };

        //We check if there's already a container for this callback
        var eventListener = eventListeners.find(function(listener){
          return listener.name === event;
        });

        //If not, we create one.
        if(!eventListener){
          eventListener = {
            event: event,
            callbacks: []
          };
          eventListeners.push(eventListener);
        }

        //Add the callback to the list of all callbacks for this event.
        eventListener.callbacks.push(callback);

        //Send the event registration to the server!
        socket.emit('mst-register', JSON.stringify(msg));
      });
    }
  };
};

module.exports = eddie;
