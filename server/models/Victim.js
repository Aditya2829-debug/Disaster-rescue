const mongoose = require('mongoose');

const VictimSchema = new mongoose.Schema({
  localId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    required: true,
  },
  status: {
    type: String,
    enum: ['reported', 'in_progress', 'rescued', 'deceased'],
    default: 'reported',
  },
  notes: { type: String, maxlength: 500 },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

VictimSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Victim', VictimSchema);
