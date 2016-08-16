var chance = require('chance');

var MSTSocketInterface = function(app){

  return function(socket){

    var screenId;
    socket.on('mst-message', function(message){
      var data = JSON.parse(message);
      var method = data.method;
      var screenId = data.screenId;
      var args = data.args;

      if(typeof app[method] === "function"){
        app[method].apply(app, [screenId, args]);
      }

    });

    socket.on('mst-screen-load', function(message){
      screenId = message.screenId;
      if(app.screenExists(screenId)){
        app.loadScreen(screenId);
      }else{
        screenId = app.createScreen();
      }
      socket.emit('mst-screen-loaded', {
        screenId: screenId
      });
    });

    socket.on('disconnect', function(){
      app.destroyScreen(screenId);
    });

    socket.on('mst-register', function(message){
      var data = JSON.parse(message);
      app.register(data.screenId, data.event, function(data){
        socket.emit('mst-update', data);
      });
    });

  };
};

module.exports = MSTSocketInterface;
