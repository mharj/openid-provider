const etag = require('etag');
const {Router} = require('express');
let router = new Router();
const {getCerts} = require('../../modules/cert');

let keys = getCerts();

router.get('/', (req, res) => {
	const data = JSON.stringify({keys}, null, 1);
	res.set('Content-Type', 'application/json');
	res.set('ETag', etag(data));
	res.send(data).end();
});

module.exports = router;
