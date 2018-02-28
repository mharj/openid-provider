process.env.NODE_ENV = 'test';
let chai = require('chai');
const {expect} = require('chai');
let servicePromise = require('../service');
const url = require('url');
const jwt = require('jsonwebtoken');
const querystring = require('querystring');
let service = null;
chai.should();

/*
// build pub cert from n + e
var NodeRSA = require('node-rsa');
var key = new NodeRSA();
key.importKey({
	n: new Buffer('07uX5s5LJOqYlqGhnRhvjWzutchJ5Mqutb-YkLaLm53KWJFiE_H9VDlzNj-oF_CbMPEtsl_5fPCwv1BKSlYuS9pY-FKUZlHT3K0lRvVyEly4PCYOwy6b-Ell3Ame6_sVRedPoMwqFmCXniF8OZ_hyiQQyj0spRwZRauhpc2SJmL0xUxs6HPbdFJ0Pf1TlgrCWKIADzdAjpXy2cWUyTBoNsuFMn6tdffwT0WMV5gOIxU8Cqh-m_BJHrsVrloIrWBp6RTpnDwYf3IutyRO3pQU7LDzFxsLVFwyKLLWny8DV4MDd0H7E8dHz5FPFJURiCogaVbT8chtXWyCzhWLwQEp1w', 'base64'),
	e: new Buffer('AQAB', 'base64'),
}, 'components-public');
console.log(key.exportKey('pkcs8-public'));
*/

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
let certCache = null;
function getCerts(urlStr) {
	const url = require('url');
	let urlData = url.parse(urlStr);
	return certCache
		? Promise.resolve(certCache)
		: chai
			.request(service)
			.get(urlData.path)
			.then((res) => {
				certCache = res.body;
				return Promise.resolve(certCache);
			});
}

describe('token tests', () => {
	before( function(done) {
		this.timeout(5000);
		servicePromise()
			.then( (s) => {
				service = s;
				return getConfig();
			})
			.then( (config) => {
				return getCerts(config.jwks_uri);
			})
			.then( (certs) => {
				done();
			});
	});
	it('it should get code token', (done) => {
		let authEndpoint = url.parse(configCache['authorization_endpoint']);
		let tokenEndpoint = url.parse(configCache['token_endpoint']);
		let params = {
			scope: 'openid profile',
			response_type: 'code',
			client_id: 'unit_test',
			redirect_uri: 'http://localhost',
			state: '123456789',
		};
		chai
			.request(service)
			.get(authEndpoint.path + '?' + querystring.stringify(params))
			.redirects(0)
			.set('Authorization', 'Basic ' + new Buffer('test:test').toString('base64'))
			.then((res) => {
				done(new Error('This should be broken'));
			})
			.catch((err) => {
				if (err.status === 302) {
					let [redirectUri, queryString] = err.response.headers.location.split('?', 2);
					let data = querystring.parse(queryString);
					let params = {
						grant_type: 'authorization_code',
						code: data.code,
						redirect_uri: 'http://localhost',
					};
//					console.log(tokenEndpoint.path + '?' + querystring.stringify(params));
					chai
						.request(service)
						.post(tokenEndpoint.path + '?' + querystring.stringify(params))
						.redirects(0)
						.then((res) => {
//							console.log(res.body);
							console.log( jwt.decode(res.body.id_token, {complete: true}) );
							done();
						});
				} else {
					done(err);
				}
			});
	});
});
