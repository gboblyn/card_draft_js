let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
	console.log('mongodb connection successfully opened');
});

module.exports = db;
