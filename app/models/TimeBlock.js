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
    },
    setTimeBlockColor: function(timeBlockId,newColor,cb){
        this.model('TimeBlock').getTimeBlock(timeBlockId, function(err,foundBlock){
            foundBlock.color = newColor;
            foundBlock.save(function(){
                cb(null,foundBlock);
            });
        });
    } 
};
module.exports = mongoose.model('TimeBlock', TimeBlockSchema);
