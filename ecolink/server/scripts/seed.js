/**
 * EcoLink AI — Seed Script
 * Creates diverse producers, consumers, and listings to exercise the ML engine
 */
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User     = require('../models/User');
const Listing  = require('../models/Listing');
const Match    = require('../models/Match');
const Deal     = require('../models/Deal');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecolink');
  console.log('✅ Connected to MongoDB');

  // Clean slate
  await Promise.all([User.deleteMany({}), Listing.deleteMany({}), Match.deleteMany({}), Deal.deleteMany({})]);
  console.log('🗑️  Cleared existing data');

  // ── ADMIN ──────────────────────────────────────────────────────────────────
  await User.create({
    firstName: 'Admin', lastName: 'EcoLink',
    email: 'admin@ecolink.ai', password: 'admin123',
    role: 'admin',
    company: { name: 'EcoLink AI Platform', industry: 'Technology', location: 'Mumbai' },
    verification: { status: 'verified' },
  });

  // ── PRODUCERS ──────────────────────────────────────────────────────────────
  const [p1, p2, p3, p4, p5] = await User.create([
    {
      firstName: 'Rajesh', lastName: 'Kumar',
      email: 'producer@ecolink.ai', password: 'producer123',
      role: 'producer',
      company: { name: 'SteelCo Industries', industry: 'Steel & Metal', location: 'Mumbai, Maharashtra', description: 'Large steel manufacturing plant producing ferrous scrap and iron offcuts daily.' },
      verification: { status: 'verified' },
      rating: { average: 4.8, count: 42 },
      stats: { totalDeals: 42, totalRevenue: 15400000, wasteReused: 248, co2Saved: 74 },
    },
    {
      firstName: 'Priya', lastName: 'Sharma',
      email: 'coconut@ecolink.ai', password: 'producer123',
      role: 'producer',
      company: { name: 'Kerala Coconut Co.', industry: 'Agriculture', location: 'Kochi, Kerala', description: 'Coconut processing unit generating coir fiber, husk, and shells in bulk.' },
      verification: { status: 'verified' },
      rating: { average: 4.6, count: 28 },
    },
    {
      firstName: 'Amit', lastName: 'Verma',
      email: 'plastic@ecolink.ai', password: 'producer123',
      role: 'producer',
      company: { name: 'PolyPack Industries', industry: 'Packaging', location: 'Pune, Maharashtra', description: 'Plastic packaging manufacturer with HDPE and PET polymer waste.' },
      verification: { status: 'verified' },
      rating: { average: 4.5, count: 19 },
    },
    {
      firstName: 'Sunita', lastName: 'Reddy',
      email: 'ewaste@ecolink.ai', password: 'producer123',
      role: 'producer',
      company: { name: 'TechDispose Ltd.', industry: 'Electronics', location: 'Bangalore, Karnataka', description: 'IT asset disposal company with PCBs, circuit boards, and electronic components.' },
      verification: { status: 'verified' },
      rating: { average: 4.9, count: 67 },
    },
    {
      firstName: 'Mohan', lastName: 'Das',
      email: 'wood@ecolink.ai', password: 'producer123',
      role: 'producer',
      company: { name: 'TimberCraft Mills', industry: 'Manufacturing', location: 'Nagpur, Maharashtra', description: 'Sawmill producing wood chips, sawdust, and timber offcuts from furniture manufacturing.' },
      verification: { status: 'pending' },
      rating: { average: 4.2, count: 11 },
    },
  ]);

  // ── CONSUMERS ──────────────────────────────────────────────────────────────
  const [c1, c2, c3, c4] = await User.create([
    {
      firstName: 'Anita', lastName: 'Patel',
      email: 'consumer@ecolink.ai', password: 'consumer123',
      role: 'consumer',
      company: { name: 'RopeCraft Manufacturing', industry: 'Rope Manufacturing', location: 'Pune, Maharashtra', description: 'Manufacturer of industrial ropes and coir-based products. Needs coconut fiber and textile waste.' },
      verification: { status: 'verified' },
      rating: { average: 4.9, count: 35 },
      stats: { totalDeals: 35 },
    },
    {
      firstName: 'Vikram', lastName: 'Singh',
      email: 'builder@ecolink.ai', password: 'consumer123',
      role: 'consumer',
      company: { name: 'BuildRight Construction', industry: 'Construction', location: 'Mumbai, Maharashtra', description: 'Infrastructure company sourcing recycled steel, glass, and rubber for construction projects.' },
      verification: { status: 'verified' },
      rating: { average: 4.7, count: 28 },
      stats: { totalDeals: 28 },
    },
    {
      firstName: 'Deepa', lastName: 'Nair',
      email: 'recycler@ecolink.ai', password: 'consumer123',
      role: 'consumer',
      company: { name: 'GreenCycle Recyclers', industry: 'Recycling', location: 'Chennai, Tamil Nadu', description: 'Full-spectrum recycling facility accepting metals, plastics, paper, and e-waste.' },
      verification: { status: 'verified' },
      rating: { average: 4.8, count: 52 },
      stats: { totalDeals: 52 },
    },
    {
      firstName: 'Arjun', lastName: 'Mehta',
      email: 'auto@ecolink.ai', password: 'consumer123',
      role: 'consumer',
      company: { name: 'AutoParts Forge', industry: 'Automotive', location: 'Pune, Maharashtra', description: 'Automotive parts manufacturer needing steel scrap, rubber, and aluminium for casting.' },
      verification: { status: 'verified' },
      rating: { average: 4.6, count: 21 },
      stats: { totalDeals: 21 },
    },
  ]);

  // ── LISTINGS ───────────────────────────────────────────────────────────────
  const listings = await Listing.create([
    {
      producer: p1._id, wasteType: 'Steel Scrap', category: 'steel',
      condition: 'clean', quantity: 25, unit: 'tonnes',
      pricePerUnit: 39800, currency: 'INR', negotiable: true, availability: 'immediate',
      location: { city: 'Mumbai', state: 'Maharashtra', country: 'India', coordinates: { lat: 19.076, lng: 72.877 } },
      description: 'Clean sorted steel scrap from manufacturing process. Ferrous alloy, low contamination.',
      status: 'active', moderationStatus: 'approved',
      aiData: { suggestedUses: ['Rebar & construction steel', 'Automotive parts', 'Pipe & tube production'], marketRate: 'Rs.33,000–Rs.46,000/tonne', impactScore: 85, caption: '25 tonnes of clean steel scrap — ideal for rebar production.' },
    },
    {
      producer: p1._id, wasteType: 'Copper Wire Scrap', category: 'copper',
      condition: 'clean', quantity: 5, unit: 'tonnes',
      pricePerUnit: 282000, currency: 'INR', negotiable: true, availability: 'week',
      location: { city: 'Mumbai', state: 'Maharashtra', country: 'India', coordinates: { lat: 19.076, lng: 72.877 } },
      description: 'Stripped copper wire from electrical installations. High purity, ready for smelting.',
      status: 'active', moderationStatus: 'approved',
      aiData: { suggestedUses: ['Electrical wiring & cables', 'Plumbing fittings', 'Electronics manufacturing'], marketRate: 'Rs.2,50,000–Rs.3,30,000/tonne', impactScore: 92, caption: '5 tonnes of copper wire — high-value recycling opportunity.' },
    },
    {
      producer: p2._id, wasteType: 'Coconut Fiber & Shells', category: 'coconut',
      condition: 'clean', quantity: 40, unit: 'tonnes',
      pricePerUnit: 6600, currency: 'INR', negotiable: true, availability: 'recurring',
      location: { city: 'Kochi', state: 'Kerala', country: 'India', coordinates: { lat: 9.931, lng: 76.267 } },
      description: 'Coconut husk fiber and shells from coconut processing. Recurring monthly supply of 40 tonnes.',
      status: 'active', moderationStatus: 'approved',
      aiData: { suggestedUses: ['Coir rope manufacturing', 'Coconut shell charcoal', 'Organic fertilizer', 'Coir fiber mats'], marketRate: 'Rs.3,300–Rs.10,000/tonne', impactScore: 62, caption: '40 tonnes of coconut fiber — perfect for coir rope manufacturing.' },
    },
    {
      producer: p3._id, wasteType: 'HDPE Plastic Waste', category: 'plastic',
      condition: 'mixed', quantity: 15, unit: 'tonnes',
      pricePerUnit: 16600, currency: 'INR', negotiable: true, availability: 'immediate',
      location: { city: 'Pune', state: 'Maharashtra', country: 'India', coordinates: { lat: 18.520, lng: 73.856 } },
      description: 'HDPE and PET polymer waste from packaging production. Mixed grades, sorted by type.',
      status: 'active', moderationStatus: 'approved',
      aiData: { suggestedUses: ['Recycled plastic pellets', 'Packaging materials', 'Construction composites'], marketRate: 'Rs.12,500–Rs.25,000/tonne', impactScore: 78, caption: '15 tonnes of HDPE plastic — ready for pelletizing.' },
    },
    {
      producer: p4._id, wasteType: 'PCB & Electronic Components', category: 'electronic',
      condition: 'processed', quantity: 2, unit: 'tonnes',
      pricePerUnit: 99600, currency: 'INR', negotiable: false, availability: 'immediate',
      location: { city: 'Bangalore', state: 'Karnataka', country: 'India', coordinates: { lat: 12.972, lng: 77.594 } },
      description: 'Decommissioned PCBs, circuit boards, and electronic components. Certified data destruction completed.',
      status: 'active', moderationStatus: 'approved',
      aiData: { suggestedUses: ['Precious metal recovery', 'Component refurbishment', 'Certified e-waste recycling'], marketRate: 'Rs.33,000–Rs.1,83,000/tonne', impactScore: 95, caption: '2 tonnes of e-waste — high precious metal content.' },
    },
    {
      producer: p5._id, wasteType: 'Wood Chips & Sawdust', category: 'wood',
      condition: 'clean', quantity: 30, unit: 'tonnes',
      pricePerUnit: 7500, currency: 'INR', negotiable: true, availability: 'month',
      location: { city: 'Nagpur', state: 'Maharashtra', country: 'India', coordinates: { lat: 21.146, lng: 79.089 } },
      description: 'Dry wood chips and sawdust from furniture manufacturing. Suitable for biomass energy.',
      status: 'active', moderationStatus: 'pending',
      aiData: { suggestedUses: ['Biomass energy generation', 'Particleboard manufacturing', 'Mulch & compost'], marketRate: 'Rs.4,200–Rs.10,800/tonne', impactScore: 65, caption: '30 tonnes of wood chips — ideal for biomass energy.' },
    },
  ]);

  console.log(`📦 Created ${listings.length} listings`);
  console.log('\n✅ Seed complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🛡️  Admin:         admin@ecolink.ai      / admin123');
  console.log('🏭  Producer:      producer@ecolink.ai   / producer123');
  console.log('🏭  Coconut Co.:   coconut@ecolink.ai    / producer123');
  console.log('🏭  Plastic Co.:   plastic@ecolink.ai    / producer123');
  console.log('🏭  E-Waste Co.:   ewaste@ecolink.ai     / producer123');
  console.log('🛒  Consumer:      consumer@ecolink.ai   / consumer123  (Rope Mfg)');
  console.log('🛒  Builder:       builder@ecolink.ai    / consumer123  (Construction)');
  console.log('🛒  Recycler:      recycler@ecolink.ai   / consumer123  (Recycling)');
  console.log('🛒  Auto Parts:    auto@ecolink.ai       / consumer123  (Automotive)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n💡 Tip: Log in as any consumer and click "Run AI Matching" to see the ML engine in action.');

  process.exit(0);
}

seed().catch(err => { console.error('❌ Seed failed:', err); process.exit(1); });
