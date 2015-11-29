// Set up routes for the app
module.exports = function(app) {

	var index = require('../app/routes/index');
  var about = require('../app/routes/about'); 
	var users = require('../app/routes/users');
  var meetings = require('../app/routes/meetings');
  app.use('/', index);
	app.use('/about', about);
  app.use('/users', users);
  app.use('/meetings', meetings);
}
