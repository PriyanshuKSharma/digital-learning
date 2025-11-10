const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  enrollNo: {
    type: String,
    required: true,
    unique: true
  },
  standard: {
    type: String,
    required: true
  },
  parentsContact: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  attendance: [{
    date: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      required: true
    },
    subject: String,
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  performance: [{
    subject: {
      type: String,
      required: true
    },
    marks: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    totalMarks: {
      type: Number,
      required: true
    },
    examType: {
      type: String,
      enum: ['quiz', 'test', 'midterm', 'final'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  feedback: [{
    comment: String,
    givenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  history: [{
    year: String,
    marks: {
      type: Map,
      of: Number
    },
    grade: String,
    promoted: {
      type: Boolean,
      default: true
    }
  }],
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

studentSchema.methods.getAttendancePercentage = function() {
  if (this.attendance.length === 0) return 0;
  const presentDays = this.attendance.filter(att => att.status === 'present').length;
  return ((presentDays / this.attendance.length) * 100).toFixed(1);
};

studentSchema.methods.getAverageMarks = function() {
  if (this.performance.length === 0) return 0;
  const totalPercentage = this.performance.reduce((acc, perf) => {
    return acc + (perf.marks / perf.totalMarks) * 100;
  }, 0);
  return (totalPercentage / this.performance.length).toFixed(1);
};

module.exports = mongoose.model('Student', studentSchema);