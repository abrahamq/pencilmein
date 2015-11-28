var winston = require('winston'); 

winston.add(winston.transports.File, {filename: './logs/log.log'}); 
winston.info("Starting logging");

/*
  Sets logging levels. Used like
      logger.debug(TEXT);
      logger.info(TEXT);
        etc.
*/
winston.setLevels({
    debug:0,
    info: 1,
    warn: 2,
    error:3,
});

module.exports = winston; 
