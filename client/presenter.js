var Eddie = require('./eddie');
var jQuery = require('jquery');

var eddie = new Eddie();

var trackingWrapper = jQuery('.tracking-image');
var trackingImage = trackingWrapper.find('img');
var pointers = {};


eddie.register('pointersChanged', function(data){

  var rect = trackingImage[0].getBoundingClientRect();

  data.forEach(function(dataPoint){

    var pointer = pointers[dataPoint.screenId];
    if(!pointer){
      pointer = jQuery('<div class="pointer"></div>');
      trackingWrapper.append(pointer);
      pointers[dataPoint.screenId] = pointer;
    }

    var x = (rect.right - rect.left) / 100 * dataPoint.x;
    var y = (rect.bottom - rect.top) / 100 * dataPoint.y;
    pointer.css('transform', 'translate(' + x + 'px,' + y + 'px)');
  });
});
