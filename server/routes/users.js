const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const User = require('../models/user');

// GET /api/users (only for admins)
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    const users = await User.find({}, '-password'); // exclude password
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching users', error: err.message });
  }
});

// PUT /api/users/:id (only for admins)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    const userId = req.params.id;
    const { username, role } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, role },
      { new: true, select: '-password' }
    );
    if (!updatedUser) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json({ msg: 'User updated', user: updatedUser });
  } catch (err) {
    res.status(500).json({ msg: 'Error updating user', error: err.message });
  }
});

// DELETE /api/users/:id (only for admins)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json({ msg: 'User deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Error deleting user', error: err.message });
  }
});

module.exports = router;
