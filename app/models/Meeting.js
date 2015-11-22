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
		@param {username} String -  GoogleID of the user to invite
    @param {cb} callback upon completion 
	*/
	inviteMember : function(googleID, cb){
		this.invitedMembers.push(googleID);
    this.save(cb);
	},

	/*
		Saves user responses to database
		@param {username} String - GoogleID of the user whos response is recorded 
    @param {cb} callback upon completion 
	*/
	recordMemberResponse: function(googleID, cb){
		this.respondedMembers.push(googleID);
    this.save(cb);
	},

	/*
		Determines whether a user is invited
		@param {username} String - GoogleID of user 
	*/
	isUserInvited: function(googleID){
	   return this.invitedMembers.indexOf(googleID) !== -1;
  },

  getInviteeEmailList: function() {
  	// 
  }
};

module.exports = mongoose.model('Meeting', MeetingSchema)