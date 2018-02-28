const cc = require('camelcase-keys');
const {Router} = require('express');
const querystring = require('querystring');
const {getHttpBasicCredentials, checkPassword, getClient} = require('../../modules/auth');
const Session = require('../../modules/session');
let router = new Router();

function openIdError(req, res, error) {
	const {state, redirectUri} = cc(req.query);
	if (state) {
		error.state = state;
	}
	res.set('Location', redirectUri + '?' + querystring.stringify(error));
	res.status(302).end();
}

function openIdOk(req, res, data) {
	const {state, redirectUri} = cc(req.query);
	if (state) {
		data.state = state;
	}
	res.set('Location', redirectUri + '?' + querystring.stringify(data));
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
		if (scopes.indexOf('openid') === -1) {
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
// GET  HTTP/1.1 302 Found
// Location: http://localhost/myapp/?
// code= AwABAAAAvPM1KaPlrEqdFSBzjqfTGBCmLdgfSTLEMPGYuNHSUYBrqqf_ZT_p5uEAEJJ_nZ3UmphWygRNy2C3jJ239gV_DBnZ2syeg95Ki-374WHUP-i3yIhv5i-7KU2CEoPXwURQp6IVYMw-DjAOzn7C3JCu5wpngXmbZKtJdWmiBzHpcO2aICJPu1KvJrDLDP20chJBXzVYJtkfjviLNNW7l7Y3ydcHDsBRKZc3GuMQanmcghXPyoDg41g8XbwPudVh7uCmUponBQpIhbuffFP_tbV8SNzsPoFz9CLpBCZagJVXeqWoYMPe2dSsPiLO9Alf_YIe5zpi-zY4C3aLw5g9at35eZTfNd0gBRpR5ojkMIcZZ6IgAA
// &session_state=7B29111D-C220-4263-99AB-6F6E135D75EF
// &state=D79E5777-702E-4260-9A62-37F75FF22CCE
router.get('/', openId, (req, res) => {
	try {
		const {authorization} = req.headers;
		const {username, password} = getHttpBasicCredentials(authorization);
		checkPassword(username, password)
			.then((idPayload) => {
				const {responseType} = cc(req.query);
				let ses = new Session();
				let payload = {session_state: ses.id};
				ses.set('id_payload', idPayload);
				if (responseType == 'code') {
					ses.set('code', ses.id);
					payload.code = ses.id;
				}
				ses.save().then(() => openIdOk(req, res, payload));
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
		checkPassword(username, password).then((idPayload) => {
			res.set('Content-Type', 'application/json');
			res.send().end();
		});
	} catch (err) {
		res.status(401).send('Unauthorized');
	}
});
module.exports = router;
