const fs = require('fs');
const crypto = require('crypto');
const pem2jwk = require('pem-jwk').pem2jwk;

let certList = [];
module.exports.getCerts = () => {
	return certList;
};

module.exports.loadCerts = () => {
	return new Promise((resolve, reject) => {
		let path;
		if (process.env.NODE_ENV === 'test') {
			path = './test/jwtcerts/';
		} else {
			path = './jwtcerts/';
		}
		fs.readdir(path, (err, files) => {
			// get *.pub files to jwt list
			files.filter((file) => file.match(/\.pub$/)).forEach((file) => {
				let pubCert = fs.readFileSync(path + file, 'ascii');
				certList.push(
					Object.assign({}, pem2jwk(pubCert), {
						alg: 'RS256',
						use: 'sig',
						kid: crypto
							.createHash('md5')
							.update(pubCert)
							.digest('hex'),
					})
				);
			});
			resolve();
		});
	});
};
