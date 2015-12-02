// Set up routes for the app
module.exports = function(app) {

	var index = require('../app/routes/index');
  var about = require('../app/routes/about'); 
	var users = require('../app/routes/users');
  var meetings = require('../app/routes/meetings');
  var preferences = require('../app/routes/preferences');
  app.use('/', index);
	app.use('/about', about);
  app.use('/users', users);
  app.use('/users/preferences', preferences);
  app.use('/meetings', meetings);
}
