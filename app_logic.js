let Draft = require('./models.js').Draft;
let Player = require('./models.js').Player;
let Hand = require('./models.js').Hand;

let generateDecks = (pool, size, count) => {
	let decks = [];
	let temp_pool = pool.slice();

	for (let i = 0; i < count; i++) {
		let hand = new Hand();

		for (let j = 0; j < size; j++) {
			let index = parseInt(Math.random() * (temp_pool.length - 1));
			hand.cards.push(temp_pool.splice(index, 1)[0]);
		}

		decks.push(hand);
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
		Draft.find({ 'players.name': req.params.name }, (err, drafts) => {
			if (err || !drafts) {
				console.log(err);
				res.send('Player not found.');
			} else {
				drafts.forEach((draft) => {
					let hands = draft.getPlayerHands(req.params.name);
					res.send(hands);
				});
			}
		});
	},
	pickValidation: (req, res, next) => {
		Hand.findOne({
			player: { name: req.params.name },
			draft: req.params.id
		}, (err, hand) => {
			if (err || !hand) {
				console.log(err);
				res.send('Hand not found.');
			} else {
				req.drafty = { hand: hand };
				next();
			}
		});
	},
	joinDraft: (req, res, next) => {
		let draft = req.drafty.draft;
		let player = req.drafty.player;
		let hand = new Hand();
		hand.player = player;

		draft.open_slots--;
		if (draft.players === null) draft.players = [];
		draft.players.push(player);
		draft.decks[draft.open_slots].player = player;
		draft.hands.push(hand);
		draft.save();

		res.send(draft);
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
			} else if (!req.query || !req.query.name) {
				next('No player information found.');
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
			return res.send('Initial card pool too small.');
		} else {
			return next();
		}
	},
	createDraft: (req, res, next) => {
		let draft = new Draft();
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
