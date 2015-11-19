//Meeting
var mongoose = require('mongoose');
var User = require('./User.js');

var MeetingSchema = mongoose.Schema({
	title: String,
	location: String,
	duration: Number,
	invitedMembers:[String],
	respondedMembers: [String]
});
MeetingSchema.methods=
{
	isClosed : function(){
		return this.invitedMembers.length == this.respondedMembers.length;
	},
	inviteMember : function(username){
		this.invitedMembers.push(username);
	},
	recordMemberResponse: function(username){
		this.respondedMembers.push(username);
	}
};