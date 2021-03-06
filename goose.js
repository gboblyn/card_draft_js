var goose = require('mongoose');
goose.connect('mongodb://localhost/test');

var db = goose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
	console.log('mongodb connection successfully opened');
});

module.exports = db;
