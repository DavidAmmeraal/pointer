var chance = require('chance');

/**
 * This is the websocket interface to the MST App. It can be bound to socketIO.
 * It defines the following message types:
 *
 * - 'mst-message': Can be used to call a function on the multiscreen app.
 * - 'mst-screen-load': Used to indicate that a new screen is loaded in the
 *                      Multiscreen App. Will redirect to createScreen()
 * - 'mst-register': For registering to Multiscreen App events.
 *
 */
var MSTSocketInterface = function(app){

  /**
   * This is the function that will be used as the callback for
   * io.on('connection', new MSTSocketInterface(app))
   *
   * When a new connection is made, it will create a new socket for
   * this screen.
   */
  return function(socket){

    //The screen this socket is interacting with
    var screenId;

    /**
     * Called when the screen loads. Calls the createScreen() function on the
     * MST app if it doesn't exist yet, otherwise it should rebuild the screen
     * (doesn't work yet)
     */
    socket.on('mst-screen-load', function(message){
      //Check if the message has a screenId
      screenId = message.screenId;
      //If it is, rebuild the screen (doesn't work yet)
      if(app.screenExists(screenId)){
        app.loadScreen(screenId);
      //Otherwise, create a new screen
      }else{
        screenId = app.createScreen();
      }
      //Emit the mst-screen-loaded message to the client with the new screenId
      socket.emit('mst-screen-loaded', {
        screenId: screenId
      });
    });

    //Callback for when the socket interface receives a 'mst-message'.
    socket.on('mst-message', function(message){
      //It will parse the message (not really necessary I think)
      var data = JSON.parse(message);
      //The method we will call on the MST App
      var method = data.method;
      //The ID of the screen that is calling the method
      var screenId = data.screenId;
      //The arguments for the methoc
      var args = data.args;

      //Check if the function exists, if it does, call it, no error handling yet
      if(typeof app[method] === "function"){
        app[method].apply(app, [screenId, args]);
      }

    });

    /**
     * When a socket connection drops, the screen should go into a dormant
     * state. Right now it just destroys the screen for simplicities sake.
     */
    socket.on('disconnect', function(){
      app.destroyScreen(screenId);
    });

    /**
     * When a client wants to register to MSTApp event, he should send a message
     * of the type 'mst-register'. These message will register the event on the
     * MST app. 
     */
    socket.on('mst-register', function(message){
      var data = JSON.parse(message);
      app.register(data.screenId, data.event, function(data){
        socket.emit('mst-update', data);
      });
    });

  };
};

module.exports = MSTSocketInterface;
