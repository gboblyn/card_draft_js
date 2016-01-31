let Joi = require('joi');
let logic = require('../app_logic.js');
let validate = require('express-validation');

module.exports = (app) => { 
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
}
