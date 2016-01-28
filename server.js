'use strict';

var app = require('express')();
var goose = require('mongoose');
goose.connect('mongodb://localhost/test');

var db = goose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function() {
	console.log('mongodb connection successfully opened');
});

var test_pool = {
	id: '1',
	deck: [ 1, 2 ]
};

var draftSchema = goose.Schema({
	name: String,
	players: [String],
	pool: [{ name: String, body: String }],
	source_decks: ,
	hands: [{ player: String, cards: [Number] }]
)};


var global_draft = [];
	
function getPool(id) {
	return test_pool;
}

function getDraft(id) {
	return global_draft[id];
}

// Randomly selects a <size> cards from <pool>
// to create a source deck.
function generateDeck(pool, size) {

}

function pickCard(id, source) {
	if (source.includes(id)) {
		return source[id];
	}
}

function pass() {
}

// What is needed to create a draft?
// Player count
// Card pool
// Source deck size
app.post('/create', function(req, res) {
	var player_count;
	var source_size;
	var card_pool;
	var q;

	if (req.query) q = req.query;
	if (q.count) player_count = q.count;
	if (q.size) source_size = q.size;

	res.send('size = ' + source_size + ' | count = ' + player_count);
});

app.post(':draft/pick/:card', function(req, res) {
	if (req.params.draft) {
		let draft = getDraft(req.params.draft);
	}
	res.send('Pick a Card');
});

app.get('/pool/:id', function(req, res) {
	if (req.params.id) {
		var card_pool = getPool(req.params.id);
		res.send(card_pool);
	} else {
		res.send('Invalid id');
	}
});

app.listen(3000);
