let app = require('express')();
let db = require('./goose.js');
let Draft = require('./models/draft.js');

// Randomly selects a <size> cards from <pool>
// to create a source deck.
function generateDecks(pool, size, count) {
	let source_decks = [];
	let temp_pool = pool;

	for (let i = 0; i < count; i++) {
		source_decks[i] = [];

		for (let j = 0; j < size; j++) {
			let index = parseInt(Math.random() * (temp_pool.length - 1));
			source_decks[i].push(temp_pool.splice(index, 1)[0]);
		}
	}

	return source_decks;
}

function pickCard(id, source) {
	if (source.includes(id)) {
		return source[id];
	}
}

app.get('/join/:id', (req, res) => {

});

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
	if (q.pool) {
		draft.pool = JSON.parse(q.pool);
	}
	if (q.size) {
		draft.source_decks = generateDecks(draft.pool, q.size, draft.open_slots);
	}

	draft.save((err, d) => {
		if (err) {
			console.log(err);
		} else {
			console.log('Draft saved');
		}
	});
	res.send('Draft created');
});

app.post(':draft/pick/:card', (req, res) => {
	if (req.params.draft) {
		let draft = Draft.find(req.params.draft);
	}
	res.send('Pick a Card');
});

app.get('/pool/:id', (req, res) => {
	if (req.params.id) {
		let card_pool = getPool(req.params.id);
		res.send(card_pool);
	} else {
		res.send('Invalid id');
	}
});

app.listen(3000, () => {
	console.log('Server has started on port 3000');
});
