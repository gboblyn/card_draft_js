var app = require('express')();
var db = require('./goose.js');
var Draft = require('./models/draft.js');

// Randomly selects a <size> cards from <pool>
// to create a source deck.
function generateDecks(pool, size, count) {
	var source_decks;

	for (var i = 0; i < count; i++) {
		for (var j = 0; j < size; j++) {
			source_decks[i].push(pool[Math.random() * pool.length]);
		}
	}
}

function pickCard(id, source) {
	if (source.includes(id)) {
		return source[id];
	}
}

// TODO: Error handling
app.post('/create', (req, res) => {
	let q;
	let draft = new Draft();

	if (req.query) {
		q = req.query;
	} else {
		res.send('No input\n');
	}
	if (q.name) draft.name = q.name;
	if (q.player_count) draft.open_slots = q.player_count;
	if (q.pool) draft.pool = q.pool;
	if (q.size) {
		generateDecks(pool, size, count);
	}
});

app.post(':draft/pick/:card', (req, res) => {
	if (req.params.draft) {
		let draft = Draft.find(req.params.draft);
	}
	res.send('Pick a Card');
});

app.get('/pool/:id', (req, res) => {
	if (req.params.id) {
		var card_pool = getPool(req.params.id);
		res.send(card_pool);
	} else {
		res.send('Invalid id');
	}
});

app.listen(3000, () => {
	console.log('Server has started on port 3000');
});
