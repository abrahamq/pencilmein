var express = require('express');
var router = express.Router();
var passport = require('passport');
var utils = require('../../utils/utils');
var isLoggedIn = require('./authMiddleware');

router.get('/', isLoggedIn, function(req, res) 
{
  res.render('meetingcreation'); 
});

module.exports = router 
