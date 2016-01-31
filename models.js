let mongoose = require('mongoose');

let playerSchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
		sparse: true
	},
});

let handSchema = mongoose.Schema({
	player: {
		type: playerSchema,
		required: false
	},
	cards: {
		type: [Number],
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
		type: [playerSchema],
		required: false
	},
	pool: {
		type: [Number],
		required: true
	},
	decks: {
		type: [handSchema],
		required: true
	},
	hands: {
		type: [handSchema],
		required: false
	}
});

let filterByPlayerName = (decks, name) => {
	return decks.filter((deck) => {
		return (deck.player && deck.player.name === name);
	});
};

draftSchema.methods.getPlayerHands = function (name)  {
	return {
		decks: filterByPlayerName(this.decks, name),
		hands: filterByPlayerName(this.hands, name)
	};
};

module.exports = {
	Draft: mongoose.model('Draft', draftSchema),
	Player: mongoose.model('Player', playerSchema),
	Hand: mongoose.model('Hand', handSchema)
};
