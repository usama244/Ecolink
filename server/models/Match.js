const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  listing:     { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  producer:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  consumer:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score:       { type: Number, required: true, min: 0, max: 100 }, // AI match score
  scoreBreakdown: {
    categoryMatch:  Number,
    locationScore:  Number,
    quantityMatch:  Number,
    priceMatch:     Number,
    ratingBonus:    Number,
  },
  distanceKm:  Number,
  profitEstimate: Number,
  aiReason:    String, // AI explanation for the match
  status:      { type: String, enum: ['pending', 'viewed', 'contacted', 'deal_sent', 'accepted', 'rejected'], default: 'pending' },
  initiatedBy: { type: String, enum: ['ai', 'consumer'], default: 'ai' },
}, { timestamps: true });

matchSchema.index({ listing: 1, consumer: 1 }, { unique: true });
matchSchema.index({ producer: 1, status: 1 });
matchSchema.index({ consumer: 1, status: 1 });

module.exports = mongoose.model('Match', matchSchema);
