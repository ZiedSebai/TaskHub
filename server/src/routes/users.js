const { Router } = require('express');
const { supabase } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.get('/', requireAuth, async (_, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role')
      .order('name', { ascending: true });

    if (error) throw error;

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/search', requireAuth, async (req, res) => {
  try {
    const query = req.query.q?.toString() || '';

    if (!query) {
      return res.json([]);
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
