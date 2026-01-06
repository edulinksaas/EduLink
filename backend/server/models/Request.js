import { supabase } from '../config/supabase.js';

// Request Model
export class Request {
  // 화이트리스트: 테이블 실제 컬럼만 정의
  static columns = ['id', 'academy_id', 'student_name', 'request_type', 'request_details', 'subject', 'level', 'schedule', 'contact_phone', 'contact_relation', 'status', 'created_at', 'updated_at'];
  static writableColumns = ['academy_id', 'student_name', 'request_type', 'request_details', 'subject', 'level', 'schedule', 'contact_phone', 'contact_relation', 'status', 'updated_at'];

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
    this.student_name = data.student_name ?? null;
    this.request_type = data.request_type ?? null;
    this.request_details = data.request_details ?? null;
    this.subject = data.subject ?? null;
    this.level = data.level ?? null;
    this.schedule = data.schedule ?? null;
    this.contact_phone = data.contact_phone ?? null;
    this.contact_relation = data.contact_relation ?? null;
    this.status = data.status ?? 'pending';
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
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(item => new Request(item));
    } catch (error) {
      console.error('요청 목록 조회 실패:', error);
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
        .from('requests')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data ? new Request(data) : null;
    } catch (error) {
      console.error('요청 조회 실패:', error);
      return null;
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
        student_name: this.student_name,
        request_type: this.request_type,
        request_details: this.request_details,
        subject: this.subject,
        level: this.level,
        schedule: this.schedule,
        contact_phone: this.contact_phone,
        contact_relation: this.contact_relation,
        status: this.status,
        updated_at: new Date().toISOString(),
      };

      // 개발용 가드
      const extra = Object.keys(inputData).filter(k => !Request.writableColumns.includes(k));
      if (extra.length) {
        console.warn('[Request GUARD] extra keys ignored:', extra);
      }

      // 화이트리스트 payload 생성
      const dbPayload = Request.pick(inputData, Request.writableColumns);
      
      if (this.id) {
        // 업데이트
        const { data, error } = await supabase
          .from('requests')
          .update(dbPayload)
          .eq('id', this.id)
          .select()
          .single();
        
        if (error) throw error;
        
        // DB 결과를 화이트리스트 방식으로 반영
        if (data) {
          const saved = new Request(data);
          for (const k of Request.columns) {
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
          .from('requests')
          .insert(insertData)
          .select()
          .single();
        
        if (error) throw error;
        
        // DB 결과를 화이트리스트 방식으로 반영
        if (data) {
          const saved = new Request(data);
          for (const k of Request.columns) {
            this[k] = saved[k];
          }
          this.createdAt = saved.createdAt;
          this.updatedAt = saved.updatedAt;
        }
      }
      
      return this;
    } catch (error) {
      console.error('요청 저장 실패:', error);
      throw error;
    }
  }
  
  async update(data) {
    // 화이트리스트 방식: 허용된 컬럼만 명시적으로 할당
    if (data.academy_id !== undefined) this.academy_id = data.academy_id;
    if (data.student_name !== undefined) this.student_name = data.student_name;
    if (data.request_type !== undefined) this.request_type = data.request_type;
    if (data.request_details !== undefined) this.request_details = data.request_details;
    if (data.subject !== undefined) this.subject = data.subject;
    if (data.level !== undefined) this.level = data.level;
    if (data.schedule !== undefined) this.schedule = data.schedule;
    if (data.contact_phone !== undefined) this.contact_phone = data.contact_phone;
    if (data.contact_relation !== undefined) this.contact_relation = data.contact_relation;
    if (data.status !== undefined) this.status = data.status;
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
        .from('requests')
        .delete()
        .eq('id', this.id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('요청 삭제 실패:', error);
      throw error;
    }
  }
}
