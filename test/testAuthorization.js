process.env.NODE_ENV = 'test';
let chai = require('chai');
const {expect} = require('chai');
const url = require('url');
let chaiHttp = require('chai-http');
const querystring = require('querystring');
let service = require('../service');

chai.should();
chai.use(chaiHttp);

let params = {
	scope: 'openid profile',
	response_type: 'code',
	client_id: 'unit_test',
	redirect_uri: 'http://localhost',
	state: '123456789',
};

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

describe('authorization_endpoint', () => {
	it('it should get error redirect if dont have needed openid parameters', (done) => {
		getConfig().then((config) => {
			let urlData = url.parse(config['authorization_endpoint']);
			chai
				.request(service)
				.get(urlData.path)
				.redirects(0)
				.set('Authorization', 'Basic ' + new Buffer('test:test').toString('base64'))
				.then((res) => {
					done(new Error('This should be broken'));
				})
				.catch((err) => {
					if (err.status === 302) {
						let locationData = querystring.parse(err.response.headers.location.split('?', 2)[1]);
						expect(locationData).to.have.property('error');
						expect(locationData).to.have.property('error_description');
						done();
					} else {
						done(err);
					}
				});
		});
	});
	it('it should get 401 if no Authorization', (done) => {
		getConfig().then((config) => {
			let urlData = url.parse(config['authorization_endpoint']);
			chai
				.request(service)
				.get(urlData.path + '?' + querystring.stringify(params))
				.redirects(0)
				.then((res) => {
					done(new Error('This should be broken'));
				})
				.catch((err) => {
					if (err.status === 401) {
						done();
					} else {
						done(err);
					}
				});
		});
	});
	it('it should get 401 if wrong password', (done) => {
		getConfig().then((config) => {
			let urlData = url.parse(config['authorization_endpoint']);
			chai
				.request(service)
				.get(urlData.path + '?' + querystring.stringify(params))
				.redirects(0)
				.set('Authorization', 'Basic ' + new Buffer('test:tset').toString('base64'))
				.then((res) => {
					done(new Error('This should be broken'));
				})
				.catch((err) => {
					if (err.status === 401) {
						done();
					} else {
						done(err);
					}
				});
		});
	});
	it('it should get 401 if http basic syntax is wrong', (done) => {
		getConfig().then((config) => {
			let urlData = url.parse(config['authorization_endpoint']);
			chai
				.request(service)
				.get(urlData.path + '?' + querystring.stringify(params))
				.redirects(0)
				.set('Authorization', 'Basic ' + new Buffer(':asd:asd').toString('base64'))
				.then((res) => {
					done(new Error('This should be broken'));
				})
				.catch((err) => {
					if (err.status === 401) {
						done();
					} else {
						done(err);
					}
				});
		});
	});
	it('it should auth with http basic', (done) => {
		getConfig().then((config) => {
			let urlData = url.parse(config['authorization_endpoint']);
			chai
				.request(service)
				.get(urlData.path + '?' + querystring.stringify(params))
				.redirects(0)
				.set('Authorization', 'Basic ' + new Buffer('test:test').toString('base64'))
				.then((res) => {
					done();
				})
				.catch((err) => {
					done(err);
				});
		});
	});
	it('it should auth with http post form', (done) => {
		getConfig().then((config) => {
			let urlData = url.parse(config['authorization_endpoint']);
			chai
				.request(service)
				.post(urlData.path + '?' + querystring.stringify(params))
				.redirects(0)
				.type('form')
				.send({
					username: 'test',
					password: 'test',
				})
				.then((res) => {
					done();
				})
				.catch((err) => {
					done(err);
				});
		});
	});
	it('it should auth with http post JSON', (done) => {
		getConfig().then((config) => {
			let urlData = url.parse(config['authorization_endpoint']);
			chai
				.request(service)
				.post(urlData.path + '?' + querystring.stringify(params))
				.redirects(0)
				.type('json')
				.send({
					username: 'test',
					password: 'test',
				})
				.then((res) => {
					done();
				})
				.catch((err) => {
					done(err);
				});
		});
	});
	it('test worng redirect url', (done) => {
		getConfig().then((config) => {
			let urlData = url.parse(config['authorization_endpoint']);
			let brokenData = Object.assign({}, params, {redirect_uri: 'this://is/broken'});
			chai
				.request(service)
				.post(urlData.path + '?' + querystring.stringify(brokenData))
				.redirects(0)
				.type('json')
				.send({
					username: 'test',
					password: 'test',
				})
				.then((res) => {
					done(new Error('This should be broken'));
				})
				.catch((err) => {
					if (err.status === 302) {
						let [redirectUri, queryString] = err.response.headers.location.split('?', 2);
						let errorData = querystring.parse(queryString);
						expect(redirectUri).to.be.equal(brokenData['redirect_uri']);
						expect(errorData).to.have.property('error');
						expect(errorData).to.have.property('error_description');
						expect(errorData).to.have.property('state').and.equal(params.state);
						done();
					} else {
						done(err);
					}
				});
		});
	});
	it('test broken scope', (done) => {
		getConfig().then((config) => {
			let urlData = url.parse(config['authorization_endpoint']);
			let brokenData = Object.assign({}, params, {scope: 'asdasd'});
			chai
				.request(service)
				.post(urlData.path + '?' + querystring.stringify(brokenData))
				.redirects(0)
				.type('json')
				.send({
					username: 'test',
					password: 'test',
				})
				.then((res) => {
					done(new Error('This should be broken'));
				})
				.catch((err) => {
					if (err.status === 302) {
						let [redirectUri, queryString] = err.response.headers.location.split('?', 2);
						let errorData = querystring.parse(queryString);
						expect(redirectUri).to.be.equal(brokenData['redirect_uri']);
						expect(errorData).to.have.property('error');
						expect(errorData).to.have.property('error_description');
						expect(errorData).to.have.property('state').and.equal(params.state);
						done();
					} else {
						done(err);
					}
				});
		});
	});	
});
