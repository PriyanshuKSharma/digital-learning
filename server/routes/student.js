const express = require('express');
const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');
const Quiz = require('../models/Quiz');
const Classroom = require('../models/Classroom');
const { auth, authorize } = require('../middlewares/auth');
const aiTutorRoutes = require('../ai_tutor/aiRoutes');

const router = express.Router();

// Apply auth and student authorization to all routes
router.use(auth, authorize('student'));

// Get student dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id })
      .populate('userId', 'fullName email photo')
      .populate('classTeacher', 'fullName');

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Get upcoming quizzes
    const upcomingQuizzes = await Quiz.find({
      classAssigned: student.standard,
      endTime: { $gt: new Date() },
      isActive: true
    }).limit(5);

    // Calculate stats
    const attendancePercentage = student.getAttendancePercentage();
    const averageMarks = student.getAverageMarks();

    res.json({
      success: true,
      data: {
        student,
        upcomingQuizzes,
        stats: {
          attendancePercentage,
          averageMarks,
          totalQuizzes: student.performance.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get learning materials
router.get('/materials', async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Get classroom materials
    const classroom = await Classroom.findOne({
      students: req.user.id
    });

    const materials = classroom?.materials || [];

    res.json({
      success: true,
      data: materials
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get available quizzes
router.get('/quizzes', async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const quizzes = await Quiz.find({
      classAssigned: student.standard,
      isActive: true,
      startTime: { $lte: new Date() },
      endTime: { $gt: new Date() }
    }).select('-questions.correctAnswer');

    res.json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit quiz
router.post('/submit-quiz/:quizId', [
  body('answers').isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if quiz is still active
    const now = new Date();
    if (now < quiz.startTime || now > quiz.endTime) {
      return res.status(400).json({ message: 'Quiz is not currently active' });
    }

    // Check if already submitted
    const existingSubmission = quiz.submissions.find(
      sub => sub.studentId.toString() === req.user.id
    );
    if (existingSubmission) {
      return res.status(400).json({ message: 'Quiz already submitted' });
    }

    const { answers } = req.body;

    // Calculate score
    let score = 0;
    const processedAnswers = answers.map((answer, index) => {
      const question = quiz.questions[index];
      const isCorrect = question && answer.selectedOption === question.correctAnswer;
      if (isCorrect) {
        score += question.marks || 1;
      }
      return {
        questionIndex: index,
        selectedOption: answer.selectedOption,
        isCorrect
      };
    });

    const percentage = (score / quiz.totalMarks) * 100;

    // Add submission
    quiz.submissions.push({
      studentId: req.user.id,
      answers: processedAnswers,
      score,
      percentage,
      submittedAt: new Date()
    });

    await quiz.save();

    // Update student performance
    const student = await Student.findOne({ userId: req.user.id });
    student.performance.push({
      subject: quiz.subject,
      marks: score,
      totalMarks: quiz.totalMarks,
      examType: 'quiz'
    });
    await student.save();

    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        score,
        percentage,
        totalMarks: quiz.totalMarks
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// AI Tutor routes
router.use('/ai-tutor', aiTutorRoutes);

// Code execution
router.post('/code-run', [
  body('code').notEmpty(),
  body('language').isIn(['javascript', 'python', 'java', 'cpp'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code, language } = req.body;

    // This would integrate with a code execution service
    // For now, return a mock response
    const mockOutput = `Code executed successfully!\nLanguage: ${language}\nOutput: Hello World!`;

    res.json({
      success: true,
      data: {
        output: mockOutput,
        executionTime: '0.5s',
        status: 'success'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;