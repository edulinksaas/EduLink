import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import academyRoutes from './academy.routes.js';
import subjectRoutes from './subject.routes.js';
import classroomRoutes from './classroom.routes.js';
import classRoutes from './class.routes.js';
import teacherRoutes from './teacher.routes.js';
import studentRoutes from './student.routes.js';
import enrollmentRoutes from './enrollment.routes.js';
import scheduleRoutes from './schedule.routes.js';
import requestRoutes from './request.routes.js';
import timetableSettingsRoutes from './timetableSettings.routes.js';
import tuitionFeeRoutes from './tuitionFee.routes.js';
import attendanceRoutes from './attendance.routes.js';
import paymentRoutes from './payment.routes.js';
import memoRoutes from './memo.routes.js';
import parentRoutes from './parent.routes.js';

const router = express.Router();

// 인증 라우트 (인증 불필요)
router.use('/auth', authRoutes);

router.use('/users', userRoutes);
router.use('/academies', academyRoutes);
router.use('/subjects', subjectRoutes);
router.use('/classrooms', classroomRoutes);
router.use('/classes', classRoutes);
router.use('/teachers', teacherRoutes);
router.use('/students', studentRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/requests', requestRoutes);
router.use('/timetable-settings', timetableSettingsRoutes);
router.use('/tuition-fees', tuitionFeeRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/payments', paymentRoutes);
router.use('/memos', memoRoutes);
router.use('/parents', parentRoutes);

export default router;

