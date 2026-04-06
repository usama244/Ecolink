const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName:   { type: String, required: true, trim: true },
  lastName:    { type: String, required: true, trim: true },
  email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:    { type: String, required: true, minlength: 6 },
  role:        { type: String, enum: ['producer', 'consumer', 'admin'], default: 'producer' },
  company: {
    name:      { type: String, required: true },
    industry:  { type: String },
    location:  { type: String },
    website:   { type: String },
    logo:      { type: String },
    gstNumber: { type: String },
    description: { type: String },
  },
  verification: {
    status:    { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    documents: [{ name: String, url: String, uploadedAt: Date }],
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    notes:     String,
  },
  rating: {
    average: { type: Number, default: 0 },
    count:   { type: Number, default: 0 },
  },
  stats: {
    totalDeals:    { type: Number, default: 0 },
    totalRevenue:  { type: Number, default: 0 },
    wasteReused:   { type: Number, default: 0 },
    co2Saved:      { type: Number, default: 0 },
  },
  isActive:    { type: Boolean, default: true },
  lastLogin:   Date,
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublic = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
