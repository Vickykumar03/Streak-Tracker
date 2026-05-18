import React, { useState, useEffect } from 'react';

export default function CountdownTimer({ platforms }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;

      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);

      // Active warning window: 1 hour before midnight
      const withinWarning = hours === 0 && mins < 60;
      setIsActive(withinWarning);
      setIsUrgent(hours === 0 && mins < 15);

      setTimeLeft(`${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const activePlatforms = platforms.filter(p => p.enabled && p.streak > 0);
  if (!activePlatforms.length) return null;

  return (
    <div className="countdown-bar" style={isActive ? { borderColor: 'rgba(239,68,68,0.5)', background: 'rgba(239,68,68,0.05)' } : {}}>
      <div className="countdown-icon">{isUrgent ? '🚨' : isActive ? '⏰' : '🕐'}</div>
      <div className="countdown-text">
        <h3 style={{ color: isUrgent ? 'var(--red)' : isActive ? 'var(--accent)' : 'var(--text)' }}>
          {isUrgent ? '⚠️ URGENT — Streak danger!' : isActive ? 'Solve now to keep your streak!' : 'Time until day resets'}
        </h3>
        <p>
          {activePlatforms.length} active streak{activePlatforms.length > 1 ? 's' : ''} —
          {activePlatforms.map(p => ` ${p.name} (${p.streak}d)`).join(',')}
        </p>
      </div>
      <div className={`countdown-time ${isUrgent ? 'urgent' : ''}`}>{timeLeft}</div>
    </div>
  );
}
