import { supabase } from '../config/supabase.js';

// Subject Model
export class Subject {
  constructor(data = {}) {
    // 화이트리스트 방식: 허용된 컬럼만 명시적으로 할당
    this.id = data.id ?? null;
    this.academy_id = data.academy_id ?? null;
    this.name = data.name ?? null;
    this.color = data.color ?? '#3D62E4';
    this.description = data.description ?? null;
    this.createdAt = data.created_at ?? data.createdAt ?? new Date();
    this.updatedAt = data.updated_at ?? data.updatedAt ?? new Date();
  }
  
  static async findAll(academyId) {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return [];
    }
    
    try {
      let query = supabase
        .from('subjects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (academyId) {
        query = query.eq('academy_id', academyId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(item => new Subject(item));
    } catch (error) {
      console.error('과목 목록 조회 실패:', error);
      return [];
    }
  }
  
  static async findById(id) {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return null;
    }
    
    try {
      console.log('🔍 과목 조회 시도 - ID:', id);
      
      // Service Role Key를 사용하는 Supabase 클라이언트로 직접 조회 (RLS 우회)
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
      const supabaseKey = supabaseServiceKey || supabaseAnonKey;
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
        return null;
      }
      
      // Service Role Key 우선 사용 (RLS 우회)
      const adminSupabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false
        }
      });
      
      const { data, error } = await adminSupabase
        .from('subjects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('❌ 과목 조회 에러:', error);
        console.error('에러 코드:', error.code);
        console.error('에러 메시지:', error.message);
        
        // PGRST116은 "No rows returned" 에러
        if (error.code === 'PGRST116') {
          console.log('⚠️ 과목을 찾을 수 없습니다. ID:', id);
          return null;
        }
        throw error;
      }
      
      if (data) {
        console.log('✅ 과목 찾음:', data.name, data.id);
        return new Subject(data);
      }
      
      return null;
    } catch (error) {
      console.error('❌ 과목 조회 실패:', error);
      console.error('에러 상세:', error.message);
      return null;
    }
  }
  
  async save() {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return this;
    }
    
    try {
      // Service Role Key를 사용하는 Supabase 클라이언트 생성 (RLS 우회)
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
      const supabaseKey = supabaseServiceKey || supabaseAnonKey;
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
        throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
      }
      
      // Service Role Key 우선 사용 (RLS 우회)
      const adminSupabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false
        }
      });
      
      const subjectData = {
        academy_id: this.academy_id,
        name: this.name,
        color: this.color,
        description: this.description,
        updated_at: new Date().toISOString(),
      };
      
      // DB에 실제로 존재하는지 확인하여 생성/업데이트 구분
      let isUpdate = false;
      if (this.id) {
        const { data: existingData, error: checkError } = await adminSupabase
          .from('subjects')
          .select('id')
          .eq('id', this.id)
          .maybeSingle();
        
        if (checkError) {
          console.warn('⚠️ 기존 데이터 확인 중 에러:', checkError.message);
        } else if (existingData) {
          isUpdate = true;
          console.log('✅ 기존 과목 확인됨. 업데이트 모드로 진행:', this.id);
        } else {
          console.log('📝 새 과목으로 확인됨. 생성 모드로 진행:', this.id);
        }
      }
      
      if (isUpdate) {
        // 업데이트
        const { data: updateResult, error: updateError } = await adminSupabase
          .from('subjects')
          .update(subjectData)
          .eq('id', this.id)
          .select();
        
        if (updateError) {
          console.error('❌ Supabase 업데이트 에러:', updateError);
          console.error('에러 코드:', updateError.code);
          console.error('에러 메시지:', updateError.message);
          throw new Error(`Supabase 업데이트 실패: ${updateError.message || 'Failed to update subject'}`);
        }
        
        if (updateResult && updateResult.length > 0) {
          console.log('✅ 과목 업데이트 성공:', updateResult[0].id, updateResult[0].name);
          const saved = new Subject(updateResult[0]);
          this.id = saved.id;
          this.academy_id = saved.academy_id;
          this.name = saved.name;
          this.color = saved.color;
          this.description = saved.description;
          this.createdAt = saved.createdAt;
          this.updatedAt = saved.updatedAt;
        } else {
          console.warn('⚠️ 업데이트 결과가 없습니다.');
          this.academy_id = subjectData.academy_id ?? this.academy_id;
          this.name = subjectData.name ?? this.name;
          this.color = subjectData.color ?? this.color;
          this.description = subjectData.description ?? this.description;
        }
      } else {
        // 생성
        const insertData = {
          ...subjectData,
          created_at: new Date().toISOString(),
        };
        
        // id가 있으면 포함, 없으면 Supabase가 자동 생성
        if (this.id) {
          insertData.id = this.id;
        }
        
        console.log('📝 과목 생성 시도 - insertData:', JSON.stringify(insertData, null, 2));
        
        const { data: insertResult, error: insertError } = await adminSupabase
          .from('subjects')
          .insert(insertData)
          .select();
        
        if (insertError) {
          console.error('❌ Supabase 삽입 에러:', insertError);
          console.error('에러 코드:', insertError.code);
          console.error('에러 메시지:', insertError.message);
          console.error('에러 상세:', insertError.details);
          throw new Error(insertError.message || 'Failed to create subject');
        }
        
        if (insertResult && insertResult.length > 0) {
          console.log('✅ Supabase 삽입 성공! 반환된 데이터:', JSON.stringify(insertResult[0], null, 2));
          const saved = new Subject(insertResult[0]);
          this.id = saved.id;
          this.academy_id = saved.academy_id;
          this.name = saved.name;
          this.color = saved.color;
          this.description = saved.description;
          this.createdAt = saved.createdAt;
          this.updatedAt = saved.updatedAt;
        } else {
          // insert().select()가 빈 배열을 반환했지만 에러가 없으면 저장은 성공한 것
          // ID로 다시 조회 시도
          console.warn('⚠️ insert().select()가 빈 배열을 반환했습니다. ID로 다시 조회 시도...');
          console.log('🔍 조회할 ID:', this.id);
          
          // 약간의 지연 후 조회 (Supabase 동기화 대기)
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const { data: fetchedData, error: fetchError } = await adminSupabase
            .from('subjects')
            .select('*')
            .eq('id', this.id)
            .maybeSingle(); // maybeSingle()은 없으면 null 반환, 에러 없음
          
          if (fetchError) {
            console.error('❌ ID로 조회 실패:', fetchError);
            throw new Error(`Failed to create subject: Insert succeeded but cannot verify. ${fetchError.message}`);
          }
          
          if (fetchedData) {
            console.log('✅ ID로 조회 성공! 저장 확인됨:', JSON.stringify(fetchedData, null, 2));
            const saved = new Subject(fetchedData);
            this.id = saved.id;
            this.academy_id = saved.academy_id;
            this.name = saved.name;
            this.color = saved.color;
            this.description = saved.description;
            this.createdAt = saved.createdAt;
            this.updatedAt = saved.updatedAt;
          } else {
            console.error('❌ ID로 조회해도 과목을 찾을 수 없습니다. 저장 실패로 간주합니다.');
            throw new Error('Failed to create subject: Insert succeeded but subject not found in database');
          }
        }
      }
      
      return this;
    } catch (error) {
      console.error('과목 저장 실패:', error);
      throw error;
    }
  }
  
  async update(data) {
    // 화이트리스트 방식: 허용된 컬럼만 명시적으로 할당
    if (data.academy_id !== undefined) this.academy_id = data.academy_id;
    if (data.name !== undefined) this.name = data.name;
    if (data.color !== undefined) this.color = data.color;
    if (data.description !== undefined) this.description = data.description;
    this.updatedAt = new Date();
    return await this.save();
  }
  
  async delete() {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return false;
    }
    
    try {
      console.log('🗑️ 과목 삭제 시도 - ID:', this.id);
      
      // Service Role Key를 사용하는 Supabase 클라이언트로 직접 삭제 (RLS 우회)
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
      const supabaseKey = supabaseServiceKey || supabaseAnonKey;
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
        throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
      }
      
      // Service Role Key 우선 사용 (RLS 우회)
      const adminSupabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false
        }
      });
      
      const { error } = await adminSupabase
        .from('subjects')
        .delete()
        .eq('id', this.id);
      
      if (error) {
        console.error('❌ 과목 삭제 에러:', error);
        console.error('에러 코드:', error.code);
        console.error('에러 메시지:', error.message);
        throw error;
      }
      
      console.log('✅ 과목 삭제 성공:', this.id);
      return true;
    } catch (error) {
      console.error('❌ 과목 삭제 실패:', error);
      throw error;
    }
  }
}
