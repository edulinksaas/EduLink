import express from 'express';
import {
  getParentById,
  getParentByPhone,
  getChildrenByParentId,
  createParent,
  createParentStudentRelation,
  deleteParentStudentRelation,
  checkParentAppRegistration,
} from '../controllers/parent.controller.js';

const router = express.Router();

// 학부모 조회
router.get('/:id', getParentById);

// 전화번호로 학부모 조회
router.get('/phone/search', getParentByPhone);

// parentsapp 가입 여부 확인
router.get('/phone/check-registration', checkParentAppRegistration);

// 학부모별 자녀 목록 조회
router.get('/:id/children', getChildrenByParentId);

// 학부모 생성
router.post('/', createParent);

// 학부모-학생 관계 생성
router.post('/:parentId/children/:studentId', createParentStudentRelation);

// 학부모-학생 관계 삭제
router.delete('/:parentId/children/:studentId', deleteParentStudentRelation);

export default router;


