require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const authRoutes     = require('./routes/auth');
const listingRoutes  = require('./routes/listings');
const matchRoutes    = require('./routes/matches');
const dealRoutes     = require('./routes/deals');
const adminRoutes    = require('./routes/admin');
const userRoutes     = require('./routes/users');
const aiRoutes       = require('./routes/ai');

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth',     authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/matches',  matchRoutes);
app.use('/api/deals',    dealRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/ai',       aiRoutes);

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// Connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    // For local development
    if (process.env.NODE_ENV !== 'production') {
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    }
  })
  .catch(err => { 
    console.error('❌ DB connection failed:', err); 
  });

// Export for Vercel serverless functions
module.exports = app;
