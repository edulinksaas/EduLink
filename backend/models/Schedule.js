import { supabase } from '../config/supabase.js';

// Schedule Model
export class Schedule {
  constructor(data) {
    this.id = data.id;
    this.academy_id = data.academy_id;
    this.title = data.title;
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.is_all_day = data.is_all_day || false;
    this.content = data.content || '';
    this.is_favorite = data.is_favorite || false;
    this.createdAt = data.created_at || data.createdAt || new Date();
    this.updatedAt = data.updated_at || data.updatedAt || new Date();
  }
  
  static async findAll() {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('start_date', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(item => new Schedule(item));
    } catch (error) {
      console.error('일정 목록 조회 실패:', error);
      return [];
    }
  }
  
  static async findById(id) {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data ? new Schedule(data) : null;
    } catch (error) {
      console.error('일정 조회 실패:', error);
      return null;
    }
  }

  static async findByMonth(year, month) {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return [];
    }
    
    try {
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
      
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .gte('start_date', startDate)
        .lte('start_date', endDate)
        .order('start_date', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(item => new Schedule(item));
    } catch (error) {
      console.error('월별 일정 조회 실패:', error);
      return [];
    }
  }
  
  async save() {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return this;
    }
    
    try {
      const scheduleData = {
        academy_id: this.academy_id,
        title: this.title,
        start_date: this.start_date,
        end_date: this.end_date,
        is_all_day: this.is_all_day,
        content: this.content,
        is_favorite: this.is_favorite,
        updated_at: new Date().toISOString(),
      };
      
      if (this.id) {
        // 업데이트
        const { data, error } = await supabase
          .from('schedules')
          .update(scheduleData)
          .eq('id', this.id)
          .select()
          .single();
        
        if (error) throw error;
        Object.assign(this, new Schedule(data));
      } else {
        // 생성
        const { data, error } = await supabase
          .from('schedules')
          .insert({
            ...scheduleData,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();
        
        if (error) throw error;
        Object.assign(this, new Schedule(data));
      }
      
      return this;
    } catch (error) {
      console.error('일정 저장 실패:', error);
      throw error;
    }
  }
  
  async update(data) {
    Object.assign(this, data);
    this.updatedAt = new Date();
    return await this.save();
  }
  
  async delete() {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', this.id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('일정 삭제 실패:', error);
      throw error;
    }
  }
}
