import crypto from 'crypto';
import { Classroom } from '../models/Classroom.js';

export const getClassrooms = async (req, res, next) => {
  try {
    const { academy_id } = req.query;
    
    if (!academy_id) {
      return res.status(400).json({ error: 'academy_id is required' });
    }
    
    const classrooms = await Classroom.findAll(academy_id);
    res.json({ classrooms, total: classrooms.length });
  } catch (error) {
    next(error);
  }
};

export const getClassroomById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const classroom = await Classroom.findById(id);
    
    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }
    
    res.json({ classroom });
  } catch (error) {
    next(error);
  }
};

export const createClassroom = async (req, res, next) => {
  try {
    const { academy_id, name, capacity } = req.body;
    
    if (!academy_id || !name || !capacity) {
      return res.status(400).json({ error: 'academy_id, name, and capacity are required' });
    }
    
    const classroom = new Classroom({
      academy_id,
      name,
      capacity: parseInt(capacity)
    });
    
    await classroom.save();
    res.status(201).json({ classroom });
  } catch (error) {
    next(error);
  }
};

export const updateClassroom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const classroom = await Classroom.findById(id);
    
    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }
    
    await classroom.update(req.body);
    res.json({ classroom });
  } catch (error) {
    next(error);
  }
};

export const deleteClassroom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const classroom = await Classroom.findById(id);
    
    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }
    
    await classroom.delete();
    res.json({ message: 'Classroom deleted successfully' });
  } catch (error) {
    next(error);
  }
};

