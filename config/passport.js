//load google passport strategy
var passport = require('passport');
var configAuth = require('./auth');
var GoogleStrategy = require('passport-google-oauth2').Strategy;

module.exports = 

	passport.use(new GoogleStrategy({

	        clientID        : configAuth.googleAuth.clientID,
	        clientSecret    : configAuth.googleAuth.clientSecret,
	        callbackURL     : configAuth.googleAuth.callbackURL,

	    },
	    function(token, refreshToken, profile, done) {
	  		  //find user with profile.id. if doesn't exist then create new user 
	  		  // and add to database
	  		  return done(null,false);
	    }));

