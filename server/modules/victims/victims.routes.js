const router = require('express').Router();
const auth = require('../../middleware/auth');
const rbac = require('../../middleware/rbac');
const validate = require('../../middleware/validate');
const { createVictimSchema, updateVictimSchema } = require('../../validations/victims.validation');
const { getAll, create, update } = require('./victims.controller');

router.get('/', auth, rbac('field_worker', 'command', 'admin'), getAll);
router.post('/', auth, rbac('field_worker', 'admin'), validate(createVictimSchema), create);
router.patch('/:id', auth, rbac('field_worker', 'command', 'admin'), validate(updateVictimSchema), update);

module.exports = router;
