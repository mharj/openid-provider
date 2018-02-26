const cc = require('camelcase-keys');
const {Router} = require('express');
const querystring = require('querystring');
const {getHttpBasicCredentials, checkPassword, getClient} = require('../../modules/auth');
let router = new Router();

function openIdError(req, res, error) {
	const {state, redirectUri} = cc(req.query);
	if (state) {
		error.state = state;
	}
	res.set('Location', redirectUri + '?' + querystring.stringify(error));
	res.status(302).end();
}

function openId(req, res, next) {
	let required = true;
	['scope', 'response_type', 'client_id', 'redirect_uri'].forEach((k) => {
		if (!(k in req.query)) {
			required = false;
		}
	});
	if (required) {
		const {redirectUri, scope} = cc(req.query);
		// pre-checks - scope
		let scopes = scope.split(' ').filter(function(n) {
			return n != undefined;
		});
		if ( scopes.indexOf('openid') === -1 ) {
			openIdError(req, res, {error: 'invalid_request_object', error_description: 'Broken OpenID scope'});
			return;
		}
		// pre-checks - client
		getClient(req.query.client_id).then((client) => {
			if (client.redirectUris.indexOf(redirectUri) === -1) {
				openIdError(req, res, {error: 'invalid_request_uri', error_description: 'Missing correct redirect url'});
			} else {
				next();
			}
		});
	} else {
		openIdError(req, res, {error: 'invalid_request_object', error_description: 'Missing required parameters'});
	}
}

router.get('/', openId, (req, res) => {
	try {
		const {authorization} = req.headers;
		const {username, password} = getHttpBasicCredentials(authorization);
		checkPassword(username, password)
			.then(() => {
				res.set('Content-Type', 'application/json');
				res.send().end();
			})
			.catch((err) => {
				res.set('WWW-Authenticate', 'Basic realm="OpenID"');
				res.status(401).send('Unauthorized');
				return;
			});
	} catch (err) {
		res.set('WWW-Authenticate', 'Basic realm="OpenID"');
		res.status(401).send('Unauthorized');
	}
});

router.post('/', openId, (req, res) => {
	try {
		const {username, password} = req.body;
		checkPassword(username, password).then(() => {
			res.set('Content-Type', 'application/json');
			res.send().end();
		});
	} catch (err) {
		res.status(401).send('Unauthorized');
	}
});
module.exports = router;
