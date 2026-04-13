const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

const register = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) throw Object.assign(new Error('Email already in use'), { status: 409 });
  const passwordHash = await bcrypt.hash(password, 12);
  const user = new User({ name, email, passwordHash, role: role || 'civilian' });
  await user.save();
  return user;
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  const valid = await user.comparePassword(password);
  if (!valid) throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  const token = jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
};

module.exports = { register, login };
