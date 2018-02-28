process.env.NODE_ENV = 'test';
let chai = require('chai');
const {expect} = require('chai');
const url = require('url');
let chaiHttp = require('chai-http');
let servicePromise = require('../service');
let service = null;
chai.should();
chai.use(chaiHttp);

let configCache = null;
function getConfig() {
	return configCache
		? Promise.resolve(configCache)
		: chai
			.request(service)
			.get('/.well-known/openid-configuration')
			.then((res) => {
				configCache = res.body;
				return Promise.resolve(configCache);
			});
}

describe('jwks_uri endpoint', () => {
	before( function(done) {
		this.timeout(5000);
		servicePromise()
			.then( (s) => {
				service = s;
				done();
			});
	});
	it('it should GET JWT cert list', (done) => {
		getConfig().then((config) => {
			let urlData = url.parse(config['jwks_uri']);
			chai
				.request(service)
				.get(urlData.path)
				.redirects(0)
				.then((res) => {
					expect(res.body).to.have.property('keys').and.is.an('array');
					expect(res.body.keys[0]).to.have.include.keys(['kty', 'e', 'n', 'alg', 'kid']);
					done();
				});
		});
	});
});
