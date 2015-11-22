
var config = require('./config'),
	express = require('express'),
	passport = require('passport'),
	logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	favicon = require('serve-favicon'),
	path = require('path');
  csurf = require('csurf'); 

// Do express configuration and middleware
module.exports = function(app) 
{
	app.set('port', config.port);
	app.set('views', __dirname + '/../app/views');
	app.set('view engine', 'hbs');
	app.use(favicon('public/favicon.ico'));
	app.use(logger('dev'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(cookieParser());
	app.use(session({ secret : '6170', resave : true, saveUninitialized : true }));
	app.use(passport.initialize());
  app.use(passport.session());
  app.use(csurf()); 
	app.use(express.static(path.join(__dirname, '/../node_modules/bootstrap/dist')));
  app.use(express.static(path.join(__dirname, '/../bower_components')));
	app.use(express.static(__dirname + '/../public')); 
	app.use(express.static(__dirname + '/../bower_components')); 
};

