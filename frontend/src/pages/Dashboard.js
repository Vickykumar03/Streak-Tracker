import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth, API } from '../App';
import PlatformCard from '../components/PlatformCard';
import CountdownTimer from '../components/CountdownTimer';

export default function Dashboard() {
  const { user, setUser, logout } = useAuth();
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshingAll, setRefreshingAll] = useState(false);
  const [tab, setTab] = useState('platforms');
  const [notifPrefs, setNotifPrefs] = useState({ email: true, push: true });
  const [pushSupported, setPushSupported] = useState(false);
  const [testingNotif, setTestingNotif] = useState(false);

  useEffect(() => {
    fetchPlatforms();
    setPushSupported('serviceWorker' in navigator && 'PushManager' in window);
  }, []);

  const fetchPlatforms = async () => {
    try {
      const { data } = await API.get('/platforms');
      setPlatforms(data);
      const me = await API.get('/auth/me');
      setNotifPrefs({ email: me.data.notificationEmail, push: me.data.notificationPush });
    } catch (err) {
      toast.error('Failed to load platforms');
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformUpdate = useCallback((updated) => {
    setPlatforms(prev => prev.map(p => p.name === updated.name ? updated : p));
  }, []);

  const handleRefreshAll = async () => {
    setRefreshingAll(true);
    try {
      const { data } = await API.post('/platforms/refresh-all');
      setPlatforms(data);
      toast.success('All platforms refreshed! 🔄');
    } catch (err) {
      toast.error('Some platforms failed to refresh');
    } finally {
      setRefreshingAll(false);
    }
  };

  const enablePushNotifications = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      const { data: { key } } = await API.get('/notifications/vapid-public-key');

      if (!key) {
        toast.error('Push notifications not configured on server. Set VAPID keys in .env');
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key)
      });

      await API.post('/notifications/subscribe', { subscription: sub });
      toast.success('Push notifications enabled! 📲');
      setNotifPrefs(p => ({ ...p, push: true }));
    } catch (err) {
      toast.error('Failed to enable push notifications: ' + err.message);
    }
  };

  const handleTestNotification = async () => {
    setTestingNotif(true);
    try {
      await API.post('/notifications/test');
      toast.success('Test notification sent! Check your email/browser 📬');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send test notification');
    } finally {
      setTestingNotif(false);
    }
  };

  const toggleNotifPref = async (type) => {
    const newVal = !notifPrefs[type];
    try {
      await API.put('/notifications/preferences', {
        notificationEmail: type === 'email' ? newVal : notifPrefs.email,
        notificationPush: type === 'push' ? newVal : notifPrefs.push
      });
      setNotifPrefs(p => ({ ...p, [type]: newVal }));
      toast.success('Preferences saved!');
    } catch (err) {
      toast.error('Failed to save preferences');
    }
  };

  const totalSolved = platforms.reduce((sum, p) => sum + (p.solvedCount || 0), 0);
  const maxStreak = platforms.reduce((max, p) => Math.max(max, p.streak || 0), 0);
  const activePlatforms = platforms.filter(p => p.enabled).length;

  const getLevelInfo = (total) => {
    if (total >= 1000) return { label: 'Legendary', emoji: '👑' };
    if (total >= 500) return { label: 'Master', emoji: '🏆' };
    if (total >= 200) return { label: 'Expert', emoji: '⚡' };
    if (total >= 100) return { label: 'Advanced', emoji: '🚀' };
    if (total >= 50) return { label: 'Intermediate', emoji: '🌟' };
    return { label: 'Beginner', emoji: '🌱' };
  };

  const level = getLevelInfo(totalSolved);

  if (loading) {
    return (
      <div className="splash">
        <div className="flame">🔥</div>
        <p>Loading your streaks...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="nav-brand">
          <span>🔥</span>
          StreakMaster
        </div>
        <div className="nav-actions">
          <span style={{ color: 'var(--text-dim)', fontFamily: 'Space Mono', fontSize: 13 }}>
            Hey, {user?.name?.split(' ')[0]}!
          </span>
          <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="main-content">
        <div className="page-header">
          <h2>Your Coding Dashboard</h2>
          <p>// track streaks · never break the chain · level up daily</p>
        </div>

        <CountdownTimer platforms={platforms} />

        <div className="stats-overview">
          <div className="stat-card total">
            <div className="stat-icon">💻</div>
            <div className="stat-value">{totalSolved.toLocaleString()}</div>
            <div className="stat-label">Total Solved</div>
          </div>
          <div className="stat-card streak">
            <div className="stat-icon">🔥</div>
            <div className="stat-value">{maxStreak}</div>
            <div className="stat-label">Best Streak</div>
          </div>
          <div className="stat-card platforms">
            <div className="stat-icon">📊</div>
            <div className="stat-value">{activePlatforms}/{platforms.length}</div>
            <div className="stat-label">Active Platforms</div>
          </div>
          <div className="stat-card level">
            <div className="stat-icon">{level.emoji}</div>
            <div className="stat-value" style={{ fontSize: 22 }}>{level.label}</div>
            <div className="stat-label">Your Level</div>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab ${tab === 'platforms' ? 'active' : ''}`} onClick={() => setTab('platforms')}>
            📊 Platforms
          </button>
          <button className={`tab ${tab === 'notifications' ? 'active' : ''}`} onClick={() => setTab('notifications')}>
            🔔 Notifications
          </button>
        </div>

        {tab === 'platforms' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div className="section-title">🖥️ Platforms</div>
              <button className="btn btn-ghost btn-sm" onClick={handleRefreshAll} disabled={refreshingAll}>
                {refreshingAll ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '🔄'}
                {refreshingAll ? ' Refreshing...' : ' Refresh All'}
              </button>
            </div>

            {/* Platform breakdown bar */}
            {totalSolved > 0 && (
              <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: '20px 24px', border: '1px solid var(--border)', marginBottom: 28 }}>
                <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 12, fontFamily: 'Space Mono' }}>
                  PLATFORM BREAKDOWN — {totalSolved} total problems
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {platforms.filter(p => p.solvedCount > 0).map(p => (
                    <div key={p.name} style={{ flex: 1, minWidth: 100 }}>
                      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>{p.name}</div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${Math.min((p.solvedCount / totalSolved) * 100, 100)}%` }} />
                      </div>
                      <div style={{ fontSize: 13, fontFamily: 'Space Mono', marginTop: 4, fontWeight: 700 }}>
                        {p.solvedCount} ({Math.round((p.solvedCount / totalSolved) * 100)}%)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="platforms-grid">
              {platforms.map(platform => (
                <PlatformCard
                  key={platform.name}
                  platform={platform}
                  onUpdate={handlePlatformUpdate}
                />
              ))}
            </div>
          </>
        )}

        {tab === 'notifications' && (
          <>
            <div className="section-title">🔔 Notification Settings</div>
            <div className="notification-card">
              <div style={{ marginBottom: 20 }}>
                <p style={{ color: 'var(--text-dim)', fontFamily: 'Space Mono', fontSize: 13, lineHeight: 1.8 }}>
                  StreakMaster sends you a reminder <strong style={{ color: 'var(--accent)' }}>1 hour before midnight (11 PM)</strong> every day
                  if you have active streaks. Never lose a streak again!
                </p>
              </div>

              <div className="notif-row">
                <div className="notif-info">
                  <h4>📧 Email Notifications</h4>
                  <p>Sent to: {user?.email}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className={`badge ${notifPrefs.email ? 'badge-success' : 'badge-danger'}`}>
                    {notifPrefs.email ? 'ON' : 'OFF'}
                  </span>
                  <button
                    className={`btn btn-sm ${notifPrefs.email ? 'btn-ghost' : 'btn-primary'}`}
                    onClick={() => toggleNotifPref('email')}
                  >
                    {notifPrefs.email ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>

              <div className="notif-row">
                <div className="notif-info">
                  <h4>🔔 Browser Push Notifications</h4>
                  <p>{pushSupported ? 'Supported on this browser' : 'Not supported on this browser'}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className={`badge ${notifPrefs.push ? 'badge-success' : 'badge-danger'}`}>
                    {notifPrefs.push ? 'ON' : 'OFF'}
                  </span>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={enablePushNotifications}
                    disabled={!pushSupported}
                  >
                    {notifPrefs.push ? 'Re-enable' : 'Enable'}
                  </button>
                </div>
              </div>

              <div className="notif-row">
                <div className="notif-info">
                  <h4>⏰ Notification Schedule</h4>
                  <p>Daily at 11:00 PM IST (23:00)</p>
                </div>
                <span className="badge badge-success">Active</span>
              </div>

              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                <button
                  className="btn btn-ghost"
                  onClick={handleTestNotification}
                  disabled={testingNotif}
                  style={{ marginRight: 12 }}
                >
                  {testingNotif ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '📬'}
                  {testingNotif ? ' Sending...' : ' Send Test Notification'}
                </button>
                <span style={{ color: 'var(--text-dim)', fontSize: 13, fontFamily: 'Space Mono' }}>
                  Verify your notification setup
                </span>
              </div>
            </div>

            <div className="section-title" style={{ marginTop: 12 }}>📈 Active Streaks at Risk</div>
            <div className="notification-card">
              {platforms.filter(p => p.enabled && p.streak > 0).length === 0 ? (
                <p style={{ color: 'var(--text-dim)', fontFamily: 'Space Mono', fontSize: 14 }}>
                  No active streaks. Enable platforms and add your usernames to start tracking!
                </p>
              ) : (
                platforms.filter(p => p.enabled && p.streak > 0).map(p => (
                  <div className="notif-row" key={p.name}>
                    <div className="notif-info">
                      <h4>{p.name}</h4>
                      <p>@{p.username}</p>
                    </div>
                    <div style={{ display: 'flex', align: 'center', gap: 10 }}>
                      <span style={{ fontFamily: 'Space Mono', fontSize: 20, fontWeight: 700, color: 'var(--gold)' }}>
                        🔥 {p.streak}d
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}
