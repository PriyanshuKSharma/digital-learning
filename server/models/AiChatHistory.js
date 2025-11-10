const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'voice', 'document'],
    default: 'text'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const aiChatHistorySchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  messages: [messageSchema],
  subjectContext: [{
    type: String
  }],
  totalInteractions: {
    type: Number,
    default: 0
  },
  lastInteraction: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
aiChatHistorySchema.index({ studentId: 1, lastInteraction: -1 });

module.exports = mongoose.model('AiChatHistory', aiChatHistorySchema);