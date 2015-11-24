
// Main app file that links everything together and runs the app

var express = require('express'),
    http = require('http');
    mongoose = require('mongoose');

var utils = require('./utils/utils.js'); 
var logger = require('./config/log.js'); 

var app = express();


// Configure app bootup
require('./config/bootup')(app);

// Configure routes
require('./config/routes')(app);

// 404 handler 
app.use(function(req, res){
  logger.info("Got 404 error: on orignal url: " + req.originalUrl + "err:" +error + "req" +req + "res" + res + "next" + next); 
  utils.renderTemplate(res, '404Page');  
  return;
}); 

// 500 handler
app.use(function(error, req, res, next){
  logger.info("Got 500 error: on route: " + req.originalUrl + "err:" +error.stack + "req" +req + "res" + res + "next" + next); 
  utils.renderTemplate(res, '404Page');  //are we not supposed to call next? 
  return;
}); 


// Start web server
http.createServer(app).listen(app.get('port'), function(){
  logger.log("Express server listening on port " + app.get('port'));
});


/*
Start database server
TODO: Setup mongo on server +  create (/data/db) directory
Remember to get db to work, /data/db must be created and 
mongod command run 
*/
var mongoDirectory = '/data/db';

mongoose.connect('mongodb://localhost:27017/pmidb');
var db = mongoose.connection;
db.on("error", function(err) {logger.err("Mongoose error", err);});


module.exports = app;
