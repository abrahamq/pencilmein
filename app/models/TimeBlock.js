var mongoose = require('mongoose');
var TimeBlockSchema = mongoose.Schema({
    color : {
        type: String,
        enum : ['green','yellow','red'],
        default : 'green'
    },
    creationType : {
        type: String,
        enum : ['calendar','general','manual'],
        default : 'calendar'
    },
    startDate : Date
});
TimeBlockSchema.methods = 
{

};
TimeBlockSchema.statics = 
{
    getTimeBlock : function(timeBlockId,cb){
        this.model('TimeBlock').findById(timeBlockId,cb);
    }   
};
module.exports = mongoose.model('TimeBlock', TimeBlockSchema);
