const Victim = require('../../models/Victim');
const { normalizeLocation } = require('../../utils/geo');

const getAll = () =>
  Victim.find().sort({ createdAt: -1 }).populate('reportedBy', 'name role');

const create = async (data, userId) => {
  const victim = new Victim({
    ...data,
    location: normalizeLocation(data.location),
    reportedBy: userId,
  });
  return victim.save();
};

const update = async (id, data) => {
  const updates = { ...data };
  if (data.location) updates.location = normalizeLocation(data.location);
  return Victim.findByIdAndUpdate(id, updates, { new: true });
};

module.exports = { getAll, create, update };
