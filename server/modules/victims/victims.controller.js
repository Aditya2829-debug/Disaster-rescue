const service = require('./victims.service');

const getAll = async (req, res, next) => {
  try { res.json(await service.getAll()); } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try { res.status(201).json(await service.create(req.body, req.user.id)); } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try { res.json(await service.update(req.params.id, req.body)); } catch (err) { next(err); }
};

module.exports = { getAll, create, update };
