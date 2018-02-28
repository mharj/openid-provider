const fs = require('fs');

class Filestorage {
	constructor(path, options) {
		this.path = path;
		this.suffix = options && options.suffix || 'json';
	}
	load(file) {
		return new Promise( (resolve, reject) => {
			fs.readFile(this.path+file+'.'+this.suffix, (err, data) => {
				if ( err ) {
					reject(err);
				} else {
					resolve(JSON.parse(data));
				}
			});
		});
	};
	save(file, data) {
		return new Promise( (resolve, reject) => {
			fs.writeFile(this.path+file+'.'+this.suffix, JSON.stringify(data), (err) => {
				if ( err ) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	};
	delete(file) {
		if ( fs.existsSync(this.path+file+'.'+this.suffix) ) {
			return new Promise( (resolve, reject) => {
				fs.unlink(this.path+file+'.'+this.suffix, (err) => {
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
	};
};
module.exports = Filestorage;
