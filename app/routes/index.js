var express = require('express');
var router = express.Router();
var passport = require('passport');
require('../../config/passport.js');
var User = require('../models/User');
/*
 * GET home page.
 */
router.get('/', function(req, res) {
  req.isAuthenticated(); 
  res.render('index', {title: 'PencilMeIn', showLoginButton: !req.isAuthenticated()});
});

//logging out
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

//only do this in development 
//adds a route so our test user can easily authenticate 
if (!process.env.PRODUCTION){
  router.get('/test', function(req, res){
    User.findOne({'googleEmail':'pmi.test.email@gmail.com'}, function(err, user){
      req.session.passport = {user: user.id};
      res.send(200); 
    }); 
  }); 
}

//Google Authentication 
router.get('/auth/google', passport.authenticate('google', { scope : ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/userinfo.profile','profile','email'], accessType: 'offline', approvalPrompt: 'force' }));

// the callback after google has authenticated the user
router.get('/auth/google/callback',
           passport.authenticate('google', { failureRedirect : '/'}), 
           function(req, res)
           {
            User.getUser(req.user.googleEmail, function(err, user)
            {
              if (req.session.redirect_to){
                res.redirect(req.session.redirect_to);
              }
              else 
              {
                res.redirect('/users');
              }
            });
});

module.exports = router; 
