const etag = require('etag');
const {Router} = require('express');
const Session = require('../../modules/session');
const {getPrivateCert} = require('../../modules/cert');
const jwt = require('jsonwebtoken');
let router = new Router();

router.get('/', (req, res) => {
	const data = JSON.stringify({test: 'asd'}, null, 1);
	res.set('Content-Type', 'application/json');
	res.set('ETag', etag(data));
	res.send(data).end();
});
router.post('/', (req, res) => {
	const {code} = req.query;
	Promise.all([
		Session.getWithCode(code),
		getPrivateCert(),
	]).then( (pd) => {
		const [ses, certObject] = pd;
		const {kid, cert} = certObject;
		const tokenData = {
			access_token: 'SlAV32hkKG',
			token_type: 'Bearer',
			refresh_token: '8xLOxBtZp8',
			expires_in: 3600,
			id_token: jwt.sign(ses.get('id_payload'), cert, {algorithm: 'RS256', keyid: kid}),
		};
		const data = JSON.stringify(tokenData, null, 1);
		res.set('Content-Type', 'application/json');
		res.set('ETag', etag(data));
		res.send(data).end();
	});
});
module.exports = router;
