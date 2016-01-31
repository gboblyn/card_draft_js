let mongoose = require('mongoose');

let handSchema = mongoose.Schema({
	draft: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	source: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	cards: {
		type: [Number],
		required: false
	}
});

let playerSchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
		sparse: true
	},
	hands: {
		type: [handSchema],
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
	source_decks: {
		type: [{ player: playerSchema, cards: [Number] }],
		required: true
	}
});

draftSchema.methods.findPlayer = function(name) {
	let matches = this.players.filter((player) => { return player.name === name; });
	if (matches.length === 1) {
		return matches[0];
	}
};

module.exports = {
	Draft: mongoose.model('Draft', draftSchema),
	Player: mongoose.model('Player', playerSchema),
	Hand: mongoose.model('Hand', handSchema)
};
