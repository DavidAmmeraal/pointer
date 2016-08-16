var express = require('express');
var router = express.Router();

/* GET home page. */

router.get(['/', '/presenter'], function(req, res) {
  res.render('index', { title: 'Spatial Spotting', scripts: ['/js/presenter.js']});
});

router.get('/trackpad', function(req, res){
  res.render('trackpad', { title: 'Trackpad', scripts: ['/js/trackpad.js']});
});

module.exports = router;
