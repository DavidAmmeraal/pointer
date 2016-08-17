var express = require('express');
var router = express.Router();

/* GET home page. */

//This is for the presenter screen.
router.get(['/', '/presenter'], function(req, res) {
  /**
   * Renders the HTML for the page using handlebars. You can see the template in
   * views/index.handlebars.
   *
   * First argument specifies which view to render. Second argument specifies
   * the data you want to pass along. Second argument also specifies which
   * javascript to load for this page. Because all scripts are bundled into a
   * single file we only need to load this single script.
   */
  res.render('index', { title: 'Spatial Spotting', scripts: ['/js/presenter.js']});
});

router.get('/trackpad', function(req, res){
  /**
   * Template can be found in views/trackpad.handlebars.
   */
  res.render('trackpad', { title: 'Trackpad', scripts: ['/js/trackpad.js']});
});

module.exports = router;
