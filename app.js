/**
 * Module dependencies.
 */

var config = require('./config.json');

var env_dev = 'Development';
var env_prod = 'Production';

var node_env = process.env.NODE_ENV || env_dev;
var node_user_id = process.env.NODE_USER_ID || null;

var express = require('express');
var path = require('path');
var app = express();
var mongoose = require('mongoose');

// Init mongoose
mongoose.connect('mongodb://' + config.mongoose.user + ':' + config.mongoose.pass +
    '@' + config.mongoose.host + ':' + config.mongoose.port + '/' + config.mongoose.database);

// Configuration
app.configure(function () {
    app.locals.basedir = __dirname;

    app.set('views', __dirname + '/' + config.angular.rootDirectory);
    app.set('view engine', 'jade');
    app.set('view options', {
        layout: true
    });
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/' + config.angular.rootDirectory));

    app.locals.basedir = path.join(app.get('views'));

    app.envSettings = {
        environmentType: node_env,
        user: node_user_id
    };
});

app.configure('development', function () {
    app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});

app.configure('production', function () {
    app.use(express.errorHandler());
});

app.listen(config.application.port, function () {
    console.log("Express server listening on port %d in %s mode", config.application.port, app.settings.env);
});

// Init RestModules loader
var API = new require('./rest-modules/api')(app, mongoose);

API.initRestModules([
    'article',
    'publication',
    'tags',
    'user',
    'role',
    'index',
    'admin',
    'search'
]);
