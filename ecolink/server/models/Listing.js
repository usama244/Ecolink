const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  producer:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wasteType:   { type: String, required: true },
  category:    { type: String, required: true }, // steel, copper, plastic, etc.
  condition:   { type: String, enum: ['clean', 'mixed', 'contaminated', 'processed'], default: 'clean' },
  quantity:    { type: Number, required: true },
  unit:        { type: String, enum: ['tonnes', 'kg', 'litres', 'units'], default: 'tonnes' },
  pricePerUnit:{ type: Number },
  currency:    { type: String, default: 'USD' },
  negotiable:  { type: Boolean, default: true },
  availability:{ type: String, enum: ['immediate', 'week', 'month', 'recurring'], default: 'immediate' },
  location: {
    address:   String,
    city:      String,
    state:     String,
    country:   String,
    coordinates: { lat: Number, lng: Number },
  },
  description: String,
  images:      [String],
  aiData: {
    caption:       String,   // GenAI generated caption
    suggestedUses: [String], // AI suggested uses
    marketRate:    String,
    impactScore:   Number,   // 0-100 environmental impact
  },
  status:      { type: String, enum: ['draft', 'active', 'paused', 'sold', 'expired'], default: 'active' },
  moderationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  moderationNote: String,
  views:       { type: Number, default: 0 },
  matchCount:  { type: Number, default: 0 },
  expiresAt:   Date,
}, { timestamps: true });

listingSchema.index({ category: 1, status: 1 });
listingSchema.index({ 'location.city': 1 });
listingSchema.index({ producer: 1 });

module.exports = mongoose.model('Listing', listingSchema);
