let mongoose = require('mongoose');

let playerSchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
		sparse: true
	}
});

// TODO
let cardSchema = mongoose.Schema({
	name: {
		type: String,
		required: false
	}
});

let draftSchema = mongoose.Schema({
	name: {
		type: String,
		required: false
	},
	open_slots: {
		type: Number,
		required: true
	},
	players: {
		type: [{
			player: playerSchema,
			decks: [],
			hand: [Number],
			pass: mongoose.Schema.ObjectId
		}],
		required: false
	},
	pool: {
		type: [Number],
		required: true
	}
});

draftSchema.methods.findPlayerDecks = function(name) {
	let player = this.players.filter((entry) => {
		return (entry.player && entry.player.name === name);
	})[0];
	return {
		hand: player.hand,
		decks: player.decks
	};
}

draftSchema.methods.pickCard = function(name, card) {
	let player = this.players.filter((entry) => {
		return (entry.player && entry.player.name === name);
	})[0];
	let index = player.decks[0].indexOf(card);
	if (index != -1) {
			let deck = player.decks.shift();
			let picked_card = deck.splice(index, 1)[0];
			player.hand.push(picked_card);
			this.players.id(player.pass).decks.push(deck);
			return picked_card;
	} else {
		return null;
	}
}

module.exports = {
	Draft: mongoose.model('Draft', draftSchema),
	Player: mongoose.model('Player', playerSchema),
	Card: mongoose.model('Card', cardSchema)
};
