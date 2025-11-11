require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Teacher = require('./models/Teacher');
const Student = require('./models/Student');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    await connectDB();

    // Clear existing users
    await User.deleteMany({});
    await Teacher.deleteMany({});
    await Student.deleteMany({});

    // Create demo users
    const users = [
      {
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        fullName: 'System Administrator',
        email: 'admin@ndemlp.gov.in'
      },
      {
        username: 'teacher1',
        password: 'teacher123',
        role: 'teacher',
        fullName: 'Dr. Priya Sharma',
        email: 'teacher1@ndemlp.gov.in'
      },
      {
        username: 'student1',
        password: 'student123',
        role: 'student',
        fullName: 'Sharman Kumar',
        email: 'student1@ndemlp.gov.in'
      }
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${user.username}`);

      // Create role-specific profiles
      if (user.role === 'teacher') {
        const teacher = new Teacher({
          userId: user._id,
          qualifications: 'M.Sc. Computer Science, B.Ed.',
          subjects: ['Computer Science', 'Mathematics'],
          assignedClasses: []
        });
        await teacher.save();
        console.log(`Created teacher profile for: ${user.username}`);
      } else if (user.role === 'student') {
        const student = new Student({
          userId: user._id,
          enrollNo: 'STU001',
          standard: '10th',
          parentsContact: '+91-9876543210',
          address: 'New Delhi, India'
        });
        await student.save();
        console.log(`Created student profile for: ${user.username}`);
      }
    }

    console.log('Demo users created successfully!');
    console.log('\nDemo Credentials:');
    console.log('Admin: admin / admin123');
    console.log('Teacher: teacher1 / teacher123');
    console.log('Student: student1 / student123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();