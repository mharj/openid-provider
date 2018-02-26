const express = require('express');
const router = express.Router();
const v1Auth = require('./authorization/v1');

router.use('/v1/auth', v1Auth);

module.exports = router;
