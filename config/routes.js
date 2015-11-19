// Set up routes for the app
module.exports = function(app) {

	var index = require('../app/routes/index');
  var about = require('../app/routes/about'); 
	app.use('/', index);
	app.use('/about', about);
}
