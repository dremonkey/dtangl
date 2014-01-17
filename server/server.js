'use strict';

/**
 * Module dependencies
 */

require('express-namespace');

var
  _ = require('lodash'),
  config = require('./config'),
  express = require('express'),
  app = express();


/** 
 * Bootstrap the database connection
 */
if (config.mongo) require('./dbconnect.js')(config.mongo);


/**
 * set up Poet
 */
// var poet = require('poet')(app);
// poet.init().then(function () {
  // initialized
// });

// set views directory for templates
app.set('views', config.dirs.views);

app.use(express.logger('dev')); // log requests to the console
app.use(express.bodyParser()); // extract data from the body of the request
app.use(express.methodOverride());

// livereload middleware to insert livereload script snippet if not production
if ('local' === app.get('env') || 'development' === app.get('env')) {
  console.log('Adding livereload script, configured to port ' + config.ports.liveReload);
  var lr = require('connect-livereload')({
    port: config.ports.liveReload
  });
  lr.middlewarePriority = -1;
  app.use(lr);
}

// Set the directory(s) that express should serve static files from
if (config.dirs.static) {
  var
    staticDir = _.isString(config.dirs.static) ? [config.dirs.static] : config.dirs.static,
    maxAge = 30 * 24 * 60 * 60 * 1000; // 30 day cache control in milliseconds 
  for (var i = staticDir.length - 1; i >= 0; i--) {
    app.use(express.static(staticDir[i], {maxAge: maxAge}));
  }
}

// A standard error handler - picks up any left over errors and returns a nicely formatted server 500 error
app.use(express.errorHandler());


/**
 * Bootstrap Routes
 * ex. require('./app/example/routes')(app);
 */
require('./api/clever/proxy')(app);


// Default response for missing api requests
app.get('/api/*', function (req, res) {
  res.json({'error': 'Endpoint does not exist.'});
});

// Forward missing files to index
app.all('/*', function (req, res) {
  res.sendfile('index.html', {root: app.get('views')});
});


/**
 * Start Server * Only for Production * Local is handled by Grunt
 */
if ('production' === app.get('env')) {
  var http = require('http');
  app.set('port', process.env.PORT || config.ports.http);
  http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
  });
}


// expose app
module.exports = app;
