const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const { auth, authorize } = require('../middlewares/auth');

const router = express.Router();

// Apply auth and admin authorization to all routes
router.use(auth, authorize('admin'));

// Teacher Management
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .populate('userId', 'username fullName email photo isActive')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: teachers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/teachers', [
  body('username').isLength({ min: 3 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').notEmpty().trim(),
  body('qualifications').notEmpty().trim(),
  body('subjects').isArray({ min: 1 }),
  body('assignedClasses').isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, fullName, qualifications, subjects, assignedClasses } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or username already exists' 
      });
    }

    // Create user
    const user = new User({
      username,
      email,
      password,
      fullName,
      role: 'teacher'
    });

    await user.save();

    // Create teacher profile
    const teacher = new Teacher({
      userId: user._id,
      qualifications,
      subjects,
      assignedClasses
    });

    await teacher.save();

    const populatedTeacher = await Teacher.findById(teacher._id)
      .populate('userId', 'username fullName email photo');

    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      data: populatedTeacher
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/teachers/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const { fullName, email, qualifications, subjects, assignedClasses } = req.body;

    // Update user info
    await User.findByIdAndUpdate(teacher.userId, {
      fullName,
      email
    });

    // Update teacher info
    teacher.qualifications = qualifications;
    teacher.subjects = subjects;
    teacher.assignedClasses = assignedClasses;
    await teacher.save();

    const updatedTeacher = await Teacher.findById(teacher._id)
      .populate('userId', 'username fullName email photo');

    res.json({
      success: true,
      message: 'Teacher updated successfully',
      data: updatedTeacher
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/teachers/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Soft delete - deactivate user
    await User.findByIdAndUpdate(teacher.userId, { isActive: false });

    res.json({
      success: true,
      message: 'Teacher deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/teachers/:id/toggle-status', async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const user = await User.findById(teacher.userId);
    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `Teacher ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: user.isActive
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Student Management
router.get('/students', async (req, res) => {
  try {
    const students = await Student.find()
      .populate('userId', 'username fullName email photo isActive')
      .populate('classTeacher', 'fullName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/students', [
  body('username').isLength({ min: 3 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').notEmpty().trim(),
  body('enrollNo').notEmpty().trim(),
  body('standard').notEmpty().trim(),
  body('parentsContact').notEmpty().trim(),
  body('address').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, fullName, enrollNo, standard, parentsContact, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or username already exists' 
      });
    }

    // Check if enrollment number exists
    const existingStudent = await Student.findOne({ enrollNo });
    if (existingStudent) {
      return res.status(400).json({ 
        message: 'Student with this enrollment number already exists' 
      });
    }

    // Create user
    const user = new User({
      username,
      email,
      password,
      fullName,
      role: 'student'
    });

    await user.save();

    // Create student profile
    const student = new Student({
      userId: user._id,
      enrollNo,
      standard,
      parentsContact,
      address
    });

    await student.save();

    const populatedStudent = await Student.findById(student._id)
      .populate('userId', 'username fullName email photo');

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: populatedStudent
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const { fullName, email, standard, parentsContact, address } = req.body;

    // Update user info
    await User.findByIdAndUpdate(student.userId, {
      fullName,
      email
    });

    // Update student info
    student.standard = standard;
    student.parentsContact = parentsContact;
    student.address = address;
    await student.save();

    const updatedStudent = await Student.findById(student._id)
      .populate('userId', 'username fullName email photo');

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Soft delete - deactivate user
    await User.findByIdAndUpdate(student.userId, { isActive: false });

    res.json({
      success: true,
      message: 'Student deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/students/:id/toggle-status', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const user = await User.findById(student.userId);
    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `Student ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: user.isActive
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Analytics and Logs
router.get('/analytics', async (req, res) => {
  try {
    const totalTeachers = await Teacher.countDocuments();
    const totalStudents = await Student.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    // Get recent activities (simplified)
    const recentTeachers = await Teacher.find()
      .populate('userId', 'fullName createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentStudents = await Student.find()
      .populate('userId', 'fullName createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          totalTeachers,
          totalStudents,
          activeUsers
        },
        recentActivities: {
          teachers: recentTeachers,
          students: recentStudents
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;