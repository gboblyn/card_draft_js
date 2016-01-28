let app = require('express')();
let bodyParser = require('body-parser');
let db = require('./goose.js');
let Draft = require('./models/draft.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Randomly selects a <size> cards from <pool>
// to create a source deck.
function generateDecks(pool, size, count) {
	let source_decks = [];
	let temp_pool = pool.slice();

	for (let i = 0; i < count; i++) {
		source_decks[i] = [];

		for (let j = 0; j < size; j++) {
			let index = parseInt(Math.random() * (temp_pool.length - 1));
			source_decks[i].push(temp_pool.splice(index, 1)[0]);
		}
	}

	return source_decks;
}

app.get('/', (req, res) => {
	res.send('index.html');
});

app.get('/join/:id', (req, res) => {
	Draft.findById(req.params.id, (err, draft) => {
		if (err) {
			console.log(err);
		} else if (draft.players.indexOf(req.query.name) !== -1) {
			res.send(draft);
		} else if (req.query.name && draft.open_slots > 0) {
			draft.open_slots--;

			if (draft.players === null) draft.players = [];
			draft.players.push(req.query.name);
			draft.hands.push({
					player: req.query.name,
					cards: draft.source_decks[draft.open_slots]
			});
			draft.save();
			res.send(draft);
		} else {
			res.send('Could not join draft');
		}
	});
});

let validateCreateBody = function (req, res, next) {
	let b = req.body;
	console.log(`b = ${b}`);

	if (b && b.name && b.player_count && b.pool && b.size) {
		return next();
	} else {
		res.send('Missing input');
	}
}

app.post('/create', validateCreateBody, (req, res) => {
	let draft = new Draft();
	draft.name = req.body.name;
	draft.open_slots = req.body.player_count;
	draft.pool = JSON.parse(req.body.pool);
	draft.source_decks = generateDecks(draft.pool, req.body.size, draft.open_slots);

	draft.save((err, d) => {
		if (err) {
			console.log(err);
		} else {
			console.log('Draft successfully saved: ' + d);
		}
	});
	res.send('<a href="localhost:3000/join/' + draft._id + '">Join Draft</a>');
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
