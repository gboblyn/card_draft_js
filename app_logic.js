let Draft = require('./models.js').Draft;
let Player = require('./models.js').Player;
let Hand = require('./models.js').Hand;

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
		Player.findById(req.params.id, (err, player) => {
			if (err || !player) {
				console.log(err);
				res.send('Player not found.');
			} else {
				res.send(player.hands);
			}
		});
	},
	joinDraft: (req, res, next) => {
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
	},
	createDraft: (req, res, next) => {
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
	}
};
