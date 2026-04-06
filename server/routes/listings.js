const router = require('express').Router();
const Listing = require('../models/Listing');
const { protect, authorize } = require('../middleware/auth');
const { generateAIData } = require('../services/aiEngine');

// GET /api/listings — public browse (consumers search here)
router.get('/', async (req, res) => {
  try {
    const { category, city, minQty, maxQty, status = 'active', page = 1, limit = 12 } = req.query;
    const filter = { status, moderationStatus: 'approved' };
    if (category) filter.category = category;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (minQty || maxQty) {
      filter.quantity = {};
      if (minQty) filter.quantity.$gte = Number(minQty);
      if (maxQty) filter.quantity.$lte = Number(maxQty);
    }

    const total = await Listing.countDocuments(filter);
    const listings = await Listing.find(filter)
      .populate('producer', 'firstName lastName company rating verification.status')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ listings, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/listings/my — producer's own listings
router.get('/my', protect, authorize('producer'), async (req, res) => {
  try {
    const listings = await Listing.find({ producer: req.user._id }).sort({ createdAt: -1 });
    res.json({ listings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/listings/:id
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('producer', 'firstName lastName company rating verification.status');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    listing.views += 1;
    await listing.save({ validateBeforeSave: false });
    res.json({ listing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/listings — producer creates listing
router.post('/', protect, authorize('producer'), async (req, res) => {
  try {
    const aiData = generateAIData(req.body.category, req.body.quantity, req.body.unit);
    const listing = await Listing.create({ ...req.body, producer: req.user._id, aiData });
    res.status(201).json({ listing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/listings/:id
router.patch('/:id', protect, authorize('producer'), async (req, res) => {
  try {
    const listing = await Listing.findOne({ _id: req.params.id, producer: req.user._id });
    if (!listing) return res.status(404).json({ message: 'Not found or unauthorized' });
    Object.assign(listing, req.body);
    await listing.save();
    res.json({ listing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/listings/:id
router.delete('/:id', protect, authorize('producer'), async (req, res) => {
  try {
    await Listing.findOneAndDelete({ _id: req.params.id, producer: req.user._id });
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
