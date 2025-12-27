import crypto from 'crypto';
import { Enrollment } from '../models/Enrollment.js';

export const getEnrollments = async (req, res, next) => {
  try {
    const { class_id, student_id } = req.query;
    
    const enrollments = await Enrollment.findAll(class_id, student_id);
    res.json({ enrollments, total: enrollments.length });
  } catch (error) {
    next(error);
  }
};

export const getEnrollmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const enrollment = await Enrollment.findById(id);
    
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    res.json({ enrollment });
  } catch (error) {
    next(error);
  }
};

export const createEnrollment = async (req, res, next) => {
  try {
    const { class_id, student_id, fee, receipt_url, status, category } = req.body;
    
    if (!class_id || !student_id) {
      return res.status(400).json({ error: 'class_id and student_id are required' });
    }
    
    const enrollment = new Enrollment({
      id: crypto.randomUUID(),
      class_id,
      student_id,
      fee: fee || 0,
      receipt_url: receipt_url || '',
      status: status || '미결제',
      category: category || '신규'
    });
    
    await enrollment.save();
    res.status(201).json({ enrollment });
  } catch (error) {
    next(error);
  }
};

export const updateEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const enrollment = await Enrollment.findById(id);
    
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    await enrollment.update(req.body);
    res.json({ enrollment });
  } catch (error) {
    next(error);
  }
};

export const deleteEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const enrollment = await Enrollment.findById(id);
    
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    await enrollment.delete();
    res.json({ message: 'Enrollment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

