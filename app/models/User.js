var mongoose = require('mongoose');
var Meeting = require('./Meeting.js');
var logger = require('../../config/log.js');

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
    }],

  preferences : { Monday : [String], Tuesday : [String], 
                  Wednesday : [String],  Thursday : [String], 
                  Friday : [String], Saturday : [String], 
                  Sunday : [String] }
});

UserSchema.methods = 
{
  /*
    Create a new meeting and populate meeting information
    @param {meetingInfo} object that contains the following  
      {title} title of the meeting
      {location} meeting locale
      {duration} duration of the meeting
      {earliestStart} earliest time the meeting can take place
      {latestEndDate} latest time the meeting can happen
      {invitees} a list of google mail addresses invited to the meeting
      {cb} callback upon completion 
*/
  createMeeting : function(meetingInfo, cb)
  {
    var userObj = this;
    var newMeeting = new Meeting();
    var invitedMembersAndCreator = meetingInfo.invitees.concat([this.googleEmail]);
    newMeeting.creator = userObj.googleID;
    newMeeting.title = meetingInfo.title; 
    newMeeting.location = meetingInfo.location;
    newMeeting.duration = meetingInfo.duration;
    newMeeting.earliestStartDate = meetingInfo.earliestStartDate;
    newMeeting.latestEndDate = meetingInfo.latestEndDate;
    newMeeting.invitedMembers = invitedMembersAndCreator;

    this.meetings.push(newMeeting._id);
    newMeeting.save(function(err)
      {
        if (err)
        {
          logger.error('Error saving new meeting ' + err);
        }
        cb(newMeeting._id);
      });
  },

  /*
    If the user was invited to the meeting, join it 
    @param{meetingID} ID of the meeting to join
    @param{cb} callback upon completion  
  */
  joinMeeting : function(meetingId, cb)
  {
    // Add meeting
    if (this.meetings.indexOf(meetingId) == -1) {
      this.meetings.push(meetingId);
    } 
    //Handle saving
    this.save(function(err)
    {
      if (err) { 
        logger.error(err);
        throw err;
      }
      cb(err);
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
    Update a user's general preferences
    @param {preferences} user's general preference object
        Day of week => [earliestStartTime,  latestEndTime]
        Ex.  Monday => ["8:00 AM", "11:00 PM"]
    @param {cb} callback upon completion
  */
  updatePreferences : function(preferences, cb)
  {
    this.preferences = preferences;
    this.save(function(err) {
      if (err)
      {
        logger.error(err);
        throw err;
      }
      cb();
    });
  }
}; 

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
  }
};

module.exports = mongoose.model('User', UserSchema);
