const { Router } = require('express');
const User = require('../models/User');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = Router();

router.get('/', requireAuth, requireRole('admin'), async (_, res) => {
  const users = await User.find().select('name email role');
  res.json(users);
});

module.exports = router;