var Eddie = require('./eddie');
var jQuery = require('jquery');

var eddie = new Eddie();

var trackingWrapper = jQuery('.tracking-image');
var trackingImage = trackingWrapper.find('img');
var pointers = {};

/**
 * Here we register for an event, the function that is the second argument
 * is the callback that will be invoked when the event is triggered on the
 * server side.
 */
eddie.register('pointersChanged', function(data){

  var rect = trackingImage[0].getBoundingClientRect();

  data.forEach(function(dataPoint){

    var pointer = pointers[dataPoint.screenId];
    if(!pointer){
      pointer = jQuery('<div class="pointer"></div>');
      trackingWrapper.append(pointer);
      pointers[dataPoint.screenId] = pointer;
    }

    var x = rect.left + (rect.right - rect.left) / 100 * dataPoint.x;
    var y = rect.top + (rect.bottom - rect.top) / 100 * dataPoint.y;
    pointer.css('transform', 'translate(' + x + 'px,' + y + 'px)');
  });
});
