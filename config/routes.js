// Set up routes for the app
module.exports = function(app) {

	var index = require('../app/routes/index');
	app.use('/', index);
}
