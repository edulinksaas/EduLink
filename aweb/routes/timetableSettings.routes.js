import express from 'express';
import {
  getTimetableSettings,
  saveTimetableSettings
} from '../controllers/timetableSettings.controller.js';

const router = express.Router();

router.get('/', getTimetableSettings);
router.post('/', saveTimetableSettings);
router.put('/', saveTimetableSettings); // PUT도 POST와 동일하게 처리

export default router;

