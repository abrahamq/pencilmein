//load google passport strategy
var passport = require('passport');
var configAuth = require('./auth');
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var logger = require('./log.js'); 
var refresh = require('passport-oauth2-refresh');
var User = require('../app/models/User.js');

module.exports = function(passport, refresh) 
{
  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
       done(null, user.id);
  });

    // used to deserialize the user
  passport.deserializeUser(function(id, done) {
          User.findById(id, function(err, user) {
          done(err, user);
       });
  });

	var strategy = new GoogleStrategy({

	        clientID        : configAuth.googleAuth.clientID,
	        clientSecret    : configAuth.googleAuth.clientSecret,
	        callbackURL     : configAuth.googleAuth.callbackURL
	    },

	    function(token, refreshToken, profile, done) {
          //find user with profile.id. if doesn't exist then create new user 
	  		  // and add to database
          // User.findOne won't fire until we have all our data back from Google
          process.nextTick(function() {
            logger.info("Authenthicating new profile: " + profile + "token: " + token); 
              // try to find the user based on their google id
              User.findOne({ 'googleID' : profile.id }, function(err, user) {
                  if (err)
                      return done(err);

                  if (user) {
                      // if a user is found, log them in
                      return done(null, user);
                  } else {
                      // if the user isnt in our database, create a new user
                      var newUser = new User();

                      // set all of the relevant information
                      newUser.googleID    = profile.id;
                      newUser.googleAccessToken = token;
   
                      newUser.googleRefreshToken = refreshToken;
                      

                      newUser.fullname = profile.displayName;
                      newUser.googleEmail = profile.emails[0].value; // pull the first email

                      // save the user
                      newUser.save(function(err) {
                          if (err)
                              throw err;
                          return done(null, newUser);
                      });
                  }
              });
          });
      });
  passport.use(strategy);
  refresh.use(strategy);
}(passport, refresh);


