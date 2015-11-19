var TimeBlock = function(){
    var that = Object.create(TimeBlock.prototype);
    //----------------------private variables-----------------------
    var color = 'green';
    var setType = 'calendar';
    var isValidColor = function(newColor){
        return (newColor=='green' || newColor=='yellow' || newColor == 'red');
    }
    var isValidSetType = function(newSetType){
        return (newColor=='calendar' || newColor=='general' || newColor == 'manual');
    }
    //----------------------public functions-----------------------
    that.getColor = function(){
        return color;   
    }
    that.setColor = function(newColor){
        if isValidColor(newColor){
            color = newColor;
        }
    }
    that.getSetType = function(){
        return color;   
    }
    that.setSetType = function(newSetType){
        if isValidSetType(newSetType){
            setType = newSetType;
        }
    }
    Object.freeze(that);
    return that;    
}