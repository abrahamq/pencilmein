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
    getTimeBlocks : function(timeBlockIds,cb){
        this.model('TimeBlock').find({'_id': { $in: timeBlockIds}}, cb);
    },
    setTimeBlockColorAndCreationType: function(timeBlockId,newColor,newCreationType,cb){
        this.model('TimeBlock').getTimeBlock(timeBlockId, function(err,foundBlock){
            if (newColor && (newColor == 'green' || newColor == 'yellow' || newColor == 'red')){ 
                foundBlock.color = newColor; 
            }
            if (newCreationType && (newCreationType =='calendar' || newCreationType == 'manual' || newColor == 'general')){
                foundBlock.creationType = newCreationType;
            }
            // var interBlock = foundBlock;
            foundBlock.save(function(){
                cb(null,foundBlock);
            });
        });
    },
};
module.exports = mongoose.model('TimeBlock', TimeBlockSchema);
