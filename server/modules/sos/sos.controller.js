const service = require('./sos.service');

const submit = async (req, res, next) => {
  try { res.status(201).json(await service.submit(req.body, req.user?.id)); } catch (err) { next(err); }
};

const getAll = async (req, res, next) => {
  try { res.json(await service.getAll()); } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
  try { res.json(await service.updateStatus(req.params.id, req.body.status)); } catch (err) { next(err); }
};

module.exports = { submit, getAll, updateStatus };
