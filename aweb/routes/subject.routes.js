import express from 'express';
import {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject
} from '../controllers/subject.controller.js';
const router = express.Router();

// 구체적인 라우트를 먼저 정의
router.get('/', getSubjects);
router.post('/', createSubject);

// 파라미터가 있는 라우트는 나중에 정의
router.get('/:id', getSubjectById);
router.put('/:id', updateSubject);
router.delete('/:id', deleteSubject);

export default router;

