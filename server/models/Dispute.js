const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  deal:        { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', required: true },
  raisedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  against:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason:      { type: String, required: true },
  description: { type: String, required: true },
  evidence:    [{ name: String, url: String }],
  status:      { type: String, enum: ['open', 'under_review', 'resolved', 'closed'], default: 'open' },
  priority:    { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  resolution:  String,
  resolvedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt:  Date,
  adminNotes:  [{ admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, note: String, createdAt: { type: Date, default: Date.now } }],
}, { timestamps: true });

module.exports = mongoose.model('Dispute', disputeSchema);
