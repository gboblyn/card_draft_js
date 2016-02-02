let Draft = require('./models.js').Draft;
let Player = require('./models.js').Player;
let Card = require('./models.js').Card;

let initializePlayers = (pool, size, count) => {
	let players = [];
	let temp_pool = pool.slice();

	for (let i = 0; i < count; i++) {
		let deck = [];

		for (let j = 0; j < size; j++) {
			let index = parseInt(Math.random() * (temp_pool.length - 1));
			deck.push(temp_pool.splice(index, 1)[0]);
		}

		players.push({ player: null, decks: [deck], hand: [] });
	}

	return players;
}

let findNext = (players, current_index) => {
	if (current_index < players.length - 1) {
		return players[++current_index]._id;
	} else {
		return players[0]._id;
	}
}

module.exports = {

	createPlayer: (req, res) => {
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
	},

	getHands: (req, res) => {
		Draft.find({ 'players.player.name': req.params.name }, (err, drafts) => {
			if (err || !drafts.length) {
				console.log(err);
				res.send('Player not found.');
			} else {
				let out = [];
				drafts.forEach((draft) => {
					out.push(draft.findPlayerDecks(req.params.name));
				});
				res.send(out);
			}
		});
	},

	getDeck: (req, res, next) => {
		res.send({
			deck: req.drafty.deck,
			hand: req.drafty.hand
		});
	},

	pickValidation: (req, res, next) => {
		Draft.findById(req.params.id, (err, draft) => {
			if (err || !draft) {
				console.log(err);
				res.send('Draft not found.');
			} else {
				let draft_decks = draft.findPlayerDecks(req.params.name);

				req.drafty = {
					draft: draft,
					deck: draft_decks.decks[0],
					hand: draft_decks.hand
				};
				next();
			}
		});
	},

	pickCard: (req, res, next) => {
		let draft = req.drafty.draft;
		if (draft.pickCard(req.params.name, req.query.card)) {
			draft.save((err, result) => {
				if (err || !result) {
					console.log(err);
					res.send('Error updating draft.');
				} else {
					res.send(result);
				}
			});
		} else {
			res.send('Card not found');
		}
	},

	joinDraft: (req, res, next) => {
		let draft = req.drafty.draft;
		let player = req.drafty.player;

		for (let i = 0; i < draft.players.length; i++) {
			if (!draft.players[i].player) {
				--draft.open_slots;
				draft.players[i].player = player;
				draft.players[i].pass = findNext(draft.players, i);
				break;
			}
		}

		draft.save((err, d) => {
			if (err || !d) {
				console.log(err);
				res.send('Error updating draft.');
			} else
				res.send(d);
		});
	},

	joinValidation: (req, res, next) => {
		Draft.findById(req.params.id, (err, draft) => {
			if (err || !draft) {
				console.log(err);
				next('Draft not found.');
			} else if (draft.players.id(req.query.name)) {
				res.send(draft);
			} else if (draft.open_slots <= 0) {
				next('Could not join draft because draft is full.');
			} else {
				Player.findOne({ name: req.query.name }, (err, player) => {
					if (err || !player) {
						console.log(err);
						next('Player not found.');
					} else {
						req.drafty = { draft: draft, player: player };
						next();
					}
				});
			}
		});
	},

	validateCreateBody: (req, res, next) => {
		let b = req.body;
		if (b.pool.length < b.player_count * b.size) {
			res.send('Initial card pool too small.');
		} else {
			next();
		}
	},

	createDraft: (req, res, next) => {
		let draft = new Draft();
		draft.name = req.body.name;
		draft.open_slots = req.body.player_count;
		draft.pool = req.body.pool;
		draft.players = initializePlayers(draft.pool, req.body.size, draft.open_slots);
		draft.save((err, d) => {
			if (err) {
				console.log(err);
				res.send('Unabled to create draft.');
			} else {
				res.send(`<a href="localhost:3000/draft/${d._id}/join">Join Draft</a>`);
			}
		});
	}
};
