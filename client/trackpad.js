/**
 * Client side implementation for the trackpad screen. Off course this should
 * chopped up into components, but to keep it simple I've kept it in this single
 * file for now.
 */
var Eddie = require('./eddie');
var jQuery = require('jquery');

var eddie = new Eddie();

var trackpad = jQuery('.trackpad');
var trackingImage = trackpad.find('img');
var trackingImageWidth = trackingImage.width();
var trackingImageHeight = trackingImage.height();
var tracking = false;

trackingImage.on('mousedown touchstart', function(event){
  tracking = true;
  event.preventDefault();
});

trackingImage.on('mouseup touchend mouseleave', function(event){
  tracking = false;
  event.preventDefault();
});

jQuery(window).on('resize', function(){
  trackingImageWidth = trackingImage.width();
  trackingImageHeight = trackingImage.height();
});

trackingImage.on('mousemove', function(event){
  event.preventDefault();

   if(tracking){
      var rect = trackingImage[0].getBoundingClientRect();
      var x = event.offsetX / (rect.right - rect.left) * 100;
      var y = event.offsetY / (rect.bottom - rect.top) * 100;

      var msg = {
        method: 'movePointer',
        args: [x, y]
      };
      /**
       * Send the message to the server, doesn't know what transport protocol
       * is used. This is handled by eddie.
       */
      eddie.putLou(msg);
  }
});

trackingImage.on('touchmove', function(event){
  if(tracking){
    var rect = trackingImage[0].getBoundingClientRect();

    for (var i = 0; i < event.touches.length; i++) {
      var touch = event.touches[i];
      var x = (touch.pageX - rect.left) / (rect.right - rect.left) * 100;
      var y = (touch.pageY - rect.top) / (rect.bottom - rect.top) * 100;
      var msg = {
        method: 'movePointer',
        args: [x, y]
      };
      eddie.putLou(msg);
    }
  }
});
