let express = require('express');
let validate = require('express-validation');
let app = express();
let bodyParser = require('body-parser');
let db = require('./goose.js');
let Joi = require('joi');
let logic = require('./app_logic.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('static'));

app.post('/player/create', validate({
	body: {
		name: Joi.string().required()
	}
}), logic.createPlayer);

let pickValidation = (req, res, next) => {
	Draft.findById(req.params.id, (err, draft) => {
		if (err || !draft) {
			console.log(err);
			res.send('Draft not found');
		} else if (!draft.players.id(req.params.player_id)) {
			res.send('You are not a part of this draft.');
		} else if (!req.query || !req.query.card) {
			res.send('No card provided.');
		} else {
			req.drafty = {
				draft: draft,
				player: draft.players.id(req.params.player_id)
			};
			next();
		}
	});
};

app.get('/player/:id/hands', validate({
	params: {
		id: Joi.string().regex(/^[a-zA-Z0-9]*$/).required(),
		player_id: Joi.string().regex(/^[a-zA-Z0-9]*$/).required()
	}
}), logic.getHands);

app.get('/draft/:id/:player_id/pick', pickValidation, (req, res) => {
});

let joinValidation = (req, res, next) => {
	Draft.findById(req.params.id, (err, draft) => {
		if (err || !draft) {
			console.log(err);
			next('Draft not found.');
		} else if (draft.players.id(req.query.player_id)) {
			res.send(draft);
		} else if (draft.open_slots <= 0) {
			next('Could not join draft because draft is full.');
		} else if (!req.query || !req.query.player_id) {
			next('No player information found.');
		} else {
			Player.findById(req.query.player_id, (err, player) => {
				if (err || !player) {
					console.log(err);
					next('Player not found.');
				} else {
					req.drafty = { draft: draft, player: player };
					next(null);
				}
			});
		}
	});
};

app.put('/draft/:id/join', validate({
	params: { id: Joi.string().regex(/^[a-zA-Z0-9]*$/).required() },
	query: { player_id: Joi.string().regex(/^[a-zA-Z0-9]*$/).required() }
}), joinValidation, logic.joinDraft);

let validateCreateBody = (req, res, next) => {
	let b = req.body;
	if (b.pool.length < b.player_count * b.size) {
		return res.send('Initial card pool too small.');
	} else {
		return next();
	}
};

app.post('/draft/create', validate({
	body: {
		name: Joi.string().required(),
		player_count: Joi.number().integer().min(2).required(),
		pool: Joi.array().required(),
		size: Joi.number().integer().min(2).required()
	}
}), validateCreateBody, logic.createDraft);

app.listen(3000, () => {
	console.log('Server has started on port 3000');
});
