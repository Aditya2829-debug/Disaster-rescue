const router = require('express').Router();
const auth = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { syncSchema } = require('../../validations/sync.validation');
const { sync } = require('./sync.controller');

router.post('/', auth, validate(syncSchema), sync);

module.exports = router;
