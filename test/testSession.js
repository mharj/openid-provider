process.env.NODE_ENV = 'test';
let chai = require('chai');
const Session = require('../modules/session');
const {expect} = require('chai');
chai.should();

let sessions = [];
describe('session tests', () => {
	it('it should create new session', (done) => {
		let ses = new Session();
		ses.set('test', 'value');
		sessions.push(ses);
		expect(ses.get('test')).to.be.a('string');
		done();
	});
	it('it should store new session', (done) => {
		let ses = new Session();
		ses.set('test', 'value');
		sessions.push(ses);
		expect(ses.get('test')).to.be.a('string');
		ses.save().then(() => {
			done();
		});
	});
	it('it should load old session', (done) => {
		Session.load(sessions[1].id).then( (ses) => {
			expect(ses.get('test')).to.be.a('string');
			done();
		});
	});
	after((done) => {
		Promise.all(sessions.map((ses) => ses.delete())).then(() => {
			done();
		});
	});
});
