var winston = require('winston'); 

winston.add(winston.transports.File, {filename: './logs/log.log'}); 

winston.setLevels({
    debug:0,
    info: 1,
    silly:2,
    warn: 3,
    error:4,
});

module.exports = winston; 
