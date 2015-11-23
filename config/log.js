var winston = require('winston'); 

winston.add(winston.transports.File, {filename: './logs/log.log'}); 
winston.info('Starting loggging'); 

module.exports = winston; 
