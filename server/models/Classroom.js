const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  subject: {
    type: String,
    required: true
  },
  className: {
    type: String,
    required: true
  },
  liveSessionLink: {
    type: String,
    default: null
  },
  isLive: {
    type: Boolean,
    default: false
  },
  sessions: [{
    title: String,
    startTime: Date,
    endTime: Date,
    recordingUrl: String,
    attendees: [{
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      joinTime: Date,
      leaveTime: Date
    }]
  }],
  materials: [{
    title: String,
    type: {
      type: String,
      enum: ['pdf', 'video', 'document', 'link']
    },
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  announcements: [{
    message: String,
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    postedAt: {
      type: Date,
      default: Date.now
    },
    isImportant: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Classroom', classroomSchema);