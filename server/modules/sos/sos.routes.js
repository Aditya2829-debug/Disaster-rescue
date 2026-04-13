const router = require('express').Router();
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');
const rbac = require('../../middleware/rbac');
const validate = require('../../middleware/validate');
const { submitSosSchema, updateSosStatusSchema } = require('../../validations/sos.validation');
const { submit, getAll, updateStatus } = require('./sos.controller');

// Optional auth — civilians can submit SOS without logging in
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try { req.user = jwt.verify(token, process.env.JWT_SECRET); } catch { /* anonymous ok */ }
  }
  next();
};

router.post('/', optionalAuth, validate(submitSosSchema), submit);
router.get('/', auth, rbac('command', 'admin'), getAll);
router.patch('/:id/status', auth, rbac('command', 'admin'), validate(updateSosStatusSchema), updateStatus);

module.exports = router;
