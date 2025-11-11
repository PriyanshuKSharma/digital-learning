const express = require('express');
const { body, validationResult } = require('express-validator');
const VirtualClass = require('../models/VirtualClass');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const { auth, authorize } = require('../middlewares/auth');

const router = express.Router();

// Teacher routes
router.use(auth);

// Create virtual class (Teachers only)
router.post('/create', 
  authorize('teacher'),
  [
    body('title').notEmpty().trim(),
    body('subject').notEmpty().trim(),
    body('grade').notEmpty().trim(),
    body('scheduledAt').isISO8601(),
    body('duration').isInt({ min: 15, max: 480 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher profile not found' });
      }

      const { title, description, subject, grade, scheduledAt, duration } = req.body;

      const virtualClass = new VirtualClass({
        title,
        description,
        teacherId: teacher._id,
        subject,
        grade,
        scheduledAt: new Date(scheduledAt),
        duration: parseInt(duration)
      });

      await virtualClass.save();
      await virtualClass.populate('teacherId', 'userId qualifications subjects');

      res.status(201).json({
        success: true,
        message: 'Virtual class created successfully',
        data: virtualClass
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get teacher's classes
router.get('/teacher/classes', authorize('teacher'), async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user.id });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    const classes = await VirtualClass.find({ teacherId: teacher._id })
      .populate('teacherId', 'userId qualifications subjects')
      .populate('participants.userId', 'fullName email')
      .sort({ scheduledAt: -1 });

    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Start class (Teachers only)
router.patch('/:id/start', authorize('teacher'), async (req, res) => {
  try {
    const virtualClass = await VirtualClass.findById(req.params.id);
    if (!virtualClass) {
      return res.status(404).json({ message: 'Virtual class not found' });
    }

    const teacher = await Teacher.findOne({ userId: req.user.id });
    if (!teacher || !virtualClass.teacherId.equals(teacher._id)) {
      return res.status(403).json({ message: 'Not authorized to start this class' });
    }

    virtualClass.status = 'live';
    virtualClass.startedAt = new Date();
    await virtualClass.save();

    res.json({
      success: true,
      message: 'Class started successfully',
      data: virtualClass
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// End class (Teachers only)
router.patch('/:id/end', authorize('teacher'), async (req, res) => {
  try {
    const virtualClass = await VirtualClass.findById(req.params.id);
    if (!virtualClass) {
      return res.status(404).json({ message: 'Virtual class not found' });
    }

    const teacher = await Teacher.findOne({ userId: req.user.id });
    if (!teacher || !virtualClass.teacherId.equals(teacher._id)) {
      return res.status(403).json({ message: 'Not authorized to end this class' });
    }

    virtualClass.status = 'ended';
    virtualClass.endedAt = new Date();
    await virtualClass.save();

    res.json({
      success: true,
      message: 'Class ended successfully',
      data: virtualClass
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get available classes for students
router.get('/student/available', authorize('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const classes = await VirtualClass.find({
      grade: student.standard,
      status: { $in: ['scheduled', 'live'] },
      scheduledAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    })
    .populate('teacherId', 'userId qualifications subjects')
    .populate('teacherId.userId', 'fullName')
    .sort({ scheduledAt: 1 });

    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Join class (Students)
router.post('/:id/join', authorize('student'), async (req, res) => {
  try {
    const virtualClass = await VirtualClass.findById(req.params.id);
    if (!virtualClass) {
      return res.status(404).json({ message: 'Virtual class not found' });
    }

    if (virtualClass.status !== 'live') {
      return res.status(400).json({ message: 'Class is not currently live' });
    }

    // Check if already joined
    const existingParticipant = virtualClass.participants.find(
      p => p.userId.toString() === req.user.id && p.isPresent
    );

    if (existingParticipant) {
      return res.status(400).json({ message: 'Already joined this class' });
    }

    // Add participant
    virtualClass.participants.push({
      userId: req.user.id,
      joinedAt: new Date(),
      isPresent: true
    });

    await virtualClass.save();

    res.json({
      success: true,
      message: 'Joined class successfully',
      data: {
        meetingId: virtualClass.meetingId,
        meetingPassword: virtualClass.meetingPassword,
        title: virtualClass.title
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Leave class
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const virtualClass = await VirtualClass.findById(req.params.id);
    if (!virtualClass) {
      return res.status(404).json({ message: 'Virtual class not found' });
    }

    const participant = virtualClass.participants.find(
      p => p.userId.toString() === req.user.id && p.isPresent
    );

    if (participant) {
      participant.isPresent = false;
      participant.leftAt = new Date();
      await virtualClass.save();
    }

    res.json({
      success: true,
      message: 'Left class successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get class details
router.get('/:id', auth, async (req, res) => {
  try {
    const virtualClass = await VirtualClass.findById(req.params.id)
      .populate('teacherId', 'userId qualifications subjects')
      .populate('teacherId.userId', 'fullName email')
      .populate('participants.userId', 'fullName email');

    if (!virtualClass) {
      return res.status(404).json({ message: 'Virtual class not found' });
    }

    res.json({
      success: true,
      data: virtualClass
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get attendance for a class (Teachers only)
router.get('/:id/attendance', authorize('teacher'), async (req, res) => {
  try {
    const virtualClass = await VirtualClass.findById(req.params.id)
      .populate('participants.userId', 'fullName email')
      .populate('teacherId', 'userId');

    if (!virtualClass) {
      return res.status(404).json({ message: 'Virtual class not found' });
    }

    const teacher = await Teacher.findOne({ userId: req.user.id });
    if (!teacher || !virtualClass.teacherId.equals(teacher._id)) {
      return res.status(403).json({ message: 'Not authorized to view attendance for this class' });
    }

    res.json({
      success: true,
      data: virtualClass.participants.map(p => ({
        student: p.userId,
        joinedAt: p.joinedAt,
        leftAt: p.leftAt,
        isPresent: p.isPresent
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Export attendance as CSV (Teachers only)
// query: ?format=csv (default csv)
router.get('/:id/attendance/export', authorize('teacher'), async (req, res) => {
  try {
    const format = (req.query.format || 'csv').toLowerCase();

    const virtualClass = await VirtualClass.findById(req.params.id)
      .populate('participants.userId', 'fullName email');

    if (!virtualClass) {
      return res.status(404).json({ message: 'Virtual class not found' });
    }

    const teacher = await Teacher.findOne({ userId: req.user.id });
    if (!teacher || !virtualClass.teacherId.equals(teacher._id)) {
      return res.status(403).json({ message: 'Not authorized to export attendance for this class' });
    }

    const rows = virtualClass.participants.map(p => ({
      studentId: p.userId?._id || p.userId,
      fullName: p.userId?.fullName || '',
      email: p.userId?.email || '',
      joinedAt: p.joinedAt ? new Date(p.joinedAt).toISOString() : '',
      leftAt: p.leftAt ? new Date(p.leftAt).toISOString() : '',
      isPresent: p.isPresent
    }));

    if (format === 'csv') {
      // Build CSV manually
      const headers = ['studentId', 'fullName', 'email', 'joinedAt', 'leftAt', 'isPresent'];
      const csv = [headers.join(',')].concat(
        rows.map(r => headers.map(h => {
          const v = r[h];
          if (v === null || v === undefined) return '';
          // Escape quotes
          return `"${String(v).replace(/"/g, '""')}"`;
        }).join(','))
      ).join('\n');

      res.header('Content-Type', 'text/csv');
      res.attachment(`${virtualClass._id}_attendance.csv`);
      return res.send(csv);
    }

    // default JSON
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark attendance for a student (Teachers only)
// body: { studentId: '<userId>', isPresent: true|false }
router.patch('/:id/attendance/mark', authorize('teacher'), async (req, res) => {
  try {
    const { studentId, isPresent } = req.body;
    if (!studentId || typeof isPresent !== 'boolean') {
      return res.status(400).json({ message: 'studentId and isPresent(boolean) are required' });
    }

    const virtualClass = await VirtualClass.findById(req.params.id);
    if (!virtualClass) {
      return res.status(404).json({ message: 'Virtual class not found' });
    }

    const teacher = await Teacher.findOne({ userId: req.user.id });
    if (!teacher || !virtualClass.teacherId.equals(teacher._id)) {
      return res.status(403).json({ message: 'Not authorized to mark attendance for this class' });
    }

    const participant = virtualClass.participants.find(p => p.userId.toString() === studentId);

    if (!participant) {
      // If participant record not present, add one (teacher marking remote attendance)
      virtualClass.participants.push({
        userId: studentId,
        joinedAt: isPresent ? new Date() : null,
        leftAt: isPresent ? null : new Date(),
        isPresent
      });
    } else {
      participant.isPresent = isPresent;
      if (isPresent) {
        participant.joinedAt = participant.joinedAt || new Date();
        participant.leftAt = null;
      } else {
        participant.leftAt = participant.leftAt || new Date();
      }
    }

    await virtualClass.save();

    res.json({ success: true, message: 'Attendance updated', data: { studentId, isPresent } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Batch mark attendance (Teachers only)
// body: [{ studentId: '<userId>', isPresent: true|false }, ...]
router.patch('/:id/attendance/batch', authorize('teacher'), async (req, res) => {
  try {
    const updates = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: 'Request body must be a non-empty array of attendance updates' });
    }

    const virtualClass = await VirtualClass.findById(req.params.id);
    if (!virtualClass) {
      return res.status(404).json({ message: 'Virtual class not found' });
    }

    const teacher = await Teacher.findOne({ userId: req.user.id });
    if (!teacher || !virtualClass.teacherId.equals(teacher._id)) {
      return res.status(403).json({ message: 'Not authorized to mark attendance for this class' });
    }

    const results = [];

    for (const u of updates) {
      const { studentId, isPresent } = u || {};
      if (!studentId || typeof isPresent !== 'boolean') {
        results.push({ studentId: studentId || null, success: false, reason: 'Invalid studentId or isPresent' });
        continue;
      }

      let participant = virtualClass.participants.find(p => p.userId.toString() === studentId);
      if (!participant) {
        // Add new participant record
        participant = {
          userId: studentId,
          joinedAt: isPresent ? new Date() : null,
          leftAt: isPresent ? null : new Date(),
          isPresent
        };
        virtualClass.participants.push(participant);
      } else {
        participant.isPresent = isPresent;
        if (isPresent) {
          participant.joinedAt = participant.joinedAt || new Date();
          participant.leftAt = null;
        } else {
          participant.leftAt = participant.leftAt || new Date();
        }
      }

      results.push({ studentId, success: true });
    }

    await virtualClass.save();

    res.json({ success: true, message: 'Batch attendance updated', results });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;