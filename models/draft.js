let mongoose = require('mongoose');
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
		type: [String],
		required: false
	},
	pool: {
		type: [Number],
		required: true
	},
	source_decks: {
		// TODO: I don't like this, but mongoose protested with nested arrays.
		// This schema is a throwaway anyway.
		type: [mongoose.Schema.Types.Mixed],
		required: true
	},
	hands: {
		type: [{ player: String, cards: [Number] }],
		required: false
	}
});

module.exports = mongoose.model('Draft', draftSchema);
