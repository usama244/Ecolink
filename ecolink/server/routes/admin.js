const router = require('express').Router();
const User    = require('../models/User');
const Listing = require('../models/Listing');
const Deal    = require('../models/Deal');
const Dispute = require('../models/Dispute');
const { protect, authorize }       = require('../middleware/auth');
const { autoMatchNewListing }      = require('../services/aiEngine');

const guard = [protect, authorize('admin')];

// ---- STATS ----
router.get('/stats', guard, async (req, res) => {
  try {
    const [users, listings, deals, disputes] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Deal.countDocuments(),
      Dispute.countDocuments({ status: 'open' }),
    ]);
    const pendingVerifications = await User.countDocuments({ 'verification.status': 'pending' });
    const pendingListings = await Listing.countDocuments({ moderationStatus: 'pending' });
    const revenue = await Deal.aggregate([
      { $match: { status: 'accepted' } },
      { $group: { _id: null, total: { $sum: '$finalTerms.totalValue' } } }
    ]);
    res.json({ users, listings, deals, openDisputes: disputes, pendingVerifications, pendingListings, totalRevenue: revenue[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---- USER MANAGEMENT ----
router.get('/users', guard, async (req, res) => {
  try {
    const { role, verificationStatus, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (verificationStatus) filter['verification.status'] = verificationStatus;
    if (search) filter.$or = [
      { firstName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { 'company.name': new RegExp(search, 'i') },
    ];
    const total = await User.countDocuments(filter);
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    res.json({ users, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/users/:id/verify', guard, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, {
      'verification.status': status,
      'verification.notes': notes,
      'verification.reviewedBy': req.user._id,
      'verification.reviewedAt': new Date(),
    }, { new: true }).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/users/:id/toggle', guard, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.json({ isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---- LISTING MODERATION ----
router.get('/listings', guard, async (req, res) => {
  try {
    const { moderationStatus = 'pending', page = 1, limit = 20 } = req.query;
    const filter = { moderationStatus };
    const total = await Listing.countDocuments(filter);
    const listings = await Listing.find(filter)
      .populate('producer', 'firstName lastName company verification.status')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ listings, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/listings/:id/moderate', guard, async (req, res) => {
  try {
    const { moderationStatus, moderationNote } = req.body;
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { moderationStatus, moderationNote },
      { new: true }
    ).populate('producer', 'company rating');

    // 🤖 Auto-trigger AI matching when a listing is approved
    if (moderationStatus === 'approved') {
      setImmediate(() => autoMatchNewListing(listing));
    }

    res.json({ listing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---- DISPUTES ----
router.get('/disputes', guard, async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    const total = await Dispute.countDocuments(filter);
    const disputes = await Dispute.find(filter)
      .populate('raisedBy', 'firstName lastName company')
      .populate('against', 'firstName lastName company')
      .populate('deal', 'status finalTerms')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ disputes, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/disputes/:id', guard, async (req, res) => {
  try {
    const { status, resolution, note } = req.body;
    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });
    if (status) dispute.status = status;
    if (resolution) { dispute.resolution = resolution; dispute.resolvedBy = req.user._id; dispute.resolvedAt = new Date(); }
    if (note) dispute.adminNotes.push({ admin: req.user._id, note });
    await dispute.save();
    res.json({ dispute });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---- TRANSACTIONS ----
router.get('/transactions', guard, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const total = await Deal.countDocuments(filter);
    const deals = await Deal.find(filter)
      .populate('producer', 'firstName lastName company')
      .populate('consumer', 'firstName lastName company')
      .populate('listing', 'wasteType category')
      .select('-messages')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ deals, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
