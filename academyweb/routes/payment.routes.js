import express from 'express';
import {
  getPaymentsByStudent,
  createPayment,
} from '../controllers/payment.controller.js';

const router = express.Router();

router.get('/', getPaymentsByStudent);
router.post('/', createPayment);

export default router;


