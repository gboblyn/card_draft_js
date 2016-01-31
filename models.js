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
	card: {
		type: Number,
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
			deck: mongoose.Schema.ObjectId,
			hand: [Number]
		}],
		required: false
	},
	pool: {
		type: [Number],
		required: true
	},
	decks: {
		type: [{
			cards: [Number],
			order: Number
		}],
		required: true
	}
});

draftSchema.methods.findPlayerDecks = function(name) {

}

module.exports = {
	Draft: mongoose.model('Draft', draftSchema),
	Player: mongoose.model('Player', playerSchema),
	Card: mongoose.model('Card', cardSchema)
};
