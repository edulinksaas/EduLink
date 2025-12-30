import express from 'express';
import {
  getAttendanceByStudent,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from '../controllers/attendance.controller.js';

const router = express.Router();

router.get('/', getAttendanceByStudent);
router.post('/', createAttendance);
router.put('/:id', updateAttendance);
router.delete('/:id', deleteAttendance);

export default router;


