var io = require('socket.io-client');
var cookie = require('js-cookie');

var eddie = function(){

  var screenId = cookie.get('mstScreenId');
  var socket = io.connect();

  var eventListeners = [];

  socket.emit('mst-screen-load', {
    screenId : screenId
  });

  socket.on('mst-screen-loaded', function(data){
    screenId = data.screenId;
  });

  socket.on('mst-update', function(msg){
    var data = JSON.parse(msg);
    var eventListener = eventListeners.find(function(listener){
      return listener.event === data.event;
    });

    if(eventListener){
      eventListener.callbacks.forEach(function(callback){
        callback(data.data);
      });
    }
  });

  return {
    putLou: function(msg){
      msg.screenId = screenId;
      socket.emit('mst-message', JSON.stringify(msg));
    },
    register: function(event, callback){
      var msg = {
        screenId: screenId,
        event: event
      };

      var eventListener = eventListeners.find(function(listener){
        return listener.name === event;
      });

      if(!eventListener){
        eventListener = {
          event: event,
          callbacks: []
        };
        eventListeners.push(eventListener);
      }

      eventListener.callbacks.push(callback);

      socket.emit('mst-register', JSON.stringify(msg));
    }
  };
};

module.exports = eddie;
