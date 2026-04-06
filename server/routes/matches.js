const router  = require('express').Router();
const Match   = require('../models/Match');
const Listing = require('../models/Listing');
const { protect, authorize } = require('../middleware/auth');
const { computeMatches, scoreMatch, INDUSTRY_AFFINITY, WASTE_KB } = require('../services/aiEngine');

// GET /api/matches/producer — producer sees all consumers matched to their listings
router.get('/producer', protect, authorize('producer'), async (req, res) => {
  try {
    const matches = await Match.find({ producer: req.user._id })
      .populate('listing', 'wasteType category quantity unit location pricePerUnit')
      .populate('consumer', 'firstName lastName company rating verification.status stats')
      .sort({ score: -1 });
    res.json({ matches });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/matches/consumer — consumer sees AI-recommended listings
router.get('/consumer', protect, authorize('consumer'), async (req, res) => {
  try {
    const { minScore, category, maxDistance } = req.query;
    const filter = { consumer: req.user._id };
    if (minScore)    filter.score       = { $gte: Number(minScore) };
    if (maxDistance) filter.distanceKm  = { $lte: Number(maxDistance) };

    let matches = await Match.find(filter)
      .populate({
        path: 'listing',
        match: category ? { category } : {},
        populate: { path: 'producer', select: 'firstName lastName company rating verification.status stats' },
      })
      .sort({ score: -1 });

    // Remove matches where listing was filtered out
    matches = matches.filter(m => m.listing !== null);

    res.json({ matches, total: matches.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/matches/run — trigger full AI matching pipeline for logged-in consumer
router.post('/run', protect, authorize('consumer'), async (req, res) => {
  try {
    const listings = await Listing.find({ status: 'active', moderationStatus: 'approved' })
      .populate('producer', 'company rating verification.status');

    const newMatches = await computeMatches(req.user, listings);

    res.json({
      matches: newMatches,
      count:   newMatches.length,
      message: `AI found ${newMatches.length} matches for your industry (${req.user.company?.industry || 'General'})`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/matches/explain/:listingId — get detailed ML score explanation for a specific listing
router.get('/explain/:listingId', protect, authorize('consumer'), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId)
      .populate('producer', 'company rating');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    const { score, breakdown, distanceKm } = await scoreMatch(req.user, listing, 0.5);
    const kb = WASTE_KB[listing.category] || {};

    res.json({
      score,
      breakdown,
      distanceKm,
      weights: {
        industryAffinity:    '35% — how well your industry uses this waste',
        textSimilarity:      '15% — keyword match between listing and your needs',
        geoProximity:        '20% — distance-based transport cost estimate',
        priceCompetitive:    '10% — price vs current market rate',
        conditionQuality:    '5%  — waste condition (clean/mixed/contaminated)',
        availabilityUrgency: '5%  — how quickly waste is available',
        producerReputation:  '5%  — seller rating and deal history',
        dealHistoryBoost:    '5%  — your past deal activity',
      },
      marketInsights: {
        marketRate:  kb.marketRate || 'N/A',
        impactScore: kb.impactScore,
        topUses:     kb.uses?.slice(0, 3) || [],
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/matches/industry-map — what categories does this consumer's industry need?
router.get('/industry-map', protect, authorize('consumer'), async (req, res) => {
  try {
    const industry = req.user.company?.industry || '';
    const affinities = INDUSTRY_AFFINITY[industry] || [];
    const map = affinities.map(([cat, affinity]) => ({
      category: cat,
      affinity: Math.round(affinity * 100),
      marketRate: WASTE_KB[cat]?.marketRate,
      topUses: WASTE_KB[cat]?.uses?.slice(0, 2),
    }));
    res.json({ industry, affinityMap: map });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/matches/:id/status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    match.status = req.body.status;
    await match.save();
    res.json({ match });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
