import express from 'express';
import {
  getTuitionFees,
  createTuitionFee,
  updateTuitionFee,
  deleteTuitionFee
} from '../controllers/tuitionFee.controller.js';

const router = express.Router();

router.get('/', getTuitionFees);
router.post('/', createTuitionFee);
router.put('/:id', updateTuitionFee);
router.delete('/:id', deleteTuitionFee);

export default router;

