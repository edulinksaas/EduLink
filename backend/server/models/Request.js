import { supabase } from '../config/supabase.js';

// Request Model
export class Request {
  constructor(data) {
    this.id = data.id;
    this.academy_id = data.academy_id;
    this.student_name = data.student_name;
    this.request_type = data.request_type; // absence, supplementary, change, defer
    this.request_details = data.request_details;
    this.subject = data.subject;
    this.level = data.level;
    this.schedule = data.schedule;
    this.contact_phone = data.contact_phone;
    this.contact_relation = data.contact_relation;
    this.status = data.status || 'pending'; // pending, approved, rejected, processed
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
      const requestData = {
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
      
      if (this.id) {
        // 업데이트
        const { data, error } = await supabase
          .from('requests')
          .update(requestData)
          .eq('id', this.id)
          .select()
          .single();
        
        if (error) throw error;
        Object.assign(this, new Request(data));
      } else {
        // 생성
        const { data, error } = await supabase
          .from('requests')
          .insert({
            ...requestData,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();
        
        if (error) throw error;
        Object.assign(this, new Request(data));
      }
      
      return this;
    } catch (error) {
      console.error('요청 저장 실패:', error);
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
