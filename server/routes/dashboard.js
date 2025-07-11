const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const User = require('../models/user');
const Log = require('../models/log'); // Make sure you have a Log model

// GET /api/dashboard - summary stats for dashboard cards
router.get('/', verifyToken, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const logsArr = await Log.find({});
    const logs = logsArr.length;
    const errors = logsArr.filter(log => (log.action || '').toLowerCase().includes('error')).length;
    res.json({ userCount, logs, errors });
  } catch (err) {
    res.status(500).json({ msg: 'Dashboard error', error: err.message });
  }
});

// GET /api/dashboard/stats - for charts/analytics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const users = await User.find({}, 'createdAt role');
    const signupStats = {};
    const roleStats = { admin: 0, user: 0 };

    users.forEach(user => {
      const date = new Date(user.createdAt).toISOString().split('T')[0];
      signupStats[date] = (signupStats[date] || 0) + 1;
      roleStats[user.role] = (roleStats[user.role] || 0) + 1;
    });

    res.json({ signupStats, roleStats });
  } catch (err) {
    res.status(500).json({ msg: 'Stats error', error: err.message });
  }
});

// GET /api/dashboard/logs - for logs page
router.get('/logs', verifyToken, async (req, res) => {
  try {
    const logs = await Log.find({});
    res.json({ count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ msg: 'Logs error', error: err.message });
  }
});

// DELETE /api/users/:id - admin only
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    res.json({ msg: 'User deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Error deleting user', error: err.message });
  }
});

module.exports = router;
