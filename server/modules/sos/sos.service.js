const SosSignal = require('../../models/SosSignal');
const { normalizeLocation } = require('../../utils/geo');

const submit = async (data, userId) => {
  const sos = new SosSignal({
    ...data,
    location: normalizeLocation(data.location),
    submittedBy: userId || null,
  });
  return sos.save();
};

const getAll = () => SosSignal.find().sort({ timestamp: -1 });

const updateStatus = async (id, status) =>
  SosSignal.findByIdAndUpdate(id, { status }, { new: true });

module.exports = { submit, getAll, updateStatus };
