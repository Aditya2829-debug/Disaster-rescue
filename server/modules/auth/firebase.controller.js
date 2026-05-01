const admin = require('../../config/firebase');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

// Sentinel value stored for Firebase-only accounts so they cannot log in via
// the email/password flow (bcrypt never produces a hash matching this string).
const FIREBASE_USER_SENTINEL = '$firebase$';

/**
 * POST /api/auth/firebase
 * Accepts a Firebase ID token, verifies it, upserts the user in MongoDB,
 * and returns a standard JWT for the rest of the API.
 */
const firebaseAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'idToken is required' });
    }

    // Verify Firebase ID token
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { email, name: firebaseName } = decoded;

    if (!email) {
      return res.status(400).json({ message: 'Firebase account has no email address' });
    }

    // Find or create the user in MongoDB
    let user = await User.findOne({ email });

    if (!user) {
      // New user — store a sentinel hash so the account cannot be used via
      // the email/password login route.
      const sentinelHash = await bcrypt.hash(FIREBASE_USER_SENTINEL, 12);
      user = new User({
        name: firebaseName || email.split('@')[0],
        email,
        passwordHash: sentinelHash,
        role: 'field_worker',
      });
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { firebaseAuth };
