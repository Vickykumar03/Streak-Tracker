const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { fetchPlatformStats } = require('../services/platformService');

const router = express.Router();

// Get user platforms
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('platforms');
    res.json(user.platforms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update platform config (username, enabled)
router.put('/:platformName', auth, async (req, res) => {
  try {
    const { username, enabled } = req.body;
    const user = await User.findById(req.user.id);
    const platform = user.platforms.find(p => p.name === req.params.platformName);
    if (!platform) return res.status(404).json({ message: 'Platform not found' });

    if (username !== undefined) platform.username = username;
    if (enabled !== undefined) platform.enabled = enabled;

    await user.save();
    res.json(platform);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Refresh stats for a platform
router.post('/:platformName/refresh', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const platform = user.platforms.find(p => p.name === req.params.platformName);
    if (!platform) return res.status(404).json({ message: 'Platform not found' });
    if (!platform.username) return res.status(400).json({ message: 'Username not set' });

    const stats = await fetchPlatformStats(platform.name, platform.username);
    if (!stats) return res.status(502).json({ message: `Could not fetch stats from ${platform.name}` });

    platform.streak = stats.streak;
    platform.solvedCount = stats.solvedCount;
    platform.lastUpdated = new Date();

    await user.save();
    res.json(platform);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Refresh ALL platforms
router.post('/refresh-all', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const enabledPlatforms = user.platforms.filter(p => p.enabled && p.username);

    const results = await Promise.allSettled(
      enabledPlatforms.map(async p => {
        const stats = await fetchPlatformStats(p.name, p.username);
        if (stats) {
          p.streak = stats.streak;
          p.solvedCount = stats.solvedCount;
          p.lastUpdated = new Date();
        }
        return p;
      })
    );

    await user.save();
    res.json(user.platforms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Manual override (for testing / platforms with no API)
router.put('/:platformName/manual', auth, async (req, res) => {
  try {
    const { streak, solvedCount } = req.body;
    const user = await User.findById(req.user.id);
    const platform = user.platforms.find(p => p.name === req.params.platformName);
    if (!platform) return res.status(404).json({ message: 'Platform not found' });

    if (streak !== undefined) platform.streak = parseInt(streak) || 0;
    if (solvedCount !== undefined) platform.solvedCount = parseInt(solvedCount) || 0;
    platform.lastUpdated = new Date();

    await user.save();
    res.json(platform);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
