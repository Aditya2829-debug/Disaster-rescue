const mongoose = require('mongoose');

const SosSignalSchema = new mongoose.Schema({
  localId: { type: String, required: true, unique: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  emergencyType: {
    type: String,
    enum: ['medical', 'fire', 'trapped', 'flood', 'other'],
    required: true,
  },
  message: { type: String, maxlength: 200 },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium'],
    default: 'high',
  },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'resolved'],
    default: 'pending',
  },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

SosSignalSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('SosSignal', SosSignalSchema);
