/**
 * This is file where the express application is started. Express is a
 * "Fast, unopinionated, minimalist web framework for Node.js"
 * (https://expressjs.com).
 *
 * In here we couple the Multiscreen Application to either the HTTP or
 * websocket, and configure the HTTP/Websocket server. The actual
 * initialization of the server is done in /bin/www
 *
 * The routes (how a specific requrest to URL is handled) are configured in
 * routes/index.js
 *
 * We use handlebars (extension of mustache) as the templating engine.
 */

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs  = require('express-handlebars');

var MSTApp = require('./multiscreen/mst-app.js');
var MSTHttpInterface = require('./multiscreen/mst-http-interface');
var MSTSocketInterface = require('./multiscreen/mst-socket-interface');

var routes = require('./routes/index');
var users = require('./routes/user');

var app = express();

//This is where the Multiscreen App is initialized
var mstApp = MSTApp();

//This is where we attach the websocket handler to the Express app
var socketIO = require('socket.io');
var io = socketIO();
app.io = io;

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

// view engine setup, in this case we use handlebars.
// used mainly for initial page load in this example.
app.engine('handlebars', exphbs({
  defaultLayout: 'main',
  partialsDir: ['views/partials/']
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

// app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());

/**
 * We could bind the MSTHttpInterface as a middleware to Express. But for the
 * purpose of the demo, we only use the websocket interface right now.
 * Developing both would be too complex in the limited time available
 */
//app.use(MSTHttpInterface(mstApp));

//This is where the static files are served from
app.use(express.static(path.join(__dirname, 'public')));

//The default routes are handled by routes/index.js
app.use('/', routes);

/**
 * Here we overwrite the /users route, so that it redirects to something else.
 * You could couple this to another usermanager.
 */
app.use('/users', users);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            title: 'error'
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err,
        title: 'error'
    });
});

/**
 * When a websocket connection is initialized handle it through
 * multiscreen/mst-socket-interface.js
 */
io.on('connection', MSTSocketInterface(mstApp));

module.exports = app;
