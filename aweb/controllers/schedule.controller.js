import crypto from 'crypto';
import { Schedule } from '../models/Schedule.js';

export const getSchedules = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    
    if (year && month) {
      const schedules = await Schedule.findByMonth(parseInt(year), parseInt(month));
      return res.json({ schedules, total: schedules.length });
    }
    
    const schedules = await Schedule.findAll();
    res.json({ schedules, total: schedules.length });
  } catch (error) {
    next(error);
  }
};

export const getScheduleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findById(id);
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.json({ schedule });
  } catch (error) {
    next(error);
  }
};

export const createSchedule = async (req, res, next) => {
  try {
    const { title, start_date, end_date, is_all_day, content, academy_id } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    
    const schedule = new Schedule({
      id: crypto.randomUUID(),
      title,
      start_date,
      end_date,
      is_all_day: is_all_day || false,
      content: content || '',
      academy_id: academy_id || null,
    });
    
    await schedule.save();
    res.status(201).json({ schedule });
  } catch (error) {
    next(error);
  }
};

export const updateSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findById(id);
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    await schedule.update(req.body);
    res.json({ schedule });
  } catch (error) {
    next(error);
  }
};

export const deleteSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findById(id);
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    await schedule.delete();
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    next(error);
  }
};

