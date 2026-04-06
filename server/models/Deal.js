const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:      { type: String, required: true },
  type:      { type: String, enum: ['text', 'proposal', 'system'], default: 'text' },
  proposal:  {
    quantity:     Number,
    pricePerUnit: Number,
    totalValue:   Number,
    currency:     String,
    deliveryDate: Date,
  },
}, { timestamps: true });

const dealSchema = new mongoose.Schema({
  match:       { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
  listing:     { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  producer:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  consumer:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:      { type: String, enum: ['negotiating', 'proposed', 'accepted', 'rejected', 'completed', 'disputed'], default: 'negotiating' },
  finalTerms: {
    quantity:     Number,
    pricePerUnit: Number,
    totalValue:   Number,
    currency:     { type: String, default: 'USD' },
    deliveryDate: Date,
  },
  messages:    [messageSchema],
  ratings: {
    producerRating:  { score: Number, comment: String, ratedAt: Date },
    consumerRating:  { score: Number, comment: String, ratedAt: Date },
  },
  impact: {
    co2Saved:    Number,
    wasteReused: Number,
  },
  completedAt: Date,
}, { timestamps: true });

dealSchema.index({ producer: 1, status: 1 });
dealSchema.index({ consumer: 1, status: 1 });

module.exports = mongoose.model('Deal', dealSchema);
