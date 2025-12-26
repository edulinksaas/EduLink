import { supabase } from '../config/supabase.js';

// Academy Model
export class Academy {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.logo_url = data.logo_url;
    this.address = data.address;
    this.floor = data.floor;
    this.code = data.code;
    this.createdAt = data.created_at || data.createdAt || new Date();
    this.updatedAt = data.updated_at || data.updatedAt || new Date();
  }
  
  static async findAll() {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return [];
    }
    
    try {
      console.log('학원 목록 조회 시도...');
      const { data, error } = await supabase
        .from('academies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase 쿼리 에러:', error);
        console.error('에러 코드:', error.code);
        console.error('에러 메시지:', error.message);
        console.error('에러 상세:', error.details);
        console.error('에러 힌트:', error.hint);
        throw error;
      }
      
      console.log('학원 목록 조회 성공:', data?.length || 0, '개');
      return (data || []).map(item => new Academy(item));
    } catch (error) {
      console.error('학원 목록 조회 실패:', error);
      console.error('에러 스택:', error.stack);
      return [];
    }
  }

  static async findByCode(code) {
    try {
      // 코드 정규화 (대소문자 구분 없이)
      const normalizedCode = code?.trim().toUpperCase();
      console.log(`🔍 학원 코드로 조회 시도: ${normalizedCode}`);
      
      // Service Role Key를 사용하는 Supabase 클라이언트로 직접 조회
      const { supabase: adminSupabase } = await import('../config/supabase.js');
      
      if (!adminSupabase) {
        console.error('❌ Supabase 클라이언트를 사용할 수 없습니다.');
        return null;
      }
      
      console.log('🔑 Service Role Key 사용 중:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '예' : '아니오');
      
      // 대소문자 구분 없이 조회 (ILIKE 사용)
      const { data, error } = await adminSupabase
        .from('academies')
        .select('*')
        .ilike('code', normalizedCode);
      
      if (error) {
        console.error('❌ Supabase 쿼리 에러:', error);
        console.error('에러 코드:', error.code);
        console.error('에러 메시지:', error.message);
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log(`✅ 학원 조회 성공: ${data[0].name} (${data[0].code})`);
        return new Academy(data[0]);
      } else {
        console.warn(`⚠️ 학원을 찾을 수 없음: ${normalizedCode}`);
        
        // 모든 학원 목록을 조회해서 디버깅 정보 제공
        const { data: allAcademies, error: listError } = await adminSupabase
          .from('academies')
          .select('id, name, code')
          .limit(10);
        
        if (listError) {
          console.error('❌ 학원 목록 조회 에러:', listError);
        } else {
          console.log('📋 현재 데이터베이스에 있는 학원 목록:', allAcademies);
          console.log('📋 학원 개수:', allAcademies?.length || 0);
        }
        
        return null;
      }
    } catch (error) {
      console.error('❌ 학원 조회 실패:', error);
      return null;
    }
  }
  
  static async findById(id) {
    try {
      console.log(`🔍 학원 조회 시도: ${id}`);
      
      // Service Role Key를 사용하는 Supabase 클라이언트로 직접 조회
      const { supabase: adminSupabase } = await import('../config/supabase.js');
      
      if (!adminSupabase) {
        console.error('❌ Supabase 클라이언트를 사용할 수 없습니다.');
        return null;
      }
      
      console.log('🔑 Service Role Key 사용 중:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '예' : '아니오');
      
      // Service Role Key로 직접 조회
      const { data, error } = await adminSupabase
        .from('academies')
        .select('*')
        .eq('id', id);
      
      if (error) {
        console.error('❌ Supabase 쿼리 에러:', error);
        console.error('에러 코드:', error.code);
        console.error('에러 메시지:', error.message);
        console.error('에러 상세:', error.details);
        console.error('에러 힌트:', error.hint);
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log(`✅ 학원 조회 성공: ${data[0].name} (${data[0].id})`);
        return new Academy(data[0]);
      } else {
        console.warn(`⚠️ 학원을 찾을 수 없음: ${id}`);
        
        // 모든 학원 목록을 조회해서 디버깅 정보 제공
        const { data: allAcademies, error: listError } = await adminSupabase
          .from('academies')
          .select('id, name, code')
          .limit(10);
        
        if (listError) {
          console.error('❌ 학원 목록 조회 에러:', listError);
        } else {
          console.log('📋 현재 데이터베이스에 있는 학원 목록:', allAcademies);
          console.log('📋 학원 개수:', allAcademies?.length || 0);
        }
        
        return null;
      }
    } catch (error) {
      console.error('❌ 학원 조회 실패:', error);
      console.error('에러 스택:', error.stack);
      return null;
    }
  }
  
  async save() {
    if (!supabase) {
      const errorMsg = 'Supabase가 연결되지 않았습니다. server/.env 파일에 SUPABASE_URL과 SUPABASE_ANON_KEY를 설정해주세요.';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    try {
      // name 필수 검증
      if (!this.name || !this.name.trim()) {
        throw new Error('학원 이름은 필수입니다.');
      }

      const academyData = {
        name: this.name.trim(),
        logo_url: this.logo_url || null,
        address: this.address || null,
        floor: this.floor || null,
        code: this.code || null,
        updated_at: new Date().toISOString(),
      };
      
      // 빈 문자열을 null로 변환
      Object.keys(academyData).forEach(key => {
        if (key !== 'name' && academyData[key] === '') {
          academyData[key] = null;
        }
      });
      
      if (this.id) {
        // 업데이트
        const { error: updateError } = await supabase
          .from('academies')
          .update(academyData)
          .eq('id', this.id);
        
        if (updateError) {
          console.error('Supabase 업데이트 에러:', updateError);
          console.error('Supabase 에러 코드:', updateError.code);
          console.error('Supabase 에러 상세:', JSON.stringify(updateError, null, 2));
          
          // HTML 응답이 오는 경우 (Cloudflare 500 에러 등)
          let errorMsg = updateError.message || updateError.details || updateError.hint || 'Failed to update academy';
          
          // HTML 응답인 경우 더 명확한 메시지 제공
          if (typeof errorMsg === 'string' && errorMsg.includes('<html>')) {
            errorMsg = 'Supabase 서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
            console.error('⚠️ Supabase 서버 측 오류 감지 (500 Internal Server Error)');
          }
          
          throw new Error(`Supabase 업데이트 실패: ${errorMsg}`);
        }
        
        // 업데이트 후 다시 조회
        const { data: fetchedData, error: fetchError } = await supabase
          .from('academies')
          .select('*')
          .eq('id', this.id)
          .single();
        
        if (fetchError) {
          console.warn('업데이트 후 조회 실패:', fetchError);
          // 조회 실패해도 업데이트는 성공했으므로 현재 데이터로 업데이트
          Object.assign(this, { ...this, ...academyData });
        } else if (fetchedData) {
          Object.assign(this, new Academy(fetchedData));
        } else {
          // 데이터가 없으면 현재 데이터로 업데이트
          Object.assign(this, { ...this, ...academyData });
        }
      } else {
        // 생성
        const insertData = {
          id: this.id, // 명시적으로 id 포함
          ...academyData,
          created_at: new Date().toISOString(),
        };
        
        console.log('📝 학원 생성 시도 - insertData:', JSON.stringify(insertData, null, 2));
        
        // insert 실행 (select 포함)
        const { data: insertResult, error: insertError } = await supabase
          .from('academies')
          .insert(insertData)
          .select();
        
        if (insertError) {
          console.error('❌ Supabase 삽입 에러:', insertError);
          console.error('Supabase 에러 코드:', insertError.code);
          console.error('Supabase 에러 상세:', JSON.stringify(insertError, null, 2));
          const errorMsg = insertError.message || insertError.details || insertError.hint || 'Failed to create academy';
          throw new Error(`Supabase 삽입 실패: ${errorMsg}`);
        }
        
        // insert 결과 확인
        if (insertResult && insertResult.length > 0) {
          // insert().select()가 성공하면 데이터는 저장된 것입니다
          console.log('✅ Supabase 삽입 성공! 반환된 데이터:', JSON.stringify(insertResult[0], null, 2));
          Object.assign(this, new Academy(insertResult[0]));
        } else {
          // RLS 정책으로 인해 select()가 빈 배열을 반환할 수 있지만, insert는 성공했을 수 있습니다
          // insertError가 없었다면 insert는 성공한 것입니다
          console.warn('⚠️ insert().select()가 빈 배열을 반환했습니다. RLS 정책 문제일 수 있습니다.');
          console.log('✅ Supabase insert는 성공했습니다 (에러가 없으므로). ID:', this.id);
          console.log('⚠️ RLS 정책을 비활성화하려면 DISABLE_RLS_ALL_TABLES.sql을 실행하세요.');
          // insertData로 객체 업데이트 (insert는 성공했으므로)
          Object.assign(this, new Academy({ ...insertData, id: this.id }));
        }
      }
      
      console.log('✅ 학원 저장 완료! 최종 객체:', {
        id: this.id,
        name: this.name,
        code: this.code
      });
      return this;
    } catch (error) {
      console.error('❌ 학원 저장 실패:', error);
      console.error('에러 스택:', error.stack);
      // fetch failed 에러인 경우 더 명확한 메시지 제공
      if (error.message && error.message.includes('fetch failed')) {
        throw new Error('Supabase 서버에 연결할 수 없습니다. 네트워크 연결과 server/.env 파일의 SUPABASE_URL을 확인해주세요.');
      }
      throw error;
    }
  }
  
  async update(data) {
    // 빈 문자열을 null로 변환
    const cleanedData = {};
    Object.keys(data).forEach(key => {
      if (key === 'name') {
        cleanedData[key] = data[key] && data[key].trim() ? data[key].trim() : this.name;
      } else {
        cleanedData[key] = (data[key] && data[key].toString().trim()) ? data[key] : null;
      }
    });
    
    Object.assign(this, cleanedData);
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
        .from('academies')
        .delete()
        .eq('id', this.id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('학원 삭제 실패:', error);
      throw error;
    }
  }
}
