var mongoose = require('mongoose');
var draftSchema = mongoose.Schema({
		name: String,
		open_slots: Number,
		players: [String],
		pool: [{ name: String, body: String }],
		source_decks: [[Number]],
		hands: [{ player: String, cards: [Number] }]
	});

module.exports = mongoose.model('Draft', draftSchema);
