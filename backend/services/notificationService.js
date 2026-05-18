const nodemailer = require('nodemailer');
const webpush = require('web-push');

// Setup VAPID keys for web push
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:admin@streaktracker.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendEmailNotification(email, name, platforms) {
  const atRiskPlatforms = platforms.filter(p => p.enabled && p.username && p.streak > 0);
  if (!atRiskPlatforms.length) return;

  const platformList = atRiskPlatforms
    .map(p => `<li><strong>${p.name}</strong> — Current Streak: 🔥 ${p.streak} days</li>`)
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', sans-serif; background: #0f0f1a; color: #e0e0e0; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; border: 1px solid #2a2a4a; }
        .header { background: linear-gradient(135deg, #ff6b35, #f7c59f); padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; color: #0f0f1a; font-weight: 800; }
        .header p { margin: 8px 0 0; color: #0f0f1a; opacity: 0.8; font-size: 16px; }
        .body { padding: 30px; }
        .body p { line-height: 1.7; color: #b0b0cc; }
        ul { background: #0f0f1a; border-radius: 10px; padding: 20px 30px; }
        ul li { margin: 10px 0; color: #e0e0e0; font-size: 16px; }
        .cta { display: block; background: linear-gradient(135deg, #ff6b35, #f7c59f); color: #0f0f1a; text-decoration: none; font-weight: 800; text-align: center; padding: 16px 32px; border-radius: 50px; margin: 20px 0; font-size: 16px; }
        .footer { padding: 20px 30px; text-align: center; color: #4a4a6a; font-size: 13px; border-top: 1px solid #2a2a4a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔥 Streak Alert!</h1>
          <p>Don't break your coding streak today!</p>
        </div>
        <div class="body">
          <p>Hey <strong>${name}</strong>! It's almost midnight and your streaks are at risk.</p>
          <p>You have active streaks on these platforms:</p>
          <ul>${platformList}</ul>
          <p>You have <strong>less than 1 hour</strong> to solve at least one problem on each platform. Go crush it! 💪</p>
          <a class="cta" href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">Open StreakMaster →</a>
        </div>
        <div class="footer">StreakMaster • Keeping your coding streaks alive 🚀</div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"StreakMaster 🔥" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔥 Streak Alert — 1 Hour Left to Solve Today!',
    html
  });
}

async function sendPushNotification(subscription, payload) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (err) {
    console.error('Push notification error:', err.message);
  }
}

module.exports = { sendEmailNotification, sendPushNotification };
