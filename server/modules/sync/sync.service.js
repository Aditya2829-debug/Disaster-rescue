const Victim = require('../../models/Victim');
const SosSignal = require('../../models/SosSignal');
const { normalizeLocation } = require('../../utils/geo');

const COLLECTION_MAP = { victims: Victim, sos_signals: SosSignal };

const processBatch = async (items, userId) => {
  const success = [];
  const failed = [];

  for (const item of items) {
    const { localId, collection, operation, payload } = item;
    const Model = COLLECTION_MAP[collection];
    if (!Model) { failed.push({ localId, reason: 'Unknown collection' }); continue; }

    try {
      // Normalize location to GeoJSON
      const normalizedPayload = {
        ...payload,
        location: normalizeLocation(payload.location),
      };

      if (operation === 'CREATE') {
        await Model.findOneAndUpdate(
          { localId },
          { ...normalizedPayload, localId, reportedBy: userId || undefined, submittedBy: userId || null },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } else if (operation === 'UPDATE') {
        await Model.findOneAndUpdate({ localId }, normalizedPayload, { new: true });
      } else if (operation === 'DELETE') {
        await Model.findOneAndDelete({ localId });
      }
      success.push(localId);
    } catch (err) {
      failed.push({ localId, reason: err.message });
    }
  }
  return { success, failed };
};

module.exports = { processBatch };
