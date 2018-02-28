process.env.NODE_ENV = 'test';
let chai = require('chai');
let chaiHttp = require('chai-http');
let servicePromise = require('../service');
let service = null;
chai.should();
chai.use(chaiHttp);


describe('GET /.well-known/openid-configuration', () => {
	before( function(done) {
		this.timeout(5000);
		servicePromise()
			.then( (s) => {
				service = s;
				done();
			});
	});
	it('it should GET OpenID config', (done) => {
		chai.request(service)
			.get('/.well-known/openid-configuration')
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				let o = res.body;
				o.should.have.property('issuer');
				o.should.have.property('authorization_endpoint');
				o.should.have.property('token_endpoint');
				o.should.have.property('userinfo_endpoint');
				o.should.have.property('revocation_endpoint');
				o.should.have.property('jwks_uri');
				done();
			});
	});
});
