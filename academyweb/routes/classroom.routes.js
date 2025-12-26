import express from 'express';
import {
  getClassrooms,
  getClassroomById,
  createClassroom,
  updateClassroom,
  deleteClassroom
} from '../controllers/classroom.controller.js';
const router = express.Router();

router.get('/', getClassrooms);
router.get('/:id', getClassroomById);
router.post('/', createClassroom);
router.put('/:id', updateClassroom);
router.delete('/:id', deleteClassroom);

export default router;

