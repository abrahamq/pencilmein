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
    /*
    Sends the cb function the timeblock with the given id
    @param mongoID of TimeBlock timeBlockId
    @param cb arg1) err arg2) TimeBlock
    */
    getTimeBlock : function(timeBlockId,cb){
        this.model('TimeBlock').findById(timeBlockId,cb);
    },
    /*
    Gets all time blocks with given ids
    @param List of mongoID's of TimeBlocks
    @param cb: will be given arg1) err, arg2) List of TimeBlocks
    Sends the callback a list of TimeBlocks with id's in the arg list
    */
    getTimeBlocks : function(timeBlockIds,cb){
        this.model('TimeBlock').find({'_id': { $in: timeBlockIds}}, cb);
    },
    /*
    Updates a time blocks color and creation type
    @param mongoID of TimeBlock timeBlockId
    @param String newColor: color (must be 'red','yellow' or 'green') that the blocks color will be set to
    @param String newCreationType: creationType (must be 'calendar', 'manual' or 'general') that the block's creation type will be reset to
    @param cb: will  be given arg1)err, arg2) TimeBlock that has been updated
    */
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
