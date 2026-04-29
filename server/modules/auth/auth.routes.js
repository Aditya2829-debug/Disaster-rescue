const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { register, login } = require('./auth.controller');
const { firebaseAuth } = require('./firebase.controller');
const validate = require('../../middleware/validate');
const { registerSchema, loginSchema } = require('../../validations/auth.validation');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Please try again later.' },
});

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/firebase', authLimiter, firebaseAuth);

module.exports = router;
