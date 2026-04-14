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

// ✅ Allowed origins
const allowedOrigins = [
  process.env.CLIENT_URL, // from env (Vercel URL)
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

// ✅ CORS FIX (important)
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (postman, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ✅ VERY IMPORTANT for preflight requests
app.options('*', cors());

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