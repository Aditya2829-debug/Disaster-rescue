const service = require('./sync.service');

const sync = async (req, res, next) => {
  try {
    const result = await service.processBatch(req.body.items || [], req.user?.id);
    res.json(result);
  } catch (err) { next(err); }
};

module.exports = { sync };
