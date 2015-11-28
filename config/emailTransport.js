var nodemailer = require('nodemailer');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'donotreply.pmi@gmail.com',
        pass: 'pencilmein123'
    }
},
{
    // default values for sendMail method
    from: 'PencilMeIn <donotreply.pmi@google.com>',
    subject: 'You have a new meeting invite!', // Subject line
});
module.exports = transporter;
