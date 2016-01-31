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
	draft: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
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
	source_decks: {
		type: [handSchema],
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
