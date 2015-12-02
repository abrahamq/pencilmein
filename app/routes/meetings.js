var express = require('express');
var nodemailer = require('nodemailer');
var router = express.Router();
var passport = require('passport');
var utils = require('../../utils/utils');
var isLoggedIn = require('./authMiddleware');
var User = require('../models/User');
var Meeting = require('../models/Meeting');
var logger = require('../../config/log.js');
var emailTransporter = require('../../config/emailTransport.js');
var CONSTANTS = require('../../config/CONSTANTS.js');

router.get('/new', isLoggedIn, function(req, res) 
{
  res.render('meetingcreation', {_csrf: req.csrfToken()}); 
});

router.post('/', isLoggedIn, function(req, res)
{
  //Meeting components 
  var meetingInfo = req.body.meetingInfo;
  //create meeting 
  User.getUser(req.user.googleEmail, function(err, meetingCreator) {
    meetingCreator.createMeeting(meetingInfo, 
      function(meetingId)
      {
      //update session 
        req.session.save(function()
        {
          //save meeting creator 
          meetingCreator.save(function()
          {
            // Email those invited to the meeting
            emailInvitees(meetingInfo.invitees, meetingId);
            utils.sendSuccessResponse(res, {redirect : '/users/calendars/' + meetingId});
            return;
          });
        });
      });
  });
});

/*
  Send an email to a set of google accounts with the url to follow to reach the calendar page 
  @param {invitees} A list of invitees to email 
  @param {meetingId} id of the meeting to include in the email link 
*/
var emailInvitees = function(invitees, meetingId)
{
  //link to calendar page
  var linkPrefix = process.env.PRODUCTION ? 'http://www.pencilmein.xyz/users/calendars/' : 'http://localhost:3000/users/calendars/';

  //Mail configuration 
  var mailOptions = {
    text : CONSTANTS.EMAIL_BODY + linkPrefix + meetingId + CONSTANTS.EMAIL_CONCLUSION,
    bcc: invitees
  };

  //Send the emails  
  emailTransporter.sendMail(mailOptions, function(error, info){
    if (error) {
        return logger.error(error);
    }
    logger.info('Message sent: ' + info.response);
  });

};



module.exports = router;
