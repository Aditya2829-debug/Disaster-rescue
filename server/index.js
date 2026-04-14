require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./modules/auth/auth.routes');
const victimRoutes = require('./modules/victims/victims.routes');
const sosRoutes = require('./modules/sos/sos.routes');
const syncRoutes = require('./modules/sync/sync.routes');

const app = express();

connectDB();

// ✅ SIMPLE WORKING CORS (fixes your issue)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '2mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/victims', victimRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/sync', syncRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("DisasterAid API running 🚀");
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚨 DisasterAid server running on port ${PORT}`));