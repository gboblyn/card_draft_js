let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let db = require('./goose.js');
let player_routes = require('./routes/player.js');
let draft_routes = require('./routes/draft.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('static'));

player_routes(app);

draft_routes(app);

app.listen(3000, () => {
	console.log('Server has started on port 3000');
});
