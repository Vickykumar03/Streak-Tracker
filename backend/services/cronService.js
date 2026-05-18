const cron = require('node-cron');
const User = require('../models/User');
const { sendEmailNotification, sendPushNotification } = require('./notificationService');

function startCronJobs() {
  // Run every day at 11:00 PM IST (17:30 UTC)
  // IST = UTC + 5:30
  cron.schedule('30 17 * * *', async () => {
    console.log('[CRON] Running streak reminder at 11:00 PM IST...');
    await sendReminders();
  }, { timezone: 'UTC' });

  console.log('[CRON] Streak reminder scheduler started (runs at 11 PM IST daily)');
}

async function sendReminders() {
  try {
    const users = await User.find({
      $or: [{ notificationEmail: true }, { notificationPush: true }],
      'platforms.enabled': true
    });

    console.log(`[CRON] Sending reminders to ${users.length} users`);

    for (const user of users) {
      try {
        const activePlatforms = user.platforms.filter(p => p.enabled && p.username && p.streak > 0);
        if (!activePlatforms.length) continue;

        // Email notification
        if (user.notificationEmail && user.email) {
          await sendEmailNotification(user.email, user.name, activePlatforms);
          console.log(`[CRON] Email sent to ${user.email}`);
        }

        // Push notification
        if (user.notificationPush && user.pushSubscription) {
          const topStreak = activePlatforms.reduce((max, p) => p.streak > max.streak ? p : max, activePlatforms[0]);
          await sendPushNotification(user.pushSubscription, {
            title: '🔥 Streak in Danger!',
            body: `1 hour left! Keep your ${topStreak.name} streak of ${topStreak.streak} days alive!`,
            icon: '/logo192.png',
            badge: '/logo192.png',
            data: { url: '/' }
          });
          console.log(`[CRON] Push sent to user ${user._id}`);
        }
      } catch (userErr) {
        console.error(`[CRON] Error for user ${user._id}:`, userErr.message);
      }
    }
  } catch (err) {
    console.error('[CRON] Error running reminders:', err.message);
  }
}

module.exports = { startCronJobs, sendReminders };
