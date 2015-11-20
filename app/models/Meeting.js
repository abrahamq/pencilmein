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
	finalizedStart: Date
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
		@param {username} String -  username of the user to invite
	*/
	inviteMember : function(username){
		this.invitedMembers.push(username);
	},

	/*
		Saves user responses to database
		@param {username} String - username of the user whos response is recorded 
	*/
	recordMemberResponse: function(username){
		this.respondedMembers.push(username);
	},

	/*
		Determins whether a user is invited
		@param {username} String - username of user 
	*/
	checkUserInvited: function(username){
		check_user = this.invitedMembers.filter(function(member_username){
			if (member_username == username){
				return true;
			}
		})
		if (check_user.length == 1) {
			return true
		}
	},
};

module.exports = mongoose.model('Meeting', MeetingSchema)