import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { API } from '../App';

const PLATFORM_CONFIG = {
  LeetCode: {
    emoji: '🟡',
    color: '#FFA116',
    url: 'leetcode.com',
    logoUrl: 'https://leetcode.com/static/images/LeetCode_logo_rvs.png',
    description: 'Algorithmic challenges'
  },
  CodeChef: {
    emoji: '👨‍🍳',
    color: '#5B4638',
    url: 'codechef.com',
    logoUrl: 'https://cdn.codechef.com/images/cc-logo.svg',
    description: 'Competitive programming'
  },
  GeeksforGeeks: {
    emoji: '🟢',
    color: '#2F8D46',
    url: 'geeksforgeeks.org',
    logoUrl: 'https://media.geeksforgeeks.org/wp-content/cdn-uploads/gfg_200X200.png',
    description: 'DSA & interview prep'
  },
  Codeforces: {
    emoji: '🔵',
    color: '#1F8ACB',
    url: 'codeforces.com',
    logoUrl: 'https://codeforces.org/s/0/favicon-32x32.png',
    description: 'Competitive programming'
  },
  HackerRank: {
    emoji: '🌿',
    color: '#00EA64',
    url: 'hackerrank.com',
    logoUrl: 'https://hrcdn.net/community-frontend/assets/favicon-ddc852f75a.png',
    description: 'Skills & certifications'
  },
  HackerEarth: {
    emoji: '💙',
    color: '#323754',
    url: 'hackerearth.com',
    logoUrl: 'https://static-s.aa-cdn.net/img/ios/1229818600/b53e3dd19a08d7e58cb03b12d3c2b2cb_256x256.jpg',
    description: 'Hackathons & challenges'
  }
};

export default function PlatformCard({ platform, onUpdate }) {
  const [username, setUsername] = useState(platform.username || '');
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualStreak, setManualStreak] = useState(platform.streak || 0);
  const [manualSolved, setManualSolved] = useState(platform.solvedCount || 0);

  const config = PLATFORM_CONFIG[platform.name] || { emoji: '💻', color: '#888', url: '', description: '' };

  const handleToggle = async () => {
    try {
      const { data } = await API.put(`/platforms/${platform.name}`, {
        enabled: !platform.enabled,
        username
      });
      onUpdate(data);
    } catch (err) {
      toast.error('Failed to toggle platform');
    }
  };

  const handleSaveUsername = async () => {
    if (!username.trim()) return;
    setSaving(true);
    try {
      const { data } = await API.put(`/platforms/${platform.name}`, { username: username.trim(), enabled: true });
      onUpdate(data);
      toast.success(`${platform.name} username saved!`);
    } catch (err) {
      toast.error('Failed to save username');
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    if (!platform.username) { toast.error('Set your username first'); return; }
    setRefreshing(true);
    try {
      const { data } = await API.post(`/platforms/${platform.name}/refresh`);
      onUpdate(data);
      toast.success(`${platform.name} stats refreshed! 🔄`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to refresh. Try manual update.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleManualSave = async () => {
    try {
      const { data } = await API.put(`/platforms/${platform.name}/manual`, {
        streak: manualStreak,
        solvedCount: manualSolved
      });
      onUpdate(data);
      setShowManual(false);
      toast.success('Stats updated manually! ✅');
    } catch (err) {
      toast.error('Failed to update manually');
    }
  };

  const getStreakBadge = (streak) => {
    if (streak >= 100) return <span className="badge badge-warning">🏆 Legendary</span>;
    if (streak >= 30) return <span className="badge badge-success">⚡ Fire Streak</span>;
    if (streak >= 7) return <span className="badge badge-success">🔥 Hot</span>;
    if (streak > 0) return <span className="badge badge-default">✨ Active</span>;
    return <span className="badge badge-danger">❌ No Streak</span>;
  };

  const formatDate = (date) => {
    if (!date) return 'Never updated';
    return new Date(date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <div className={`platform-card ${platform.enabled ? 'enabled' : ''}`}
        style={{ borderColor: platform.enabled ? config.color + '44' : '' }}>
        <div className="platform-header">
          <div className="platform-logo">
            <span className="logo-emoji">{config.emoji}</span>
            <div>
              <h3>{platform.name}</h3>
              <div className="platform-url">{config.url}</div>
            </div>
          </div>
          <div
            className={`platform-toggle ${platform.enabled ? 'on' : ''}`}
            onClick={handleToggle}
            title={platform.enabled ? 'Disable' : 'Enable'}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          {getStreakBadge(platform.streak)}
        </div>

        <div className={`platform-stats ${!platform.enabled ? 'disabled-overlay' : ''}`}>
          <div className="pstat streak-stat">
            <div className="pstat-value">
              {platform.streak > 0 ? <span className="streak-fire">🔥</span> : null} {platform.streak}
            </div>
            <div className="pstat-label">Day Streak</div>
          </div>
          <div className="pstat solved-stat">
            <div className="pstat-value">{platform.solvedCount}</div>
            <div className="pstat-label">Solved</div>
          </div>
        </div>

        <div className="platform-input-group">
          <input
            type="text"
            placeholder={`${platform.name} username`}
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSaveUsername()}
          />
          <button className="btn btn-ghost btn-sm" onClick={handleSaveUsername} disabled={saving}>
            {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '💾'}
          </button>
        </div>

        <div className="platform-actions">
          <button className="btn-refresh" onClick={handleRefresh} disabled={refreshing || !platform.username}>
            {refreshing ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '🔄'}
            {refreshing ? 'Fetching...' : 'Auto Fetch'}
          </button>
          <button className="btn-refresh" onClick={() => setShowManual(true)}>
            ✏️ Manual
          </button>
        </div>

        <div className="last-updated">
          Last updated: {formatDate(platform.lastUpdated)}
        </div>
      </div>

      {showManual && (
        <div className="modal-overlay" onClick={() => setShowManual(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>✏️ Manual Update — {platform.name}</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 20, fontFamily: 'Space Mono' }}>
              Use this if the auto-fetch doesn't work for your account.
            </p>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Current Streak (days)</label>
              <input
                type="number" min="0"
                value={manualStreak}
                onChange={e => setManualStreak(e.target.value)}
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', color: 'var(--text)', fontFamily: 'Space Mono', fontSize: 14, outline: 'none', width: '100%' }}
              />
            </div>
            <div className="form-group">
              <label>Total Problems Solved</label>
              <input
                type="number" min="0"
                value={manualSolved}
                onChange={e => setManualSolved(e.target.value)}
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', color: 'var(--text)', fontFamily: 'Space Mono', fontSize: 14, outline: 'none', width: '100%' }}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowManual(false)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleManualSave} style={{ flex: 1 }}>Save ✅</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
