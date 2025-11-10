const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  qualifications: {
    type: String,
    required: true
  },
  subjects: [{
    type: String,
    required: true
  }],
  assignedClasses: [{
    type: String,
    required: true
  }],
  lecturesTaken: {
    type: Number,
    default: 0
  },
  leaves: {
    type: Number,
    default: 0
  },
  ratings: [{
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    ratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  isClassTeacher: {
    type: Boolean,
    default: false
  },
  classTeacherOf: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

teacherSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
  return (sum / this.ratings.length).toFixed(1);
};

module.exports = mongoose.model('Teacher', teacherSchema);