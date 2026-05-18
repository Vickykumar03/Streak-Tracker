const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendEmailNotification, sendPushNotification } = require('../services/notificationService');

const router = express.Router();

// Save push subscription
router.post('/subscribe', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.pushSubscription = req.body.subscription;
    user.notificationPush = true;
    await user.save();
    res.json({ message: 'Push subscription saved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update notification prefs
router.put('/preferences', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (req.body.notificationEmail !== undefined) user.notificationEmail = req.body.notificationEmail;
    if (req.body.notificationPush !== undefined) user.notificationPush = req.body.notificationPush;
    await user.save();
    res.json({ notificationEmail: user.notificationEmail, notificationPush: user.notificationPush });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Test notification (manual trigger)
router.post('/test', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const enabledPlatforms = user.platforms.filter(p => p.enabled && p.username);

    if (user.notificationEmail && user.email) {
      await sendEmailNotification(user.email, user.name, enabledPlatforms);
    }

    if (user.notificationPush && user.pushSubscription) {
      await sendPushNotification(user.pushSubscription, {
        title: '🔥 Streak Alert! Test Notification',
        body: 'Your streak reminder is working! Keep coding!',
        icon: '/logo192.png',
        badge: '/logo192.png'
      });
    }

    res.json({ message: 'Test notification sent!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get VAPID public key
router.get('/vapid-public-key', (req, res) => {
  res.json({ key: process.env.VAPID_PUBLIC_KEY || '' });
});

module.exports = router;
