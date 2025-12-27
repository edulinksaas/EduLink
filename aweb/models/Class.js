import { supabase } from '../config/supabase.js';

export class Class {
  constructor(data) {
    this.id = data.id;
    this.academy_id = data.academy_id;
    this.subject_id = data.subject_id;
    this.teacher_id = data.teacher_id;
    this.classroom_id = data.classroom_id;
    this.name = data.name;
    this.level = data.level;
    this.schedule = data.schedule;
    this.start_time = data.start_time;
    this.end_time = data.end_time;
    this.max_students = data.max_students;
    this.createdAt = data.created_at || data.createdAt || new Date();
    this.updatedAt = data.updated_at || data.updatedAt || new Date();
  }
  
  static async findAll(academyId) {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return [];
    }
    
    try {
      console.log('🔍 Class.findAll 호출 - academyId:', academyId);
      
      let query = supabase
        .from('classes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (academyId) {
        query = query.eq('academy_id', academyId);
        console.log('📋 academy_id 필터 적용:', academyId);
      } else {
        console.log('⚠️ academy_id가 없어 전체 수업 조회');
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ 수업 목록 조회 실패:', error);
        console.error('   에러 코드:', error.code);
        console.error('   에러 메시지:', error.message);
        console.error('   에러 상세:', error.details);
        throw error;
      }
      
      console.log('✅ 수업 목록 조회 성공:', data?.length || 0, '개');
      if (data && data.length > 0) {
        console.log('📋 조회된 수업 목록:');
        data.forEach((cls, index) => {
          console.log(`   ${index + 1}. ${cls.name} (ID: ${cls.id}, classroom_id: ${cls.classroom_id}, start_time: ${cls.start_time})`);
        });
      } else {
        console.warn('⚠️ 조회된 수업이 없습니다.');
        // academy_id가 있는 경우, 전체 수업도 확인해보기
        if (academyId) {
          console.log('🔍 전체 수업 확인 중...');
          const { data: allData, error: allError } = await supabase
            .from('classes')
            .select('id, academy_id, name')
            .limit(10);
          
          if (!allError && allData) {
            console.log('📋 전체 수업 개수:', allData.length);
            console.log('📋 전체 수업 목록:', allData.map(c => ({ id: c.id, academy_id: c.academy_id, name: c.name })));
            const matchingAcademy = allData.filter(c => c.academy_id === academyId);
            console.log('📋 요청한 academy_id와 일치하는 수업:', matchingAcademy.length, '개');
          }
        }
      }
      
      return (data || []).map(item => new Class(item));
    } catch (error) {
      console.error('수업 목록 조회 실패:', error);
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
        .from('classes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      
      return data ? new Class(data) : null;
    } catch (error) {
      console.error('수업 조회 실패:', error);
      return null;
    }
  }
  
  static async findByTeacherId(teacherId) {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', teacherId);
      
      if (error) throw error;
      
      return (data || []).map(item => new Class(item));
    } catch (error) {
      console.error('선생님별 수업 조회 실패:', error);
      return [];
    }
  }
  
  async save(forceInsert = false) {
    if (!supabase) {
      throw new Error('Supabase가 연결되지 않았습니다.');
    }
    
    try {
      // classroom_id가 없으면 에러 발생
      if (!this.classroom_id) {
        console.error('❌ classroom_id가 없습니다:', {
          id: this.id,
          name: this.name,
          academy_id: this.academy_id
        });
        throw new Error('classroom_id는 필수입니다.');
      }
      
      const classData = {
        academy_id: this.academy_id,
        subject_id: this.subject_id,
        teacher_id: this.teacher_id,
        classroom_id: this.classroom_id,
        name: this.name,
        level: this.level,
        schedule: this.schedule,
        start_time: this.start_time,
        end_time: this.end_time,
        max_students: this.max_students,
        updated_at: new Date().toISOString(),
      };
      
      console.log('💾 저장할 수업 데이터:', {
        id: this.id,
        name: this.name,
        classroom_id: this.classroom_id,
        academy_id: this.academy_id
      });
      
      if (this.id && !forceInsert) {
        // 업데이트
        const { data, error } = await supabase
          .from('classes')
          .update(classData)
          .eq('id', this.id)
          .select()
          .single();
        
        if (error) throw error;
        
        if (data) {
          Object.assign(this, new Class(data));
        }
      } else {
        // 생성
        const insertData = {
          ...classData,
          id: this.id,
          created_at: new Date().toISOString(),
        };
        
        console.log('💾 INSERT 데이터:', JSON.stringify(insertData, null, 2));
        
        const { data, error } = await supabase
          .from('classes')
          .insert(insertData)
          .select()
          .single();
        
        if (error) {
          console.error('❌ INSERT 에러:', error);
          console.error('   INSERT 데이터:', JSON.stringify(insertData, null, 2));
          throw error;
        }
        
        console.log('✅ INSERT 성공:', {
          id: data?.id,
          name: data?.name,
          classroom_id: data?.classroom_id
        });
        
        if (error) throw error;
        
        if (data) {
          Object.assign(this, new Class(data));
        } else {
          // INSERT는 성공했지만 SELECT가 실패한 경우
          Object.assign(this, new Class({ ...insertData }));
        }
      }
      
      return this;
    } catch (error) {
      console.error('수업 저장 실패:', error);
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
      throw new Error('Supabase가 연결되지 않았습니다.');
    }
    
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', this.id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('수업 삭제 실패:', error);
      throw error;
    }
  }
}
