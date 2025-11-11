const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  leftAt: Date,
  isPresent: {
    type: Boolean,
    default: true
  }
});

const virtualClassSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 60
  },
  meetingId: {
    type: String,
    unique: true,
    default: function() {
      return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
  },
  meetingPassword: {
    type: String,
    default: function() {
      return Math.random().toString(36).substring(2, 8);
    }
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended', 'cancelled'],
    default: 'scheduled'
  },
  participants: [participantSchema],
  maxParticipants: {
    type: Number,
    default: 50
  },
  isRecorded: {
    type: Boolean,
    default: false
  },
  recordingUrl: String,
  chatMessages: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  startedAt: Date,
  endedAt: Date
}, {
  timestamps: true
});

// Generate unique meeting ID
virtualClassSchema.pre('save', function(next) {
  if (this.isNew && !this.meetingId) {
    this.meetingId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  if (this.isNew && !this.meetingPassword) {
    this.meetingPassword = Math.random().toString(36).substring(2, 8);
  }
  next();
});

// Index for efficient queries
virtualClassSchema.index({ teacherId: 1, scheduledAt: -1 });
virtualClassSchema.index({ meetingId: 1 });
virtualClassSchema.index({ status: 1, scheduledAt: 1 });

module.exports = mongoose.model('VirtualClass', virtualClassSchema);