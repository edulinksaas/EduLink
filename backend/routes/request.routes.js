import express from 'express';
import {
  getRequests,
  getRequestById,
  approveRequest,
  rejectRequest,
  processAbsence,
  processSupplementary,
  processChange,
  processDefer
} from '../controllers/request.controller.js';

const router = express.Router();

router.get('/', getRequests);
router.get('/:id', getRequestById);
router.post('/:id/approve', approveRequest);
router.post('/:id/reject', rejectRequest);
router.post('/:id/process-absence', processAbsence);
router.post('/:id/process-supplementary', processSupplementary);
router.post('/:id/process-change', processChange);
router.post('/:id/process-defer', processDefer);

export default router;

