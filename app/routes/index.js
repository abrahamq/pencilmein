var express = require('express');
var router = express.Router();
var passport = require('passport');
require('../../config/passport.js');

/*
 * GET home page.
 */
router.get('/', function(req, res) {
  res.render('index', {title: 'PencilMeIn'});
});

router.get('/redirect', function(req, res) {
	res.render('secondpageplaceholder');
});

//Google Authentication 
router.get('/auth/google', passport.authenticate('google', { scope : ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/userinfo.profile','profile']}));

// the callback after google has authenticated the user
router.get('/auth/google/callback',
           passport.authenticate('google', {
             successRedirect : '/redirect',
             failureRedirect : '/'
           }));

module.exports = router; 
