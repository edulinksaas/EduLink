import express from 'express';
import { getMemosByStudent, createMemo } from '../controllers/memo.controller.js';

const router = express.Router();

router.get('/', getMemosByStudent);
router.post('/', createMemo);

export default router;


