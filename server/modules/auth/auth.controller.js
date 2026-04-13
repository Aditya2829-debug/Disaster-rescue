const authService = require('./auth.service');

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ message: 'User created', userId: user._id });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) { next(err); }
};

module.exports = { register, login };
