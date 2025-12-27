import { Payment } from '../models/Payment.js';

// GET /api/payments?student_id=...
export const getPaymentsByStudent = async (req, res, next) => {
  try {
    const { student_id } = req.query;

    if (!student_id) {
      return res.status(400).json({ error: 'student_id is required' });
    }

    const payments = await Payment.findByStudent(student_id);
    res.json({ payments, total: payments.length });
  } catch (error) {
    next(error);
  }
};

// POST /api/payments
export const createPayment = async (req, res, next) => {
  try {
    const {
      academy_id,
      student_id,
      class_id,
      amount,
      remaining_sessions,
      next_payment_date,
      invoice_issued,
      unpaid,
    } = req.body;

    if (!academy_id || !student_id || typeof amount === 'undefined') {
      return res
        .status(400)
        .json({ error: 'academy_id, student_id, amount are required' });
    }

    const payment = new Payment({
      academy_id,
      student_id,
      class_id: class_id || null,
      amount: typeof amount === 'number' ? amount : parseInt(amount, 10) || 0,
      remaining_sessions:
        typeof remaining_sessions === 'number'
          ? remaining_sessions
          : remaining_sessions
          ? parseInt(remaining_sessions, 10)
          : null,
      next_payment_date: next_payment_date || null,
      invoice_issued: !!invoice_issued,
      unpaid: !!unpaid,
    });

    await payment.save();
    res.status(201).json({ payment });
  } catch (error) {
    next(error);
  }
};


