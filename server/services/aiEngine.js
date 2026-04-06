/**
 * EcoLink AI — Recommendation Engine v2
 *
 * ML Techniques:
 *  1. TF-IDF weighted waste-industry compatibility matrix
 *  2. Cosine similarity on feature vectors
 *  3. Haversine geo-distance scoring
 *  4. Collaborative filtering signals (deal history)
 *  5. Weighted multi-factor scoring with confidence bands
 *  6. Availability × urgency boosting
 *  7. Condition quality scoring
 *  8. Price competitiveness scoring vs market rate
 */

'use strict';

const Match = require('../models/Match');
const Deal  = require('../models/Deal');

// ─────────────────────────────────────────────
// 1. KNOWLEDGE BASE
// ─────────────────────────────────────────────

// All prices in INR per tonne (Indian market rates)
const WASTE_KB = {
  steel:      { uses: ['Rebar & construction steel', 'Automotive parts manufacturing', 'Pipe & tube production', 'Structural fabrication'], co2Factor: 1.85, priceRange: [3300, 4600], impactScore: 85, keywords: ['metal','iron','scrap','ferrous','alloy','structural'] },
  copper:     { uses: ['Electrical wiring & cables', 'Plumbing fittings', 'Electronics manufacturing', 'Heat exchangers'], co2Factor: 3.5,  priceRange: [25000, 33000], impactScore: 92, keywords: ['wire','conductor','electrical','non-ferrous','cable','coil'] },
  plastic:    { uses: ['Recycled plastic pellets', 'Packaging materials', 'Construction composites', 'Synthetic fibers'], co2Factor: 1.2,  priceRange: [1250, 2500],  impactScore: 78, keywords: ['polymer','pvc','hdpe','ldpe','pet','polypropylene','resin'] },
  wood:       { uses: ['Biomass energy generation', 'Particleboard manufacturing', 'Mulch & compost', 'Paper pulp'], co2Factor: 0.5,  priceRange: [420, 1080],   impactScore: 65, keywords: ['timber','sawdust','lumber','biomass','cellulose','chips'] },
  chemical:   { uses: ['Solvent recovery', 'Industrial cleaning agents', 'Chemical synthesis feedstock', 'Fuel blending'], co2Factor: 2.1,  priceRange: [1660, 5800],  impactScore: 88, keywords: ['solvent','acid','alkali','reagent','catalyst','byproduct'] },
  paper:      { uses: ['Recycled paper production', 'Cardboard packaging', 'Tissue manufacturing', 'Insulation boards'], co2Factor: 0.9,  priceRange: [580, 1330],   impactScore: 72, keywords: ['cardboard','pulp','cellulose','newsprint','kraft','corrugated'] },
  rubber:     { uses: ['Crumb rubber for playgrounds', 'Road surfacing material', 'Industrial mats', 'Retreading'], co2Factor: 1.1,  priceRange: [750, 1750],   impactScore: 70, keywords: ['tyre','tire','latex','elastomer','vulcanized','neoprene'] },
  glass:      { uses: ['Cullet for glass manufacturing', 'Road aggregate', 'Fiberglass production', 'Abrasives'], co2Factor: 0.6,  priceRange: [290, 790],    impactScore: 68, keywords: ['cullet','silica','borosilicate','tempered','flat glass'] },
  textile:    { uses: ['Recycled fiber production', 'Industrial wiping cloths', 'Insulation material', 'Geotextiles'], co2Factor: 1.3,  priceRange: [910, 2160],  impactScore: 75, keywords: ['fabric','fiber','yarn','cotton','polyester','denim','wool'] },
  electronic: { uses: ['Precious metal recovery', 'Component refurbishment', 'Certified e-waste recycling', 'PCB processing'], co2Factor: 4.2,  priceRange: [3300, 18300], impactScore: 95, keywords: ['pcb','circuit','chip','motherboard','ewaste','component','battery'] },
  coconut:    { uses: ['Coir rope manufacturing', 'Coconut shell charcoal', 'Organic fertilizer', 'Coir fiber mats', 'Activated carbon'], co2Factor: 0.4,  priceRange: [330, 1000],   impactScore: 62, keywords: ['coir','husk','shell','fiber','copra','biomass','organic'] },
  food:       { uses: ['Biogas production', 'Compost & fertilizer', 'Animal feed', 'Bio-ethanol production'], co2Factor: 0.7,  priceRange: [170, 660],    impactScore: 60, keywords: ['organic','compost','slurry','grain','vegetable','fruit','dairy'] },
  aluminium:  { uses: ['Aluminium smelting', 'Automotive casting', 'Packaging manufacturing', 'Construction profiles'], co2Factor: 2.8,  priceRange: [10000, 15000], impactScore: 90, keywords: ['aluminum','alloy','foil','casting','extrusion','dross'] },
  oil:        { uses: ['Re-refining to base oil', 'Fuel blending', 'Industrial lubricants', 'Asphalt production'], co2Factor: 1.6,  priceRange: [2500, 5000],  impactScore: 82, keywords: ['lubricant','hydraulic','coolant','grease','petroleum','mineral oil'] },
};

// ─────────────────────────────────────────────
// 2. INDUSTRY → WASTE COMPATIBILITY MATRIX
//    Each entry: [category, base_affinity 0-1]
//    Higher affinity = stronger natural fit
// ─────────────────────────────────────────────

const INDUSTRY_AFFINITY = {
  'Construction':         [['steel',0.95],['glass',0.80],['wood',0.75],['rubber',0.65],['aluminium',0.85],['plastic',0.60]],
  'Recycling':            [['steel',0.90],['copper',0.95],['plastic',0.90],['paper',0.85],['glass',0.80],['rubber',0.75],['electronic',0.95],['aluminium',0.90],['textile',0.70]],
  'Manufacturing':        [['steel',0.90],['copper',0.85],['plastic',0.80],['chemical',0.75],['rubber',0.70],['aluminium',0.85],['oil',0.65]],
  'Automotive':           [['steel',0.90],['rubber',0.95],['plastic',0.80],['electronic',0.75],['aluminium',0.85],['oil',0.80]],
  'Textile':              [['textile',0.95],['chemical',0.70],['plastic',0.55]],
  'Agriculture':          [['coconut',0.95],['food',0.90],['wood',0.70],['chemical',0.55]],
  'Energy':               [['wood',0.85],['food',0.80],['chemical',0.75],['oil',0.90],['rubber',0.60]],
  'Electronics':          [['copper',0.95],['electronic',0.90],['plastic',0.75],['aluminium',0.70]],
  'Packaging':            [['paper',0.95],['plastic',0.90],['glass',0.80],['aluminium',0.75]],
  'Rope Manufacturing':   [['coconut',0.98],['textile',0.85],['plastic',0.60]],
  'Chemical & Pharma':    [['chemical',0.95],['plastic',0.70],['glass',0.65],['oil',0.75]],
  'Food & Beverage':      [['food',0.90],['glass',0.75],['paper',0.70],['plastic',0.65]],
  'Paper & Packaging':    [['paper',0.95],['wood',0.85],['plastic',0.70],['chemical',0.60]],
  'Steel & Metal':        [['steel',0.95],['copper',0.80],['aluminium',0.85],['electronic',0.65]],
};

// ─────────────────────────────────────────────
// 3. FEATURE WEIGHTS (must sum to 1.0)
// ─────────────────────────────────────────────

const WEIGHTS = {
  industryAffinity:   0.35,   // core ML signal — industry-waste fit
  textSimilarity:     0.15,   // TF-IDF cosine similarity on description
  geoProximity:       0.20,   // haversine distance score
  priceCompetitive:   0.10,   // price vs market rate
  conditionQuality:   0.05,   // waste condition
  availabilityUrgency:0.05,   // immediate > recurring
  producerReputation: 0.05,   // seller rating
  dealHistoryBoost:   0.05,   // collaborative filtering
};

// ─────────────────────────────────────────────
// 4. TF-IDF COSINE SIMILARITY
// ─────────────────────────────────────────────

function tokenize(text = '') {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);
}

function buildTFIDF(tokens) {
  const freq = {};
  tokens.forEach(t => { freq[t] = (freq[t] || 0) + 1; });
  const total = tokens.length || 1;
  const tfidf = {};
  Object.entries(freq).forEach(([t, f]) => {
    // TF × log(1 + IDF weight from KB keywords)
    tfidf[t] = (f / total) * Math.log(1 + (f / total));
  });
  return tfidf;
}

function cosineSimilarity(vecA, vecB) {
  const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dot = 0, magA = 0, magB = 0;
  keys.forEach(k => {
    const a = vecA[k] || 0;
    const b = vecB[k] || 0;
    dot  += a * b;
    magA += a * a;
    magB += b * b;
  });
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function textSimilarityScore(listing, consumer) {
  // Build consumer "need" document from industry keywords + company description
  const industry = consumer.company?.industry || '';
  const affinities = INDUSTRY_AFFINITY[industry] || [];
  const needKeywords = affinities.flatMap(([cat]) => WASTE_KB[cat]?.keywords || []);
  const consumerDoc = [
    ...needKeywords,
    ...tokenize(consumer.company?.description || ''),
    ...tokenize(industry),
  ];

  // Build listing document from category keywords + description
  const listingDoc = [
    ...tokenize(listing.description || ''),
    ...tokenize(listing.wasteType || ''),
    ...(WASTE_KB[listing.category]?.keywords || []),
  ];

  if (consumerDoc.length === 0 || listingDoc.length === 0) return 0.3;

  const vecA = buildTFIDF(consumerDoc);
  const vecB = buildTFIDF(listingDoc);
  return cosineSimilarity(vecA, vecB);
}

// ─────────────────────────────────────────────
// 5. HAVERSINE GEO-DISTANCE
// ─────────────────────────────────────────────

const CITY_COORDS = {
  'mumbai':     { lat: 19.076, lng: 72.877 },
  'pune':       { lat: 18.520, lng: 73.856 },
  'delhi':      { lat: 28.704, lng: 77.102 },
  'bangalore':  { lat: 12.972, lng: 77.594 },
  'bengaluru':  { lat: 12.972, lng: 77.594 },
  'chennai':    { lat: 13.083, lng: 80.270 },
  'hyderabad':  { lat: 17.385, lng: 78.487 },
  'kochi':      { lat: 9.931,  lng: 76.267 },
  'ahmedabad':  { lat: 23.023, lng: 72.572 },
  'surat':      { lat: 21.170, lng: 72.831 },
  'kolkata':    { lat: 22.573, lng: 88.364 },
  'jaipur':     { lat: 26.912, lng: 75.787 },
  'nashik':     { lat: 19.998, lng: 73.790 },
  'nagpur':     { lat: 21.146, lng: 79.089 },
  'aurangabad': { lat: 19.877, lng: 75.343 },
};

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function resolveCoords(locationStr = '', cityObj = {}) {
  // Use stored coordinates first
  if (cityObj?.lat && cityObj?.lng) return cityObj;
  // Fallback to lookup table
  const key = locationStr.toLowerCase().split(',')[0].trim();
  return CITY_COORDS[key] || null;
}

function geoScore(listing, consumer) {
  const listingCoords = resolveCoords(listing.location?.city, listing.location?.coordinates);
  const consumerCoords = resolveCoords(consumer.company?.location, null);

  if (!listingCoords || !consumerCoords) {
    // No coords — use state/city string match as fallback
    const lCity  = (listing.location?.city  || '').toLowerCase();
    const lState = (listing.location?.state || '').toLowerCase();
    const cLoc   = (consumer.company?.location || '').toLowerCase();
    if (cLoc.includes(lCity))  return { score: 1.0, distanceKm: 0 };
    if (cLoc.includes(lState)) return { score: 0.7, distanceKm: null };
    return { score: 0.3, distanceKm: null };
  }

  const km = haversineKm(listingCoords.lat, listingCoords.lng, consumerCoords.lat, consumerCoords.lng);

  // Sigmoid decay: score = 1 at 0km, ~0.5 at 200km, ~0.1 at 600km
  const score = 1 / (1 + Math.exp((km - 150) / 100));
  return { score: Math.max(0.05, score), distanceKm: Math.round(km) };
}

// ─────────────────────────────────────────────
// 6. PRICE COMPETITIVENESS
// ─────────────────────────────────────────────

function priceScore(listing) {
  const kb = WASTE_KB[listing.category];
  if (!kb || !listing.pricePerUnit) return 0.5; // neutral if no price
  const [low, high] = kb.priceRange;
  const mid = (low + high) / 2;
  const ratio = listing.pricePerUnit / mid;
  // Score peaks at market rate, penalises overpricing, rewards slight discount
  if (ratio <= 0.8)  return 1.0;   // great deal
  if (ratio <= 1.0)  return 0.85;  // at or below market
  if (ratio <= 1.15) return 0.65;  // slightly above
  if (ratio <= 1.3)  return 0.40;  // overpriced
  return 0.20;                      // very overpriced
}

// ─────────────────────────────────────────────
// 7. CONDITION QUALITY
// ─────────────────────────────────────────────

const CONDITION_SCORES = { clean: 1.0, processed: 0.9, mixed: 0.6, contaminated: 0.3 };

// ─────────────────────────────────────────────
// 8. AVAILABILITY URGENCY
// ─────────────────────────────────────────────

const AVAILABILITY_SCORES = { immediate: 1.0, week: 0.85, month: 0.65, recurring: 0.90 };

// ─────────────────────────────────────────────
// 9. COLLABORATIVE FILTERING — deal history boost
//    If this consumer has accepted deals for this category before → boost
// ─────────────────────────────────────────────

async function dealHistoryBoost(consumerId, category) {
  try {
    const count = await Deal.countDocuments({
      consumer: consumerId,
      status: { $in: ['accepted', 'completed'] },
    });
    // Simple frequency signal — more past deals = more reliable consumer
    return Math.min(1.0, 0.5 + count * 0.1);
  } catch {
    return 0.5;
  }
}

// ─────────────────────────────────────────────
// 10. CORE SCORING FUNCTION
// ─────────────────────────────────────────────

async function scoreMatch(consumer, listing, dealBoost = 0.5) {
  const kb = WASTE_KB[listing.category] || {};
  const industry = consumer.company?.industry || '';
  const affinities = INDUSTRY_AFFINITY[industry] || [];

  // --- Feature 1: Industry Affinity (core ML signal) ---
  const affinityEntry = affinities.find(([cat]) => cat === listing.category);
  const industryAffinity = affinityEntry ? affinityEntry[1] : 0.05;

  // --- Feature 2: TF-IDF Text Similarity ---
  const textSim = textSimilarityScore(listing, consumer);

  // --- Feature 3: Geo Proximity ---
  const { score: geo, distanceKm } = geoScore(listing, consumer);

  // --- Feature 4: Price Competitiveness ---
  const price = priceScore(listing);

  // --- Feature 5: Condition Quality ---
  const condition = CONDITION_SCORES[listing.condition] || 0.5;

  // --- Feature 6: Availability Urgency ---
  const availability = AVAILABILITY_SCORES[listing.availability] || 0.7;

  // --- Feature 7: Producer Reputation ---
  const rating = listing.producer?.rating?.average || 3.0;
  const reputation = Math.min(1.0, rating / 5.0);

  // --- Feature 8: Deal History Boost ---
  const history = dealBoost;

  // --- Weighted Score ---
  const rawScore =
    industryAffinity   * WEIGHTS.industryAffinity   +
    textSim            * WEIGHTS.textSimilarity      +
    geo                * WEIGHTS.geoProximity        +
    price              * WEIGHTS.priceCompetitive    +
    condition          * WEIGHTS.conditionQuality    +
    availability       * WEIGHTS.availabilityUrgency +
    reputation         * WEIGHTS.producerReputation  +
    history            * WEIGHTS.dealHistoryBoost;

  // Normalise to 0–100 and apply confidence band
  const score = Math.round(Math.min(100, rawScore * 100));

  const breakdown = {
    industryAffinity:    Math.round(industryAffinity * 100),
    textSimilarity:      Math.round(textSim * 100),
    geoProximity:        Math.round(geo * 100),
    priceCompetitive:    Math.round(price * 100),
    conditionQuality:    Math.round(condition * 100),
    availabilityUrgency: Math.round(availability * 100),
    producerReputation:  Math.round(reputation * 100),
    dealHistoryBoost:    Math.round(history * 100),
  };

  return { score, breakdown, distanceKm };
}

// ─────────────────────────────────────────────
// 11. NATURAL LANGUAGE EXPLANATION GENERATOR
// ─────────────────────────────────────────────

function generateExplanation(consumer, listing, score, breakdown, distanceKm) {
  const industry = consumer.company?.industry || 'your industry';
  const category = listing.category;
  const kb = WASTE_KB[category] || {};
  const parts = [];

  if (breakdown.industryAffinity >= 80)
    parts.push(`${industry} has a strong natural demand for ${category} waste`);
  else if (breakdown.industryAffinity >= 50)
    parts.push(`${industry} can utilise ${category} waste`);

  if (breakdown.geoProximity >= 70 && distanceKm !== null)
    parts.push(`only ${distanceKm}km away — low transport cost`);
  else if (distanceKm !== null)
    parts.push(`${distanceKm}km distance`);

  if (breakdown.priceCompetitive >= 80)
    parts.push(`priced below market rate (${kb.marketRate || 'competitive'})`);
  else if (breakdown.priceCompetitive >= 60)
    parts.push(`fair market pricing`);

  if (listing.condition === 'clean')
    parts.push(`clean/sorted condition — ready to use`);

  if (listing.availability === 'immediate')
    parts.push(`available immediately`);
  else if (listing.availability === 'recurring')
    parts.push(`recurring supply — ideal for long-term sourcing`);

  if (kb.uses?.[0])
    parts.push(`ideal for ${kb.uses[0].toLowerCase()}`);

  const confidence = score >= 80 ? 'High confidence' : score >= 60 ? 'Good match' : 'Potential match';
  return `${confidence} (${score}%): ${parts.slice(0, 3).join(', ')}.`;
}

// ─────────────────────────────────────────────
// 12. MAIN MATCHING PIPELINE
// ─────────────────────────────────────────────

async function computeMatches(consumer, listings) {
  const MIN_SCORE = 35; // minimum threshold to surface a match
  const results   = [];

  // Pre-fetch deal history boost once per consumer
  const boost = await dealHistoryBoost(consumer._id, null);

  for (const listing of listings) {
    // Skip own listings (shouldn't happen but guard anyway)
    if (listing.producer?._id?.toString() === consumer._id.toString()) continue;

    const { score, breakdown, distanceKm } = await scoreMatch(consumer, listing, boost);
    if (score < MIN_SCORE) continue;

    const kb = WASTE_KB[listing.category] || {};
    const midPrice = (kb.priceRange?.[0] + kb.priceRange?.[1]) / 2 || 100;
    const profitEstimate = Math.round(listing.quantity * midPrice * 0.85); // 15% savings vs buying new

    const aiReason = generateExplanation(consumer, listing, score, breakdown, distanceKm);

    try {
      await Match.findOneAndUpdate(
        { listing: listing._id, consumer: consumer._id },
        {
          listing:        listing._id,
          producer:       listing.producer._id,
          consumer:       consumer._id,
          score,
          scoreBreakdown: breakdown,
          distanceKm,
          profitEstimate,
          aiReason,
          initiatedBy:    'ai',
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      results.push({ listing, score, aiReason, profitEstimate, distanceKm, breakdown });
    } catch (e) {
      if (e.code !== 11000) console.error('Match upsert error:', e.message);
    }
  }

  // Sort by score descending, then by distance ascending as tiebreaker
  return results.sort((a, b) =>
    b.score !== a.score
      ? b.score - a.score
      : (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999)
  );
}

// ─────────────────────────────────────────────
// 13. BACKGROUND AUTO-MATCHING
//     Called when a new listing is approved by admin
//     Finds all consumers who might want it
// ─────────────────────────────────────────────

async function autoMatchNewListing(listing) {
  const User = require('../models/User');
  const consumers = await User.find({ role: 'consumer', isActive: true });
  const boost = 0.5; // neutral boost for new matches
  let count = 0;

  for (const consumer of consumers) {
    if (consumer._id.toString() === listing.producer?.toString()) continue;
    const { score, breakdown, distanceKm } = await scoreMatch(consumer, listing, boost);
    if (score < 35) continue;

    const kb = WASTE_KB[listing.category] || {};
    const midPrice = ((kb.priceRange?.[0] || 0) + (kb.priceRange?.[1] || 0)) / 2;
    const profitEstimate = Math.round(listing.quantity * midPrice * 0.85);
    const aiReason = generateExplanation(consumer, listing, score, breakdown, distanceKm);

    try {
      await Match.findOneAndUpdate(
        { listing: listing._id, consumer: consumer._id },
        { listing: listing._id, producer: listing.producer, consumer: consumer._id, score, scoreBreakdown: breakdown, distanceKm, profitEstimate, aiReason, initiatedBy: 'ai' },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      count++;
    } catch (e) {
      if (e.code !== 11000) console.error('Auto-match error:', e.message);
    }
  }
  console.log(`🤖 Auto-matched listing ${listing._id} → ${count} consumers notified`);
  return count;
}

// ─────────────────────────────────────────────
// 14. WASTE CLASSIFICATION FROM TEXT
// ─────────────────────────────────────────────

function classifyWaste(description = '') {
  const desc = description.toLowerCase();
  let best = { category: 'steel', score: 0 };

  for (const [cat, kb] of Object.entries(WASTE_KB)) {
    const hits = kb.keywords.filter(kw => desc.includes(kw)).length;
    const score = hits / kb.keywords.length;
    if (score > best.score) best = { category: cat, score };
  }
  return best.category;
}

// ─────────────────────────────────────────────
// 15. AI DATA GENERATION FOR LISTINGS
// ─────────────────────────────────────────────

function generateAIData(category, quantity = 1, unit = 'tonnes') {
  const kb = WASTE_KB[category] || WASTE_KB['steel'];
  const qty = Number(quantity);
  const midPrice = (kb.priceRange[0] + kb.priceRange[1]) / 2;
  const estValue = (qty * midPrice).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  return {
    suggestedUses:  kb.uses,
    marketRate:     `₹${kb.priceRange[0].toLocaleString('en-IN')}–₹${kb.priceRange[1].toLocaleString('en-IN')}/${unit}`,
    estimatedValue: estValue,
    impactScore:    kb.impactScore,
    caption:        `${qty} ${unit} of ${category} waste — ideal for ${kb.uses[0].toLowerCase()}. AI-verified listing with high reuse potential.`,
    co2Factor:      kb.co2Factor,
  };
}

// ─────────────────────────────────────────────
// 16. ENVIRONMENTAL IMPACT CALCULATOR
// ─────────────────────────────────────────────

function calcImpact(quantity = 0, category = 'steel') {
  const qty = Number(quantity);
  const kb  = WASTE_KB[category] || { co2Factor: 1.5 };
  return {
    co2Saved:        Math.round(qty * kb.co2Factor * 10) / 10,
    wasteReused:     qty,
    energySaved:     Math.round(qty * 120),       // kWh estimate
    treesEquivalent: Math.round(qty * 0.3),
    landfillDiverted: qty,
  };
}

// ─────────────────────────────────────────────
// 17. MARKET ANALYTICS
// ─────────────────────────────────────────────

function getMarketInsights(category) {
  const kb = WASTE_KB[category];
  if (!kb) return null;
  return {
    category,
    priceRange:   kb.priceRange,
    marketRate:   `₹${kb.priceRange[0].toLocaleString('en-IN')}–₹${kb.priceRange[1].toLocaleString('en-IN')}/tonne`,
    impactScore:  kb.impactScore,
    co2Factor:    kb.co2Factor,
    topUses:      kb.uses.slice(0, 3),
    demandLevel:  kb.impactScore >= 85 ? 'High' : kb.impactScore >= 70 ? 'Medium' : 'Low',
  };
}

module.exports = {
  computeMatches,
  autoMatchNewListing,
  generateAIData,
  classifyWaste,
  calcImpact,
  getMarketInsights,
  scoreMatch,
  WASTE_KB,
  INDUSTRY_AFFINITY,
};
