var mongoose = require('mongoose');


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
  createMeeting : function()
  {

  },

  editMeeting : function()
  {

  },

  joinMeeting : function()
  {

  },

  inviteToMeeting : function()
  {

  }
}

UserSchema.statics = 
{
  /*
    Gets user corresponding to argument from database 
    @param {gmail} email of user ot lookup
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