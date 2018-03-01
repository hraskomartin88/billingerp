/**
 * Module dependencies
 */

var express = require('express'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  errorHandler = require('errorhandler'),
  morgan = require('morgan'),
  routes = require('./routes'),
  api = require('./routes/api'),
  http = require('http'),
  path = require('path'),
  favicon = require('serve-favicon'),
  compression = require('compression'),
  multer = require('multer');
  moment_de = require('moment');
  moment_en = require('moment');

moment_de.locale("de");
moment_en.locale("en");
var dbmysql = require('./config/mysql');

//var app = module.exports = express();
var app = express();
app.use(compression());
app.use(express.static(path.join(__dirname, '/public')));
app.use('/bower_components', express.static(path.join(__dirname, '/bower_components')));



/**
 * Configuration
 */

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/public/favicon.png'));
app.use(morgan('dev'));
app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({limit:'50mb',extended:true}));
app.use(multer());
app.use(methodOverride());
routes(app);

var env = process.env.NODE_ENV || 'development';

// development only
if (env === 'development') {
  app.use(errorHandler());
}

// production only
if (env === 'production') {
  // TODO
}


/**
 * Routes
 */

// serve index and view partials
//app.get('/', routes.index);
//app.get('/partials/:name', routes.partials);

// JSON API
//app.get('/api/name', api.name);

// redirect all others to the index (HTML5 history)
//app.get('*', routes.index);

//AJAX
//app.post('/getinvoices', routes.getinvoices);


/**
 * Start Server
 */

var server = http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

server.timeout = 1200000;
console.log(server.timeout);