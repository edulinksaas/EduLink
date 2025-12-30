import express from 'express';
import {
  getAttendanceByStudent,
  createAttendance,
  deleteAttendance,
} from '../controllers/attendance.controller.js';

const router = express.Router();

// 라우트 등록 확인 로그
console.log('✅ Attendance routes 등록 중...');
console.log('   GET    /attendance');
console.log('   POST   /attendance');
console.log('   DELETE /attendance/:id');

// Express 라우트 매칭 순서 문제 해결: DELETE를 먼저 등록
router.delete('/:id', deleteAttendance);
router.get('/', getAttendanceByStudent);
router.post('/', createAttendance);

export default router;


