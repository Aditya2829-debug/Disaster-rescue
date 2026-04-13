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

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173', // Vite default
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/victims', victimRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/sync', syncRoutes);

app.get("/", (req, res) => {
    res.send("DisasterAid API running 🚀");
});
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚨 DisasterAid server running on port ${PORT}`));
