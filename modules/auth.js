const Session = require('./session');

module.exports.checkPassword = (username, password) => {
	return new Promise((resolve, reject) => {
		if (process.env.NODE_ENV === 'test') {
			// mocha
			if (username === 'test' && password === 'test') {
				resolve({upn: username+'@'+'localhost', name: 'Unit test'});
				return;
			}
		} else {
			reject(new Error('Not implemented'));
			return;
		}
		reject(new Error('Username or password not match'));
	});
};

module.exports.getHttpBasicCredentials = (authorization) => {
	if (!authorization) {
		throw new Error('Undefined authorization');
	}
	let bb = authorization.match(/^Basic (\w+)$/);
	if (!bb) {
		throw new Error('Basic authorization not found');
	}
	let [username, password] = Buffer.from(bb[1], 'base64')
		.toString()
		.split(':', 2);
	return {username, password};
};

module.exports.getClient = (id) => {
	return new Promise((resolve, reject) => {
		let client;
		if (process.env.NODE_ENV === 'test') {
			client = {
				redirectUris: ['http://localhost'],
			};
		} else {
			// todo backend lookup
		}
		resolve(client);
	});
};

let sessionData = [];
let codeIndex = {};
let idTokenIndex = {};

module.exports.loadSessionData = () => {
	return new Promise((resolve, reject) => {
		Session.list()
			.then( (sessions) => {
				sessionData = sessions;
				let cIndex = {};
				let tIndex = {};
				sessions.forEach( (ses) => {
					let code = ses.get('code');
					let itToken = ses.get('id_token');
					if ( code ) {
						cIndex[code] = ses;
					}
					if ( itToken ) {
						tIndex[itToken] = ses;
					}
				});
				codeIndex = cIndex;
				idTokenIndex = tIndex;
				resolve();
			});
	});
};

module.exports.getWithAuthCode = (code) => {
	return new Promise((resolve, reject) => {
		if ( codeIndex[code] ) {
			resolve(codeIndex[code]);
		} else {
			reject(new Error('No Session'));
		}
	});
};

module.exports.getWithIdToken = (idToken) => {
	return new Promise((resolve, reject) => {
		if ( idTokenIndex[idToken] ) {
			resolve(idTokenIndex[idToken]);
		} else {
			reject(new Error('No Session'));
		}
	});
};
