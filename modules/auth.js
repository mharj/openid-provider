function auth() {}

module.exports = auth;

module.exports.checkPassword = (username, password) => {
	return new Promise((resolve, reject) => {
		if (process.env.NODE_ENV === 'test') {
			// mocha
			if (username === 'test' && password === 'test') {
				resolve();
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
