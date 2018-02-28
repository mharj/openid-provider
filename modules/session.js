const uuid = require('uuid/v1');
const {getSessionStorage} = require('./storage');


class Session {
	constructor() {
		this.id = uuid();
		this.data = {};
	}
	set(key, value) {
		this.data[key] = value;
	}
	get(key) {
		return this.data[key];
	}
	save() {
		let storage = getSessionStorage();
		return storage.save(this.id, this.data);
	}
	delete() {
		let storage = getSessionStorage();
		return storage.delete(this.id);
	}
}
Session.load = function(id) {
	let storage = getSessionStorage();
	return storage.load(id).then((data) => {
		let c = new Session();
		c.id = id;
		c.data = data;
		return Promise.resolve(c);
	});
};
Session.getWithCode = function(code) {
	return Session.list()
		.then( (sessions) => {
			return sessions.find( (ses) => ses.get('code') === code );
		});
};
Session.list = function() {
	let storage = getSessionStorage();
	return storage.list().then((list) => {
		return Promise.all(list.map((id) => Session.load(id)));
	});
};
module.exports = Session;
