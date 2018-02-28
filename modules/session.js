const fs = require('fs');
const uuid = require('uuid/v1');
const path = './sessions/';

class Session {
	constructor() {
		this.id = uuid();
		this.data = {};
	}
	set(key, value) {
		this.data[key]=value;
	};
	get(key) {
		return this.data[key];
	};
	save() {
		return new Promise( (resolve, reject) => {
			fs.writeFile(path+this.id+'.json', JSON.stringify(this.data), (err) => {
				if ( err ) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	};
	delete() {
		if ( fs.existsSync(path+this.id+'.json') ) {
			return new Promise( (resolve, reject) => {
				fs.unlink(path+this.id+'.json', (err) => {
					if ( err ) {
						reject(err);
					} else {
						resolve();
					}
				});
			});
		} else {
			return Promise.resolve();
		}
	}
}
Session.load = function(id) {
	return new Promise( (resolve, reject) => {
		let c = new Session();
		fs.readFile(path+id+'.json', (err, data) => {
			if ( err ) {
				reject(err);
			} else {
				c.id = id;
				c.data = JSON.parse(data);
				resolve(c);
			}
		});
	});
};
module.exports = Session;
