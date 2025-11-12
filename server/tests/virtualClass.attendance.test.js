const request = require('supertest');
const express = require('express');

// Helper to mount router with per-test mocks using isolateModules
const mountAppWithMocks = async (mocks) => {
  jest.isolateModules(() => {
    // Provide middleware mock
    jest.doMock('../middlewares/auth', () => ({
      auth: (req, res, next) => next(),
      authorize: (role) => (req, res, next) => { req.user = { id: 'teacherUserId', role: 'teacher' }; next(); }
    }));

    // Provide model mocks
    jest.doMock('../models/VirtualClass', () => mocks.VirtualClassModule);
    jest.doMock('../models/Teacher', () => mocks.TeacherModule);
  });

  // After doMock, require the router fresh
  const router = require('../routes/virtualClass');
  const app = express();
  app.use(express.json());
  app.use('/api/virtualClass', router);
  return app;
};

describe('VirtualClass attendance endpoints', () => {
  afterEach(() => {
    jest.resetModules();
  });

  test('GET /:id/attendance returns participants for teacher owner', async () => {
    const fakeClass = {
      _id: 'class1',
      teacherId: { equals: (other) => String(other) === 'teacher1', toString: () => 'teacher1' },
      participants: [
        { userId: { _id: 's1', fullName: 'Student One', email: 's1@example.com' }, joinedAt: new Date('2025-01-01T10:00:00Z'), leftAt: null, isPresent: true }
      ]
    };

    const VirtualClassModule = {
      findById: jest.fn().mockImplementation(() => ({
        populate: function() { return this; },
        then: (onFulfilled) => Promise.resolve(onFulfilled(fakeClass)),
        catch: () => {}
      }))
    };
    const TeacherModule = {
      findOne: jest.fn().mockResolvedValue({ _id: 'teacher1', userId: 'teacherUserId' })
    };

    const app = await mountAppWithMocks({ VirtualClassModule, TeacherModule });

    const res = await request(app)
      .get('/api/virtualClass/class1/attendance')
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].student.fullName).toBe('Student One');
  });

  test('PATCH /:id/attendance/batch updates multiple students', async () => {
    const fakeClass = {
      _id: 'class1',
      teacherId: { equals: (other) => String(other) === 'teacher1', toString: () => 'teacher1' },
      participants: [
        { userId: 's1', joinedAt: null, leftAt: null, isPresent: false }
      ],
      save: jest.fn().mockResolvedValue(true)
    };

    const VirtualClassModule = {
      // this route awaits directly on findById without populate, so return a resolved promise
      findById: jest.fn().mockResolvedValue(fakeClass)
    };
    const TeacherModule = {
      findOne: jest.fn().mockResolvedValue({ _id: 'teacher1', userId: 'teacherUserId' })
    };

    const app = await mountAppWithMocks({ VirtualClassModule, TeacherModule });

    const payload = [
      { studentId: 's1', isPresent: true },
      { studentId: 's2', isPresent: false }
    ];

    const res = await request(app)
      .patch('/api/virtualClass/class1/attendance/batch')
      .send(payload)
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.results).toHaveLength(2);
    expect(fakeClass.participants.find(p => p.userId === 's1').isPresent).toBe(true);
  });

  test('GET /:id/attendance/export returns CSV', async () => {
    const fakeClass = {
      _id: 'class1',
      teacherId: { equals: (other) => String(other) === 'teacher1', toString: () => 'teacher1' },
      participants: [
        { userId: { _id: 's1', fullName: 'Student One', email: 's1@example.com' }, joinedAt: new Date('2025-01-01T10:00:00Z'), leftAt: null, isPresent: true }
      ]
    };

    const VirtualClassModule = {
      findById: jest.fn().mockImplementation(() => ({
        populate: function() { return this; },
        then: (onFulfilled) => Promise.resolve(onFulfilled(fakeClass)),
        catch: () => {}
      }))
    };
    const TeacherModule = {
      findOne: jest.fn().mockResolvedValue({ _id: 'teacher1', userId: 'teacherUserId' })
    };

    const app = await mountAppWithMocks({ VirtualClassModule, TeacherModule });

    const res = await request(app)
      .get('/api/virtualClass/class1/attendance/export?format=csv')
      .set('Accept', 'text/csv');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.text).toContain('studentId,fullName,email,joinedAt,leftAt,isPresent');
    expect(res.text).toContain('Student One');
  });
});
