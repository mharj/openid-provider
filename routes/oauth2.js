const {Router} = require('express');
const v1Auth = require('./authorization/v1');
const v1JwsCerts = require('./jwtcerts/v1');
let router = new Router();

router.use('/v1/auth', v1Auth);
router.use('/v1/certs', v1JwsCerts);

module.exports = router;

