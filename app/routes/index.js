var express = require('express');
var router = express.Router();
var passport = require('passport');
require('../../config/passport.js');

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

//Google Authentication 
router.get('/auth/google', passport.authenticate('google', { scope : ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/userinfo.profile','profile','email']}));

// the callback after google has authenticated the user
router.get('/auth/google/callback',
           passport.authenticate('google', { failureRedirect : '/'}), 
           function(req, res)
           {
              if (req.session.redirect_to){
                res.redirect(req.session.redirect_to);
              }
              else 
              {
                res.redirect('/user');
              }
              
           });

module.exports = router; 
