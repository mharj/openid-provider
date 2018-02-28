const etag = require('etag');
const {Router} = require('express');
let router = new Router();


router.get('/', (req, res) => {
	const data = JSON.stringify({test: 'asd'}, null, 1);
	res.set('Content-Type', 'application/json');
	res.set('ETag', etag(data));
	res.send(data).end();
});

module.exports = router;
