process.env.NODE_ENV = 'test';
let chai = require('chai');
const Session = require('../modules/session');
const {expect} = require('chai');
chai.should();

let session = null;

describe('session tests', () => {
	it('it should create new session', (done) => {
		let ses = new Session();
		ses.set('test', 'value');
		expect(ses.get('test')).to.be.a('string');
		done();
	});
	it('it should store new session', (done) => {
		let ses = new Session();
		ses.set('test', 'value');
		ses.set('code', 'test_debug');
		expect(ses.get('test')).to.be.a('string');
		ses.save().then(() => {
			session = ses;
			done();
		});
	});
	it('it should load old session', (done) => {
		Session.load(session.id).then( (ses) => {
			expect(ses.get('test')).to.be.a('string');
			done();
		});
	});
	it('it should load old session with code', (done) => {
		Session.getWithCode(session.data.code).then( (ses) => {
			expect(ses.get('test')).to.be.a('string');
			done();
		});
	});

	after((done) => {
		Session.list()
			.then( (sessions) => {
				Promise.all(sessions.map((ses) => ses.delete())).then(() => {
					done();
				});
			});
	});
});
