const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { generateAIData, classifyWaste, calcImpact, getMarketInsights, WASTE_KB, INDUSTRY_AFFINITY } = require('../services/aiEngine');

// POST /api/ai/classify — classify waste and get AI suggestions
router.post('/classify', protect, async (req, res) => {
  try {
    const { category, quantity, unit, description } = req.body;
    const resolvedCategory = category || classifyWaste(description || '');
    const data = generateAIData(resolvedCategory, quantity, unit);
    res.json({ ...data, category: resolvedCategory });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ai/impact — calculate environmental impact
router.post('/impact', protect, async (req, res) => {
  try {
    const { quantity, category } = req.body;
    const impact = calcImpact(quantity, category);
    res.json(impact);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/ai/market/:category — market insights for a waste category
router.get('/market/:category', protect, async (req, res) => {
  try {
    const insights = getMarketInsights(req.params.category);
    if (!insights) return res.status(404).json({ message: 'Category not found' });
    res.json(insights);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/ai/categories — list all supported waste categories
router.get('/categories', (req, res) => {
  const categories = Object.entries(WASTE_KB).map(([key, kb]) => ({
    key,
    label:       key.charAt(0).toUpperCase() + key.slice(1),
    marketRate:  `Rs.${kb.priceRange[0]}–Rs.${kb.priceRange[1]}/tonne`,
    impactScore: kb.impactScore,
    topUse:      kb.uses[0],
  }));
  res.json({ categories });
});

// GET /api/ai/industries — list all supported industries with their waste needs
router.get('/industries', (req, res) => {
  const industries = Object.entries(INDUSTRY_AFFINITY).map(([industry, affinities]) => ({
    industry,
    topNeeds: affinities
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([cat, aff]) => ({ category: cat, affinity: Math.round(aff * 100) })),
  }));
  res.json({ industries });
});

// POST /api/ai/generate-description — generate AI description for waste listing
router.post('/generate-description', protect, async (req, res) => {
  try {
    const { wasteType, category, condition, quantity, unit, location } = req.body;
    
    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const kb = WASTE_KB[category];
    if (!kb) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    // Generate a professional description based on the waste details
    const conditionText = {
      clean: 'clean and sorted',
      mixed: 'mixed',
      contaminated: 'contaminated',
      processed: 'pre-processed'
    }[condition] || condition;

    const locationText = location?.city && location?.state 
      ? ` Located in ${location.city}, ${location.state}.`
      : '';

    const quantityText = quantity && unit 
      ? `Available quantity: ${quantity} ${unit}.`
      : '';

    const useCases = kb.uses.slice(0, 3).join(', ');
    const priceRange = `₹${kb.priceRange[0].toLocaleString('en-IN')}–₹${kb.priceRange[1].toLocaleString('en-IN')}`;

    const description = `High-quality ${wasteType || category} waste in ${conditionText} condition. ${quantityText} Ideal for ${useCases}. This material has been verified and is ready for immediate pickup and processing.${locationText} Market rate: ${priceRange}/tonne. Environmental impact score: ${kb.impactScore}/100. Proper handling and transportation documentation available upon request.`;

    res.json({ description });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
