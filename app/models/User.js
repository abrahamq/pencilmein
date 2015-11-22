var mongoose = require('mongoose');
var Meeting = require('./Meeting.js')

var UserSchema = mongoose.Schema
({
  googleID : String,
  googleAccessToken : String,
  googleRefreshToken : String,
  googleEmail : String,

  fullname : String,
  
  meetings : [
    { 
        type: mongoose.Schema.ObjectId,
        ref: 'Meeting' 
    }],

  availabilities : [
    { 
        type: mongoose.Schema.ObjectId,
        ref: 'Availability' 
    }]
});

UserSchema.methods = 
{
  /*
    Create a new meeting and populate meeting information 
    @param{title} title of the meeting
    @param{location} meeting locale
    @param{duration} duration of the meeting
    @param{earliestStart} earliest time the meeting can take place 
    @param{latestEndDate} latest time the meeting can happen 
    @param{cb} callback upon completion 
  */
  createMeeting : function(title, location, duration, earliestStart, latestEndDate, cb)
  {
    var userObj = this;
    var newMeeting = new Meeting();
    newMeeting.creator = this.user
    newMeeting.title = title; 
    newMeeting.location = location;
    newMeeting.duration = duration;
    newMeeting.earliestStart = earliestStart;
    newMeeting.latestEndDate = latestEndDate;
    this.meetings.push(newMeeting._id);
    newMeeting.save(function()
      {
        cb(newMeeting._id)
      });
  },

  /*
    If the user was invited to the meeting, join it 
    @param{meetingID} ID of the meeting to join
    @param{cb} callback upon completion  
  */
  joinMeeting : function(meetingID, cb)
  {
    //Find meeting object
    Meeting.findById(meetingID, function(err, curMeeting)
    {
      //if user was invited to meeting 
      if (curMeeting.isUserInvited(this.googleID))
      {
        curMeeting.respondedMembers.push(this.googleID);
      }
      curMeeting.save(cb);

    });
  },

  /*
    Invite a user to a meeting
    @param {googleID} google ID of user to invite 
    @param {meetingID} ID of meeting to invite user to 
    @param {cb} callback upon 
  */
  inviteToMeeting : function(googleID, meetingID, cb)
  {
    Meeting.findById(meetingID, function(err, curMeeting) 
    {
      curMeeting.inviteMember(googleID, cb);
    });
  },

  /*
    Sets a users availability for a meeting
    @param {meetingID} ID of meeting to set availability for 
    @param {startTime} start of user availability 
    @param {endTime} end of availabilit
  */
  setAvailablity : function(meetingID, startTime, endTime)
  {

  },

  /*
    Gets a user's availability for a meeting 
    @param {meetingID} ID of meeting to get availability from  
  */
  getAvailability : function(meetingID)
  {

  }
} 

UserSchema.statics = 
{
  /*
    Gets user corresponding to argument from database 
    @param {gmail} email of user tolookup
    @param {cb} callback to execute upon completion 
  */
  getUser : function(gmail, cb)
  {
    return this.model('User').findOne({googleEmail : gmail}, cb);
  },

  /*
    Gets all users from the database
    @param {cb} callback to execute
  */
  getAllUsers : function(cb)
  {
    return this.model('User').find({}, cb);
  }}

module.exports = mongoose.model('User', UserSchema);
