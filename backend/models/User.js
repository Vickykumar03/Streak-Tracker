const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const platformSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, default: '' },
  enabled: { type: Boolean, default: false },
  streak: { type: Number, default: 0 },
  solvedCount: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: null },
  lastSolved: { type: Date, default: null }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  platforms: {
    type: [platformSchema],
    default: () => [
      { name: 'LeetCode', username: '', enabled: false, streak: 0, solvedCount: 0 },
      { name: 'CodeChef', username: '', enabled: false, streak: 0, solvedCount: 0 },
      { name: 'GeeksforGeeks', username: '', enabled: false, streak: 0, solvedCount: 0 },
      { name: 'Codeforces', username: '', enabled: false, streak: 0, solvedCount: 0 },
      { name: 'HackerRank', username: '', enabled: false, streak: 0, solvedCount: 0 },
      { name: 'HackerEarth', username: '', enabled: false, streak: 0, solvedCount: 0 }
    ]
  },
  notificationEmail: { type: Boolean, default: true },
  notificationPush: { type: Boolean, default: true },
  pushSubscription: { type: Object, default: null },
  timezone: { type: String, default: 'Asia/Kolkata' },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
