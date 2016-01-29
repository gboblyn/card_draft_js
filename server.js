let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let db = require('./goose.js');
let Draft = require('./models.js').Draft;
let Player = require('./models.js').Player;
let Hand = require('./models.js').Hand;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('static'));

let validatePlayerCreateBody = (req, res, next) => {
	if (req.body && req.body.name) {
		next();
	} else {
		res.send('No name given.');
	}
};

app.post('/player/create', validatePlayerCreateBody, (req, res) => {
	let player = new Player();
	player.name = req.body.name;
	player.save((err, p) => {
		if (err) {
			console.log(err);
			res.send('Could not create account: ' + err);
		} else {
			res.send(p);
		}
	});
});

let pickValidation = (req, res, next) => {
	Draft.findById(req.params.id, (err, draft) => {
		if (err || !draft) {
			console.log(err);
			res.send('Draft not found');
		} else if (!draft.players.id(req.params.player_id)) {
			res.send('You are not a part of this draft.');
		} else if (!req.query || !req.query.card) {
			res.send('No card provided.');
		} else {
			req.drafty = {
				draft: draft,
				player: draft.players.id(req.params.player_id)
			};
			next();
		}
	});
};

app.get('/draft/:id/:player_id/pick', pickValidation, (req, res) => {
});

let joinValidation = (req, res, next) => {
	Draft.findById(req.params.id, (err, draft) => {
		if (err || !draft) {
			console.log(err);
			next('Draft not found.');
		} else if (draft.players.id(req.query.player_id)) {
			res.send(draft);
		} else if (draft.open_slots <= 0) {
			next('Could not join draft because draft is full.');
		} else if (!req.query || !req.query.player_id) {
			next('No player information found.');
		} else {
			Player.findById(req.query.player_id, (err, player) => {
				if (err || !player) {
					console.log(err);
					next('Player not found.');
				} else {
					req.drafty = { draft: draft, player: player };
					next(null);
				}
			});
		}
	});
};

app.put('/draft/:id/join', joinValidation, (req, res, next) => {
	let draft = req.drafty.draft;
	let player = req.drafty.player;
	draft.open_slots--;
	if (draft.players === null) draft.players = [];
	draft.players.push(player);
	draft.source_decks[draft.open_slots].player = player;
	draft.save();

	if (!player.hands) player.hands = [];
	player.hands.push({
		draft: draft,
		source: draft.source_decks[draft.open_slots]._id,
		cards: []
	});

	player.save();
	res.send(draft);
});

function generateDecks(pool, size, count) {
	let source_decks = [];
	let temp_pool = pool.slice();

	for (let i = 0; i < count; i++) {
		source_decks[i] = { player: null, cards: [] };

		for (let j = 0; j < size; j++) {
			let index = parseInt(Math.random() * (temp_pool.length - 1));
			source_decks[i].cards.push(temp_pool.splice(index, 1)[0]);
		}
	}

	return source_decks;
}

let validateCreateBody = (req, res, next) => {
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

app.post('/draft/create', validateCreateBody, (req, res) => {
	let draft = new Draft();
	draft.name = req.body.name;
	draft.open_slots = req.body.player_count;
	draft.pool = JSON.parse(req.body.pool);
	draft.source_decks = generateDecks(draft.pool, req.body.size, draft.open_slots);

	console.log(draft);
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
