import express from 'express';
import {
  getAttendanceByStudent,
  createAttendance,
} from '../controllers/attendance.controller.js';

const router = express.Router();

router.get('/', getAttendanceByStudent);
router.post('/', createAttendance);

export default router;


