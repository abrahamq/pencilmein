
// Main app file that links everything together and runs the app

var express = require('express'),
    http = require('http');
    mongoose = require('mongoose');

var app = express();

// Configure app bootup
require('./config/bootup')(app);

// Configure routes
require('./config/routes')(app);

// Start web server
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
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
db.on("error", function(err) {console.log("Mongoose error:", err);});


module.exports = app;
