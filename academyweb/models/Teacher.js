import { supabase } from '../config/supabase.js';

// Teacher Model
export class Teacher {
  constructor(data) {
    this.id = data.id;
    this.academy_id = data.academy_id;
    this.name = data.name;
    this.contact = data.contact;
    this.subject_id = data.subject_id;
    this.subject_ids = data.subject_ids || [];
    this.work_days = data.work_days || '';
    this.createdAt = data.created_at || data.createdAt || new Date();
    this.updatedAt = data.updated_at || data.updatedAt || new Date();
  }
  
  static async findAll(academyId) {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return [];
    }
    
    try {
      console.log('🔍 선생님 목록 조회 시도... academyId:', academyId);
      
      let query = supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (academyId) {
        query = query.eq('academy_id', academyId);
        console.log('🔍 academy_id 필터 적용:', academyId);
      } else {
        console.warn('⚠️ academyId가 없어서 모든 선생님 조회');
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Supabase 쿼리 에러:', error);
        console.error('에러 코드:', error.code);
        console.error('에러 메시지:', error.message);
        console.error('에러 상세:', error.details);
        console.error('에러 힌트:', error.hint);
        throw error;
      }
      
      console.log('✅ 선생님 목록 조회 성공:', data?.length || 0, '개');
      if (data && data.length > 0) {
        console.log('📋 조회된 선생님 ID 목록:', data.map(t => ({ id: t.id, name: t.name, academy_id: t.academy_id })));
      }
      
      return (data || []).map(item => {
        const teacher = new Teacher(item);
        teacher.work_days = item.work_days || '';
        teacher.subject_ids = item.subject_ids || [];
        return teacher;
      });
    } catch (error) {
      console.error('❌ 선생님 목록 조회 실패:', error);
      console.error('에러 스택:', error.stack);
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
        .from('teachers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (!data) return null;
      const teacher = new Teacher(data);
      teacher.work_days = data.work_days || '';
      teacher.subject_ids = data.subject_ids || [];
      return teacher;
    } catch (error) {
      console.error('선생님 조회 실패:', error);
      return null;
    }
  }
  
  async save() {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return this;
    }
    
    try {
      // subject_ids 처리: 배열이 아니거나 빈 배열이면 null 또는 빈 배열로 처리
      let subjectIdsArray = null;
      if (this.subject_ids) {
        if (Array.isArray(this.subject_ids) && this.subject_ids.length > 0) {
          subjectIdsArray = this.subject_ids;
        } else if (!Array.isArray(this.subject_ids) && this.subject_ids) {
          // 단일 값인 경우 배열로 변환
          subjectIdsArray = [this.subject_ids];
        }
      }
      
      const teacherData = {
        academy_id: this.academy_id,
        name: this.name,
        contact: this.contact || null,
        subject_id: this.subject_id || null,
        work_days: this.work_days || '',
        updated_at: new Date().toISOString(),
      };
      
      // subject_ids가 있을 때만 추가 (컬럼이 없을 경우를 대비)
      if (subjectIdsArray !== null) {
        teacherData.subject_ids = subjectIdsArray;
      }
      
      // null 값 제거
      Object.keys(teacherData).forEach(key => {
        if (teacherData[key] === null && key !== 'subject_ids') {
          delete teacherData[key];
        }
      });
      
      // 기존 데이터베이스에 존재하는지 확인
      let isUpdate = false;
      if (this.id) {
        try {
          const existing = await Teacher.findById(this.id);
          if (existing) {
            isUpdate = true;
            console.log('기존 선생님 발견, 업데이트 모드로 전환');
          } else {
            console.log('ID가 있지만 DB에 존재하지 않음, 생성 모드로 전환');
            this.id = null; // ID를 null로 설정하여 생성 모드로 전환
          }
        } catch (error) {
          // 조회 실패하면 새로 생성하는 것으로 간주
          console.log('기존 선생님 조회 실패, 새로 생성하는 것으로 처리:', error.message);
          this.id = null; // ID를 null로 설정하여 생성 모드로 전환
        }
      }
      
      if (isUpdate && this.id) {
        // 업데이트
        const { error: updateError } = await supabase
          .from('teachers')
          .update(teacherData)
          .eq('id', this.id);
        
        if (updateError) {
          console.error('Supabase 업데이트 에러:', updateError);
          console.error('에러 코드:', updateError.code);
          console.error('에러 메시지:', updateError.message);
          
          // HTML 응답이 오는 경우 (Cloudflare 500 에러 등)
          let errorMsg = updateError.message || updateError.details || updateError.hint || 'Failed to update teacher';
          
          if (typeof errorMsg === 'string' && errorMsg.includes('<html>')) {
            errorMsg = 'Supabase 서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
            console.error('⚠️ Supabase 서버 측 오류 감지 (500 Internal Server Error)');
          }
          
          throw new Error(`Supabase 업데이트 실패: ${errorMsg}`);
        }
        
        // 업데이트 후 다시 조회
        console.log('🔄 업데이트 후 데이터 조회 시도... ID:', this.id);
        const { data: fetchedData, error: fetchError } = await supabase
          .from('teachers')
          .select('*')
          .eq('id', this.id);
        
        if (fetchError) {
          console.error('⚠️ 업데이트 후 조회 실패:', fetchError);
          console.error('조회 에러 코드:', fetchError.code);
          console.error('조회 에러 메시지:', fetchError.message);
          console.error('조회 에러 상세:', fetchError.details);
          // 조회 실패해도 업데이트는 성공했을 수 있으므로 현재 데이터로 업데이트
          Object.assign(this, { ...this, ...teacherData });
        } else if (fetchedData && fetchedData.length > 0) {
          console.log('✅ 업데이트 후 조회 성공! 저장된 데이터:', JSON.stringify(fetchedData[0], null, 2));
          Object.assign(this, new Teacher(fetchedData[0]));
        } else {
          console.warn('⚠️ 업데이트 후 조회 결과가 비어있습니다. 현재 데이터로 업데이트');
          Object.assign(this, { ...this, ...teacherData });
        }
      } else {
        // 생성 (ID 없이 생성, Supabase가 자동 생성)
        const insertData = {
          ...teacherData,
          created_at: new Date().toISOString(),
        };
        
        // subject_ids가 null이면 제거 (컬럼이 없을 경우를 대비)
        if (insertData.subject_ids === null || insertData.subject_ids === undefined) {
          delete insertData.subject_ids;
        }
        
        console.log('📝 선생님 생성 시도 - insertData:', JSON.stringify(insertData, null, 2));
        console.log('📝 생성 모드 (ID는 Supabase가 자동 생성)');
        
        // insert 실행 (select 없이)
        const { error: insertError } = await supabase
          .from('teachers')
          .insert(insertData);
        
        if (insertError) {
          console.error('❌ Supabase 삽입 에러:', insertError);
          console.error('에러 코드:', insertError.code);
          console.error('에러 메시지:', insertError.message);
          console.error('에러 상세:', insertError.details);
          console.error('에러 힌트:', insertError.hint);
          throw new Error(insertError.message || insertError.details || 'Failed to create teacher');
        }
        
        console.log('✅ Supabase 삽입 성공!');
        console.log('✅ 삽입된 데이터:', JSON.stringify(insertData, null, 2));
        
        // insert 후 바로 조회하지 않고, 약간의 지연 후 조회 (Supabase 동기화 대기)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // insert 후 academy_id와 name으로 조회하여 저장된 데이터 확인 (ID가 없으므로)
        console.log('🔍 삽입 후 데이터 조회 시도... academy_id:', insertData.academy_id, 'name:', insertData.name);
        
        // .single() 대신 배열로 조회 (RLS 정책 문제 회피)
        const { data: fetchedData, error: fetchError } = await supabase
          .from('teachers')
          .select('*')
          .eq('academy_id', insertData.academy_id)
          .eq('name', insertData.name)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (fetchError) {
          console.error('⚠️ 삽입 후 조회 실패:', fetchError);
          console.error('조회 에러 코드:', fetchError.code);
          console.error('조회 에러 메시지:', fetchError.message);
          console.error('조회 에러 상세:', fetchError.details);
          console.error('조회 에러 힌트:', fetchError.hint);
          
          // 조회 실패해도 insert는 성공했을 수 있으므로, 생성된 데이터로 객체 업데이트
          console.log('생성된 데이터로 객체 업데이트 (조회 실패했지만 insert는 성공)');
          // ID는 나중에 조회할 때 설정됨
          Object.assign(this, new Teacher({ ...insertData }));
        } else if (fetchedData && fetchedData.length > 0) {
          console.log('✅ 삽입 후 조회 성공! 저장된 데이터:', JSON.stringify(fetchedData[0], null, 2));
          console.log('✅ 생성된 선생님 ID:', fetchedData[0].id);
          Object.assign(this, new Teacher(fetchedData[0]));
        } else {
          console.warn('⚠️ 삽입 후 조회 결과가 비어있습니다. 생성된 데이터로 객체 업데이트');
          console.warn('⚠️ 이는 RLS 정책 문제일 수 있습니다. Supabase에서 직접 데이터 확인 필요');
          Object.assign(this, new Teacher({ ...insertData }));
        }
      }
      
      return this;
    } catch (error) {
      console.error('선생님 저장 실패:', error);
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
    
    if (!this.id) {
      console.error('삭제할 선생님 ID가 없습니다.');
      throw new Error('Teacher ID is required for deletion');
    }
    
    try {
      console.log('Supabase 삭제 쿼리 실행:', this.id);
      const { data, error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', this.id)
        .select();
      
      if (error) {
        console.error('Supabase 삭제 에러:', error);
        console.error('에러 코드:', error.code);
        console.error('에러 메시지:', error.message);
        console.error('에러 상세:', error.details);
        console.error('에러 힌트:', error.hint);
        throw error;
      }
      
      console.log('Supabase 삭제 성공:', data);
      return true;
    } catch (error) {
      console.error('선생님 삭제 실패:', error);
      throw error;
    }
  }
}
