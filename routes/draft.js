let Joi = require('joi');
let logic = require('../app_logic.js');
let validate = require('express-validation');

module.exports = (app) => {
	app.get('/draft/:id/player/:name/pick', validate({
		params: {
			id: Joi.string().regex(/^[a-zA-Z0-9]*$/).required(),
			name: Joi.string().regex(/^[a-zA-Z0-9]*$/).required()
		}
	}), logic.pickValidation, logic.getDeck);

	app.put('/draft/:id/player/:name/pick', validate({
		params: {
			id: Joi.string().regex(/^[a-zA-Z0-9]*$/).required(),
			name: Joi.string().regex(/^[a-zA-Z0-9]*$/).required()
		},
		query: {
			card: Joi.number().integer().required()
		}
	}), logic.pickValidation, logic.pickCard);

	app.get('/draft/:id/join', validate({
		params: { id: Joi.string().regex(/^[a-zA-Z0-9]*$/).required() }
	}), (req, res) => {
		// TODO: Serve join form with appropriate draft id.
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
}
