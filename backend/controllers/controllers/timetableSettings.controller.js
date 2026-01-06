import { TimetableSettings } from '../models/TimetableSettings.js';

export const getTimetableSettings = async (req, res, next) => {
  try {
    const { academy_id } = req.query;
    
    if (!academy_id) {
      return res.status(400).json({ error: 'academy_id is required' });
    }
    
    const settings = await TimetableSettings.findByAcademyId(academy_id);
    
    if (!settings) {
      return res.json({ 
        settings: null,
        message: '시간표 설정이 없습니다.' 
      });
    }
    
    res.json({ settings });
  } catch (error) {
    next(error);
  }
};

export const saveTimetableSettings = async (req, res, next) => {
  try {
    const { academy_id, operating_days, time_interval, day_time_settings, timetable_name, classroom_ids, difficulties, class_types, zones } = req.body;
    
    if (!academy_id) {
      return res.status(400).json({ error: 'academy_id is required' });
    }
    
    const settings = new TimetableSettings({
      academy_id,
      operating_days: operating_days || [],
      time_interval: time_interval || '1시간',
      day_time_settings: day_time_settings || {},
      timetable_name: timetable_name || null,
      classroom_ids: Array.isArray(classroom_ids) ? classroom_ids : [],
      difficulties: Array.isArray(difficulties) ? difficulties : [],
      class_types: Array.isArray(class_types) ? class_types : [],
      zones: Array.isArray(zones) ? zones : [],
    });
    
    await settings.save();
    
    res.json({ 
      settings,
      message: '시간표 설정이 저장되었습니다.' 
    });
  } catch (error) {
    console.error('시간표 설정 저장 실패:', error);
    next(error);
  }
};

