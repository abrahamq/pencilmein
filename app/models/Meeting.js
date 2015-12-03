//Meeting
var mongoose = require('mongoose');
var User = require('./User.js');

var MeetingSchema = mongoose.Schema({
	meetingCreator: String,
	title: String,
	location: String,
	duration: Number,
	earliestStartDate: Date,
	latestEndDate: Date,
	invitedMembers:[String],
	respondedMembers: [String],
	finalizedStart: Date,
	InStartDate: Date,
	InEndDate: Date
});

MeetingSchema.methods=
{
	/*
		Determines whether or not the meeting is closed
		@return true if the meeting is closed, false otherwise
	*/
	isClosed : function(){
		return this.invitedMembers.length == this.respondedMembers.length;
	},

	/*
		Adds a member to the meeting
		@param {googleID} String -  GoogleID of the user to invite
    @param {cb} callback upon completion 
	*/
	inviteMember : function(googleID, cb){
		this.invitedMembers.push(googleID);
    this.save(cb);
	},


  /*
    Checks to see if a user has already submitted a response to a meeting invitation
    @param {email}
  */
  isEligibleToSubmit : function(gmail) {
    return this.respondedMembers.indexOf(gmail) == -1 && this.invitedMembers.indexOf(gmail) > -1;
  },

  /*
  Saves user responses to database
    @param {googleEmail} String - Google Email of the user whos response is recorded 
    @param {cb} callback upon completion 
  */
  recordMemberResponse: function(googleEmail, cb) { 
    if (this.respondedMembers.indexOf(googleEmail) == -1){
      this.respondedMembers.push(googleEmail);
    }
    this.save(cb);
  },

  /*
  	Returns the email addresses of all the invited members of meetings
  	@param {cb} callback upon completion
  */
  getInviteeEmailList: function(cb) {
  	var invitedMembers = this.invitedMembers;
  	User.find({'_id' : { $in: invitedMembers}}, 'googleEmail', function(err,email) {
  		cb(err, email);
  	});
  },

  /*
  	Saves optimized In for a meeting
  	@param {startDate} Date - start date of the In
  	@param {endDate} Date - end date of the In
  */
  recordIn : function(startDate, endDate, cb) {
  	this.InStartDate = startDate;
  	this.InEndDate = endDate;
  	this.save(cb);
  }
};

module.exports = mongoose.model('Meeting', MeetingSchema);