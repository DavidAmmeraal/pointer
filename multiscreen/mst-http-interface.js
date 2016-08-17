/**
 * This is the HTTP interface to the MST app, not very sophisticated right now.
 */ 
var MSTHttpInterface = function(app){

  return function(req, res, next){
    var screenId;

    console.log(app.screenExists(req.cookies.mstScreenId));
    if(!req.cookies.mstScreenId || !app.screenExists(req.cookies.mstScreenId)){
      screenId = app.createScreen();
      res.cookie('mstScreenId', screenId);
    }else{
      screenId = req.cookies.mstScreenId;
    }
    next();
  };

};

module.exports = MSTHttpInterface;
