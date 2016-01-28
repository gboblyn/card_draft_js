let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let db = require('./goose.js');
let Draft = require('./models/draft.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('static'));

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

app.get('/:id/:name/pick', (req, res) => {
	Draft.findById(req.params.id, (err, draft) => {
		if (err || !draft) {
			console.log(err);
			res.send('Draft not found');
		} else if (draft.players.indexOf(req.params.name) === -1) {
			res.send('You are not a part of this draft.');
		} else {
			let hand = draft.hands.find((element, index, array) => {
				if (element.player === req.params.name) {
					return true;
				} else {
					return false;
				}
			});

			if (req.query.card) {
			} else {
				res.send();
			}
		}
	});
});

app.get('/join/:id', (req, res) => {
	Draft.findById(req.params.id, (err, draft) => {
		if (err || !draft) {
			console.log(err);
			res.send('Draft not found');
		} else if (draft.players.indexOf(req.query.name) !== -1) {
			// TODO: case insensitive check.
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

	if (b && b.name && b.player_count && b.pool && b.size) {
		if (b.pool.length < b.player_count * b.size) {
			res.send('Initial card pool too small.');
		} else {
			return next();
		}
	} else {
		// TODO: route back to create page (index.html).
		res.send('Missing input');
	}
};

app.post('/create', validateCreateBody, (req, res) => {
	let draft = new Draft();
	draft.name = req.body.name;
	draft.open_slots = req.body.player_count;
	draft.pool = JSON.parse(req.body.pool);
	draft.source_decks = generateDecks(draft.pool, req.body.size, draft.open_slots);

	draft.save((err, d) => {
		if (err) {
			console.log(err);
			res.send('Unabled to create draft.');
		} else {
			res.send('<a href="localhost:3000/join/' + d._id + '">Join Draft</a>');
		}
	});
});

app.listen(3000, () => {
	console.log('Server has started on port 3000');
});
