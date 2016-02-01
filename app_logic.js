let Draft = require('./models.js').Draft;
let Player = require('./models.js').Player;
let Card = require('./models.js').Card;

let generateDecks = (pool, size, count) => {
	let decks = [];
	let temp_pool = pool.slice();

	for (let i = 0; i < count; i++) {
		let deck = {
			order: i,
			cards: []
		};

		for (let j = 0; j < size; j++) {
			let index = parseInt(Math.random() * (temp_pool.length - 1));
			deck.cards.push(temp_pool.splice(index, 1)[0]);
		}

		decks.push(deck);
	}

	return decks;
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
				let out = { decks: [], hands: [] };
				drafts.forEach((draft) => {
					let draft_decks = draft.findPlayerDecks(req.params.name);
					out.decks.push(draft_decks.deck);
					out.hands.push(draft_decks.hands);
				});
				res.send(out);
			}
		});
	},
	getDeck: (req, res, next) => {
		res.send(req.drafty.decks);
	},
	pickValidation: (req, res, next) => {
		Draft.findById(req.params.id, (err, draft) => {
			if (err || !draft) {
				console.log(err);
				res.send('Draft not found.');
			} else {
				let decks = draft.getPlayerHands(req.params.name);
				req.drafty = {
					draft: draft,
					deck: decks.deck,
					hand: decks.hand
				};
				next();
			}
		});
	},
	pickCard: (req, res, next) => {
		let drafty = req.drafty;
		let draft = drafty.draft;
		let index = drafty.deck.cards.indexOf(req.query.card);

		if (index != -1) {
			let card = draft.decks.id(drafty.deck.id).cards.splice(index, 1);

			if (draft.hands) {
				draft.hands.push({ cards: [card] });
			} else {
				draft.hands.id(drafty.hand.id).cards.push(card);
			}

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

		--draft.open_slots;
		draft.players.push({
			player: req.drafty.player,
			order: draft.open_slots,
			deck: draft.decks[draft.open_slots]._id,
			hand: []
		});
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
		draft.players = [];
		draft.name = req.body.name;
		draft.open_slots = req.body.player_count;
		draft.pool = req.body.pool;
		draft.decks = generateDecks(draft.pool, req.body.size, draft.open_slots);
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
