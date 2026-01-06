import { supabase } from '../config/supabase.js';
import crypto from 'crypto';

export class Classroom {
  constructor(data = {}) {
    // 화이트리스트 방식: 허용된 컬럼만 명시적으로 할당
    this.id = data.id ?? null;
    this.academy_id = data.academy_id ?? null;
    this.name = data.name ?? null;
    this.capacity = data.capacity ?? 20;
    this.createdAt = data.created_at ?? data.createdAt ?? new Date();
    this.updatedAt = data.updated_at ?? data.updatedAt ?? new Date();
  }
  
  static async findAll(academyId) {
    if (!supabase) {
      return [];
    }
    
    try {
      console.log('🔍 Classroom.findAll 호출 - academyId:', academyId);
      
      let query = supabase
        .from('classrooms')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (academyId) {
        query = query.eq('academy_id', academyId);
        console.log('📋 academy_id 필터 적용:', academyId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ 강의실 목록 조회 실패:', error);
        console.error('   에러 코드:', error.code);
        console.error('   에러 메시지:', error.message);
        throw error;
      }
      
      console.log('✅ 강의실 목록 조회 성공:', data?.length || 0, '개');
      if (data && data.length > 0) {
        console.log('📋 조회된 강의실 목록:');
        data.forEach((cls, index) => {
          console.log(`   ${index + 1}. ${cls.name} (ID: ${cls.id})`);
        });
      } else {
        console.warn('⚠️ 조회된 강의실이 없습니다.');
      }
      
      return (data || []).map(item => new Classroom(item));
    } catch (error) {
      console.error('강의실 목록 조회 실패:', error);
      return [];
    }
  }
  
  static async findById(id, academyId = null) {
    if (!supabase) return null;
    
    // UUID 형식이 아닌 경우 null 반환
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id));
    if (!isUUID) return null;
    
    try {
      let query = supabase
        .from('classrooms')
        .select('*')
        .eq('id', id);
      
      // academy_id가 제공된 경우 필터 추가
      if (academyId) {
        query = query.eq('academy_id', academyId);
      }
      
      const { data, error } = await query.single();
      
      if (error) {
        if (error.code === 'PGRST116' || error.code === '22P02') return null;
        throw error;
      }
      
      return data ? new Classroom(data) : null;
    } catch (error) {
      if (error.code === '22P02') return null;
      console.error('강의실 조회 실패:', error);
      return null;
    }
  }
  
  static async findByName(name, academyId) {
    if (!supabase) return null;
    
    try {
      let query = supabase
        .from('classrooms')
        .select('*')
        .eq('name', name);
      
      if (academyId) {
        query = query.eq('academy_id', academyId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      
      // 첫 번째 결과 반환
      return data && data.length > 0 ? new Classroom(data[0]) : null;
    } catch (error) {
      console.error('강의실 이름으로 조회 실패:', error);
      return null;
    }
  }
  
  async save() {
    if (!supabase) {
      throw new Error('Supabase가 연결되지 않았습니다.');
    }
    
    try {
      const classroomData = {
        academy_id: this.academy_id,
        name: this.name,
        capacity: this.capacity,
        updated_at: new Date().toISOString(),
      };
      
      if (this.id) {
        // 업데이트
        const { error } = await supabase
          .from('classrooms')
          .update(classroomData)
          .eq('id', this.id);
        
        if (error) throw error;
      } else {
        // 생성 - INSERT만 실행 (SELECT는 실패할 수 있으므로 생략)
        const insertData = {
          ...classroomData,
          id: this.id || crypto.randomUUID(),
          created_at: new Date().toISOString(),
        };
        
        const { error } = await supabase
          .from('classrooms')
          .insert(insertData);
        
        if (error) throw error;
        
        // INSERT 성공 시 메모리상의 데이터로 설정 (화이트리스트 방식)
        this.id = insertData.id;
        const temp = new Classroom({ ...insertData });
        this.academy_id = temp.academy_id;
        this.name = temp.name;
        this.capacity = temp.capacity;
        this.createdAt = temp.createdAt;
        this.updatedAt = temp.updatedAt;
      }
      
      return this;
    } catch (error) {
      console.error('강의실 저장 실패:', error);
      throw error;
    }
  }
  
  async update(data) {
    // 화이트리스트 방식: 허용된 컬럼만 명시적으로 할당
    if (data.academy_id !== undefined) this.academy_id = data.academy_id;
    if (data.name !== undefined) this.name = data.name;
    if (data.capacity !== undefined) this.capacity = data.capacity;
    this.updatedAt = new Date();
    return await this.save();
  }
  
  async delete() {
    if (!supabase) {
      throw new Error('Supabase가 연결되지 않았습니다.');
    }
    
    try {
      const { error } = await supabase
        .from('classrooms')
        .delete()
        .eq('id', this.id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('강의실 삭제 실패:', error);
      throw error;
    }
  }
}
