const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 30
  },
  avatar: {
    type: String,
    default: function() {
      return `https://ui-avatars.com/api/?name=${this.username}&background=random&color=fff`;
    }
  },
  email: {
    type: String,
    sparse: true,
    lowercase: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['online', 'away', 'busy', 'offline'],
    default: 'offline'
  },
  socketId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries (username already has unique index)
userSchema.index({ isOnline: 1 });
userSchema.index({ lastSeen: -1 });

module.exports = mongoose.model('User', userSchema);
