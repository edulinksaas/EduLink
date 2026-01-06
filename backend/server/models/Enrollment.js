import { supabase } from '../config/supabase.js';

// Enrollment Model
export class Enrollment {
  // 화이트리스트: 테이블 실제 컬럼만 정의
  static columns = ['id', 'academy_id', 'class_id', 'student_id', 'status', 'enrolled_at', 'created_at', 'updated_at'];
  static writableColumns = ['academy_id', 'class_id', 'student_id', 'status', 'enrolled_at', 'updated_at'];

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
    this.class_id = data.class_id ?? null;
    this.student_id = data.student_id ?? null;
    this.status = data.status ?? 'active';
    this.enrolled_at = data.enrolled_at ?? null;
    this.createdAt = data.created_at ?? data.createdAt ?? new Date();
    this.updatedAt = data.updated_at ?? data.updatedAt ?? new Date();
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
      // 화이트리스트 방식으로 payload 생성
      const inputData = {
        academy_id: this.academy_id,
        class_id: this.class_id,
        student_id: this.student_id,
        status: this.status,
        enrolled_at: this.enrolled_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 개발용 가드
      const extra = Object.keys(inputData).filter(k => !Enrollment.writableColumns.includes(k));
      if (extra.length) {
        console.warn('[Enrollment GUARD] extra keys ignored:', extra);
      }

      // 화이트리스트 payload 생성
      const dbPayload = Enrollment.pick(inputData, Enrollment.writableColumns);
      
      if (this.id) {
        // 업데이트
        const { data, error } = await supabase
          .from('enrollments')
          .update(dbPayload)
          .eq('id', this.id)
          .select()
          .single();
        
        if (error) throw error;
        
        // DB 결과를 화이트리스트 방식으로 반영
        if (data) {
          const saved = new Enrollment(data);
          for (const k of Enrollment.columns) {
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
          .from('enrollments')
          .insert(insertData)
          .select()
          .single();
        
        if (error) throw error;
        
        // DB 결과를 화이트리스트 방식으로 반영
        if (data) {
          const saved = new Enrollment(data);
          for (const k of Enrollment.columns) {
            this[k] = saved[k];
          }
          this.createdAt = saved.createdAt;
          this.updatedAt = saved.updatedAt;
        }
      }
      
      return this;
    } catch (error) {
      console.error('수강 등록 저장 실패:', error);
      throw error;
    }
  }
  
  async update(data) {
    // 화이트리스트 방식: 허용된 컬럼만 명시적으로 할당
    if (data.academy_id !== undefined) this.academy_id = data.academy_id;
    if (data.class_id !== undefined) this.class_id = data.class_id;
    if (data.student_id !== undefined) this.student_id = data.student_id;
    if (data.status !== undefined) this.status = data.status;
    if (data.enrolled_at !== undefined) this.enrolled_at = data.enrolled_at;
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
