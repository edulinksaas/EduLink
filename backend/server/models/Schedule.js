import { supabase } from '../config/supabase.js';

// Schedule Model
export class Schedule {
  // 화이트리스트: 테이블 실제 컬럼만 정의
  static columns = ['id', 'academy_id', 'title', 'start_date', 'end_date', 'is_all_day', 'content', 'is_favorite', 'created_at', 'updated_at'];
  static writableColumns = ['academy_id', 'title', 'start_date', 'end_date', 'is_all_day', 'content', 'is_favorite', 'updated_at'];

  // payload 정규화 헬퍼
  static pick(obj, keys) {
    const out = {};
    for (const k of keys) {
      if (obj?.[k] !== undefined) {
        out[k] = obj[k];
      }
    }
    return out;
  }

  constructor(data = {}) {
    // 화이트리스트 방식: 허용된 컬럼만 명시적으로 할당
    this.id = data.id ?? null;
    this.academy_id = data.academy_id ?? null;
    this.title = data.title ?? null;
    this.start_date = data.start_date ?? null;
    this.end_date = data.end_date ?? null;
    this.is_all_day = data.is_all_day ?? false;
    this.content = data.content ?? '';
    this.is_favorite = data.is_favorite ?? false;
    this.createdAt = data.created_at ?? data.createdAt ?? new Date();
    this.updatedAt = data.updated_at ?? data.updatedAt ?? new Date();
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
      // 화이트리스트 방식으로 payload 생성
      const inputData = {
        academy_id: this.academy_id,
        title: this.title,
        start_date: this.start_date,
        end_date: this.end_date,
        is_all_day: this.is_all_day,
        content: this.content,
        is_favorite: this.is_favorite,
        updated_at: new Date().toISOString(),
      };

      // 개발용 가드
      const extra = Object.keys(inputData).filter(k => !Schedule.writableColumns.includes(k));
      if (extra.length) {
        console.warn('[Schedule GUARD] extra keys ignored:', extra);
      }

      // 화이트리스트 payload 생성
      const dbPayload = Schedule.pick(inputData, Schedule.writableColumns);
      
      if (this.id) {
        // 업데이트
        const { data, error } = await supabase
          .from('schedules')
          .update(dbPayload)
          .eq('id', this.id)
          .select()
          .single();
        
        if (error) throw error;
        
        // DB 결과를 화이트리스트 방식으로 반영
        if (data) {
          const saved = new Schedule(data);
          for (const k of Schedule.columns) {
            this[k] = saved[k];
          }
          this.createdAt = saved.createdAt;
          this.updatedAt = saved.updatedAt;
        }
      } else {
        // 생성
        const insertData = {
          ...dbPayload,
          created_at: new Date().toISOString(),
        };
        
        const { data, error } = await supabase
          .from('schedules')
          .insert(insertData)
          .select()
          .single();
        
        if (error) throw error;
        
        // DB 결과를 화이트리스트 방식으로 반영
        if (data) {
          const saved = new Schedule(data);
          for (const k of Schedule.columns) {
            this[k] = saved[k];
          }
          this.createdAt = saved.createdAt;
          this.updatedAt = saved.updatedAt;
        }
      }
      
      return this;
    } catch (error) {
      console.error('일정 저장 실패:', error);
      throw error;
    }
  }
  
  async update(data) {
    // 화이트리스트 방식: 허용된 컬럼만 명시적으로 할당
    if (data.academy_id !== undefined) this.academy_id = data.academy_id;
    if (data.title !== undefined) this.title = data.title;
    if (data.start_date !== undefined) this.start_date = data.start_date;
    if (data.end_date !== undefined) this.end_date = data.end_date;
    if (data.is_all_day !== undefined) this.is_all_day = data.is_all_day;
    if (data.content !== undefined) this.content = data.content;
    if (data.is_favorite !== undefined) this.is_favorite = data.is_favorite;
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
