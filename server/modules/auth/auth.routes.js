const router = require('express').Router();
const { register, login } = require('./auth.controller');
const validate = require('../../middleware/validate');
const { registerSchema, loginSchema } = require('../../validations/auth.validation');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

module.exports = router;
