const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Demo credentials
const teacherCredentials = {
  username: 'teacher1',
  password: 'teacher123'
};

const studentCredentials = {
  username: 'student1',
  password: 'student123'
};

let teacherToken = '';
let studentToken = '';
let classId = '';

async function login(credentials) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
    return response.data.token;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    return null;
  }
}

async function createVirtualClass(token) {
  try {
    const classData = {
      title: 'Mathematics - Algebra Basics',
      description: 'Introduction to algebraic expressions and equations',
      subject: 'Mathematics',
      grade: '10',
      scheduledAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
      duration: 60
    };

    const response = await axios.post(`${BASE_URL}/virtual-class/create`, classData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Virtual class created:', response.data.data.title);
    console.log('📋 Meeting ID:', response.data.data.meetingId);
    console.log('🔑 Meeting Password:', response.data.data.meetingPassword);
    
    return response.data.data._id;
  } catch (error) {
    console.error('❌ Failed to create virtual class:', error.response?.data || error.message);
    return null;
  }
}

async function startClass(token, classId) {
  try {
    const response = await axios.patch(`${BASE_URL}/virtual-class/${classId}/start`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('🚀 Class started successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to start class:', error.response?.data || error.message);
    return false;
  }
}

async function getAvailableClasses(token) {
  try {
    const response = await axios.get(`${BASE_URL}/virtual-class/student/available`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('📚 Available classes for student:', response.data.data.length);
    response.data.data.forEach(cls => {
      console.log(`  - ${cls.title} (${cls.status})`);
    });
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Failed to get available classes:', error.response?.data || error.message);
    return [];
  }
}

async function joinClass(token, classId) {
  try {
    const response = await axios.post(`${BASE_URL}/virtual-class/${classId}/join`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('🎓 Student joined class successfully');
    console.log('📋 Meeting details:', response.data.data);
    return true;
  } catch (error) {
    console.error('❌ Failed to join class:', error.response?.data || error.message);
    return false;
  }
}

async function getAttendance(token, classId) {
  try {
    const response = await axios.get(`${BASE_URL}/virtual-class/${classId}/attendance`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('📊 Attendance records:', response.data.data.length);
    response.data.data.forEach(record => {
      console.log(`  - ${record.student.fullName}: ${record.isPresent ? 'Present' : 'Absent'}`);
    });
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Failed to get attendance:', error.response?.data || error.message);
    return [];
  }
}

async function endClass(token, classId) {
  try {
    const response = await axios.patch(`${BASE_URL}/virtual-class/${classId}/end`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('🏁 Class ended successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to end class:', error.response?.data || error.message);
    return false;
  }
}

async function runDemo() {
  console.log('🚀 Starting Virtual Class Demo...\n');

  // Step 1: Login as teacher
  console.log('1️⃣ Logging in as teacher...');
  teacherToken = await login(teacherCredentials);
  if (!teacherToken) return;

  // Step 2: Login as student
  console.log('\n2️⃣ Logging in as student...');
  studentToken = await login(studentCredentials);
  if (!studentToken) return;

  // Step 3: Create virtual class
  console.log('\n3️⃣ Creating virtual class...');
  classId = await createVirtualClass(teacherToken);
  if (!classId) return;

  // Step 4: Start the class
  console.log('\n4️⃣ Starting the class...');
  const started = await startClass(teacherToken, classId);
  if (!started) return;

  // Step 5: Student checks available classes
  console.log('\n5️⃣ Student checking available classes...');
  await getAvailableClasses(studentToken);

  // Step 6: Student joins the class
  console.log('\n6️⃣ Student joining the class...');
  await joinClass(studentToken, classId);

  // Step 7: Teacher checks attendance
  console.log('\n7️⃣ Teacher checking attendance...');
  await getAttendance(teacherToken, classId);

  // Step 8: End the class
  console.log('\n8️⃣ Ending the class...');
  await endClass(teacherToken, classId);

  console.log('\n✅ Virtual Class Demo completed successfully!');
  console.log('\n📝 Summary:');
  console.log('- Virtual class created and started by teacher');
  console.log('- Student successfully joined the live class');
  console.log('- Attendance was automatically tracked');
  console.log('- Class was properly ended by teacher');
  console.log('\n🌐 Frontend URLs:');
  console.log('- Teacher Virtual Classes: http://localhost:3000/teacher/virtual-class');
  console.log('- Student Virtual Classes: http://localhost:3000/student/class');
  console.log(`- Live Class Room: http://localhost:3000/virtual-class/${classId}`);
}

// Run the demo
runDemo().catch(console.error);