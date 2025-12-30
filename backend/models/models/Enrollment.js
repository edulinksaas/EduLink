import { supabase } from '../config/supabase.js';

// Enrollment Model
export class Enrollment {
  constructor(data) {
    this.id = data.id;
    this.academy_id = data.academy_id;
    this.class_id = data.class_id;
    this.student_id = data.student_id;
    this.status = data.status || 'active';
    this.createdAt = data.created_at || data.createdAt || new Date();
    this.updatedAt = data.updated_at || data.updatedAt || new Date();
  }
  
  static async findAll(classId = null, studentId = null) {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return [];
    }
    
    try {
      let query = supabase
        .from('enrollments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (classId) {
        query = query.eq('class_id', classId);
      }
      
      if (studentId) {
        query = query.eq('student_id', studentId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(item => new Enrollment(item));
    } catch (error) {
      console.error('수강 등록 목록 조회 실패:', error);
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
        .from('enrollments')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data ? new Enrollment(data) : null;
    } catch (error) {
      console.error('수강 등록 조회 실패:', error);
      return null;
    }
  }
  
  async save() {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return this;
    }
    
    try {
      const enrollmentData = {
        academy_id: this.academy_id,
        class_id: this.class_id,
        student_id: this.student_id,
        status: this.status,
        updated_at: new Date().toISOString(),
      };
      
      if (this.id) {
        // 업데이트
        const { data, error } = await supabase
          .from('enrollments')
          .update(enrollmentData)
          .eq('id', this.id)
          .select()
          .single();
        
        if (error) throw error;
        Object.assign(this, new Enrollment(data));
      } else {
        // 생성
        const { data, error } = await supabase
          .from('enrollments')
          .insert({
            ...enrollmentData,
            enrolled_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          })
          .select()
          .single();
        
        if (error) throw error;
        Object.assign(this, new Enrollment(data));
      }
      
      return this;
    } catch (error) {
      console.error('수강 등록 저장 실패:', error);
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
        .from('enrollments')
        .delete()
        .eq('id', this.id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('수강 등록 삭제 실패:', error);
      throw error;
    }
  }
}
