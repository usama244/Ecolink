const router = require('express').Router();
const Deal = require('../models/Deal');
const Match = require('../models/Match');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { calcImpact } = require('../services/aiEngine');

// GET /api/deals — get all deals for current user
router.get('/', protect, async (req, res) => {
  try {
    const field = req.user.role === 'producer' ? 'producer' : 'consumer';
    const deals = await Deal.find({ [field]: req.user._id })
      .populate('listing', 'wasteType category quantity unit')
      .populate('producer', 'firstName lastName company')
      .populate('consumer', 'firstName lastName company')
      .sort({ updatedAt: -1 });
    res.json({ deals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/deals/:id — full deal with messages
router.get('/:id', protect, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('listing')
      .populate('producer', 'firstName lastName company rating')
      .populate('consumer', 'firstName lastName company rating')
      .populate('messages.sender', 'firstName lastName role');
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    res.json({ deal });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/deals — consumer initiates deal from a match
router.post('/', protect, async (req, res) => {
  try {
    const { matchId, listingId, producerId, message } = req.body;
    const deal = await Deal.create({
      match: matchId,
      listing: listingId,
      producer: producerId,
      consumer: req.user._id,
      messages: message ? [{ sender: req.user._id, text: message }] : [],
    });
    if (matchId) await Match.findByIdAndUpdate(matchId, { status: 'deal_sent' });
    res.status(201).json({ deal });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/deals/:id/message — send a message
router.post('/:id/message', protect, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    deal.messages.push({ sender: req.user._id, text: req.body.text, type: req.body.type || 'text', proposal: req.body.proposal });
    if (req.body.type === 'proposal') deal.status = 'proposed';
    await deal.save();
    res.json({ deal });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/deals/:id/accept
router.patch('/:id/accept', protect, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    deal.status = 'accepted';
    deal.finalTerms = req.body.terms || deal.finalTerms;
    deal.impact = calcImpact(deal.finalTerms?.quantity, deal.finalTerms?.pricePerUnit);
    deal.messages.push({ sender: req.user._id, text: '✅ Deal accepted!', type: 'system' });
    await deal.save();

    // Update user stats
    await User.findByIdAndUpdate(deal.producer, { $inc: { 'stats.totalDeals': 1, 'stats.totalRevenue': deal.finalTerms?.totalValue || 0, 'stats.wasteReused': deal.finalTerms?.quantity || 0, 'stats.co2Saved': deal.impact?.co2Saved || 0 } });
    await User.findByIdAndUpdate(deal.consumer, { $inc: { 'stats.totalDeals': 1 } });

    res.json({ deal });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/deals/:id/reject
router.patch('/:id/reject', protect, async (req, res) => {
  try {
    const deal = await Deal.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    res.json({ deal });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/deals/:id/rate
router.post('/:id/rate', protect, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    const { score, comment } = req.body;
    const isProducer = deal.producer.toString() === req.user._id.toString();
    const ratingKey = isProducer ? 'producerRating' : 'consumerRating';
    deal.ratings[ratingKey] = { score, comment, ratedAt: new Date() };
    await deal.save();

    // Update rated user's average
    const ratedUserId = isProducer ? deal.consumer : deal.producer;
    const ratedUser = await User.findById(ratedUserId);
    const newCount = ratedUser.rating.count + 1;
    const newAvg = ((ratedUser.rating.average * ratedUser.rating.count) + score) / newCount;
    await User.findByIdAndUpdate(ratedUserId, { 'rating.average': Math.round(newAvg * 10) / 10, 'rating.count': newCount });

    res.json({ message: 'Rating submitted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
