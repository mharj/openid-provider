const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
const port = process.env.PORT || '7957';
const discovery = require('./routes/discovery');
const oauth2 = require('./routes/oauth2');
const {loadCerts} = require('./modules/cert');

app.get('/', (req, res) => res.send('Hello World!'));
app.use('/.well-known/openid-configuration', discovery);
app.use('/oauth2', oauth2);

const servicePromise = async () => {
	return loadCerts()
		.then( () => {
			return Promise.resolve(app);
		});
};

if (process.env.NODE_ENV === 'test') { // mocha
	module.exports = servicePromise;
} else {
	servicePromise()
		.then( () => {
			app.listen(port, () => console.log('OpenID provider running on ' + port));
		});
}
