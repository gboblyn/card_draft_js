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

app.get('/player/:name/hands', validate({
	params: {
		name: Joi.string().regex(/^[a-zA-Z0-9]*$/).required(),
	}
}), logic.getHands);

app.get('/draft/:id/player/:name/pick', validate({
	params: {
		id: Joi.string().regex(/^[a-zA-Z0-9]*$/).required(),
		name: Joi.string().regex(/^[a-zA-Z0-9]*$/).required()
	}
}), logic.pickValidation, (req, res) => {
	req.drafty.draft.source_decks.id(
	res.send(req.drafty.player);
});

app.put('/draft/:id/player/:name/pick', validate({
	params: {
		id: Joi.string().regex(/^[a-zA-Z0-9]*$/).required(),
		name: Joi.string().regex(/^a-zA-Z0-9]*$/).required()
	}
}), logic.pickValidation, (req, res) => {
});


app.put('/draft/:id/join', validate({
	params: { id: Joi.string().regex(/^[a-zA-Z0-9]*$/).required() },
	query: { name: Joi.string().regex(/^[a-zA-Z0-9]*$/).required() }
}), logic.joinValidation, logic.joinDraft);

app.post('/draft/create', validate({
	body: {
		name: Joi.string().required(),
		player_count: Joi.number().integer().min(2).required(),
		pool: Joi.array().required(),
		size: Joi.number().integer().min(2).required()
	}
}), logic.validateCreateBody, logic.createDraft);

app.listen(3000, () => {
	console.log('Server has started on port 3000');
});
