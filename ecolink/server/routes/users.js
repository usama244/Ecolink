const router = require('express').Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
  res.json({ user: req.user });
});

// PATCH /api/users/profile
router.patch('/profile', protect, async (req, res) => {
  try {
    const allowed = ['firstName', 'lastName', 'company'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/users/password
router.patch('/password', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!(await user.comparePassword(req.body.currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    user.password = req.body.newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/:id/public
router.get('/:id/public', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('firstName lastName company rating verification.status stats createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
