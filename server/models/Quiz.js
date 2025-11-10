const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  classAssigned: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    options: [{
      type: String,
      required: true
    }],
    correctAnswer: {
      type: Number,
      required: true,
      min: 0,
      max: 3
    },
    marks: {
      type: Number,
      default: 1
    }
  }],
  totalMarks: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true // in minutes
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  submissions: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    answers: [{
      questionIndex: Number,
      selectedOption: Number,
      isCorrect: Boolean
    }],
    score: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      required: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    timeTaken: Number // in minutes
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

quizSchema.methods.calculateScore = function(answers) {
  let score = 0;
  answers.forEach((answer, index) => {
    if (this.questions[index] && answer.selectedOption === this.questions[index].correctAnswer) {
      score += this.questions[index].marks;
    }
  });
  return score;
};

module.exports = mongoose.model('Quiz', quizSchema);