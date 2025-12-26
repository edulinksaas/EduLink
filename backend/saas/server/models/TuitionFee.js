import { supabase } from '../config/supabase.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Service Role Key를 사용하는 별도 클라이언트 생성 (RLS 우회)
const getAdminSupabase = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const supabaseKey = supabaseServiceKey || supabaseAnonKey;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase 환경 변수가 설정되지 않았습니다.');
    console.warn('   SUPABASE_URL:', supabaseUrl ? '설정됨' : '없음');
    console.warn('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '설정됨' : '없음');
    console.warn('   SUPABASE_ANON_KEY:', supabaseAnonKey ? '설정됨' : '없음');
    return null;
  }
  
  // Service Role Key 사용 여부 로깅 (첫 호출 시에만)
  if (supabaseServiceKey && !getAdminSupabase._logged) {
    console.log('✅ TuitionFee: Service Role Key 사용 중 (RLS 우회)');
    getAdminSupabase._logged = true;
  } else if (!supabaseServiceKey && !getAdminSupabase._logged) {
    console.log('⚠️ TuitionFee: Anon Key 사용 중 (RLS 정책 적용됨)');
    getAdminSupabase._logged = true;
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false
    }
  });
};

// TuitionFee Model
export class TuitionFee {
  constructor(data) {
    this.id = data.id;
    this.academy_id = data.academy_id;
    this.amount = data.amount;
    this.value = data.value;
    this.class_type = data.class_type || null;
    this.payment_method = data.payment_method || null;
    this.createdAt = data.created_at || data.createdAt || new Date();
    this.updatedAt = data.updated_at || data.updatedAt || new Date();
  }
  
  static async findAll(academyId) {
    const adminSupabase = getAdminSupabase();
    if (!adminSupabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return [];
    }
    
    try {
      let query = adminSupabase
        .from('tuition_fees')
        .select('*')
        .order('value', { ascending: true });
      
      if (academyId) {
        query = query.eq('academy_id', academyId);
      }
      
      const { data, error } = await query;
      if (error) {
        console.error('수강료 목록 조회 에러:', error);
        return [];
      }
      
      return (data || []).map(item => new TuitionFee(item));
    } catch (error) {
      console.error('수강료 목록 조회 실패:', error);
      return [];
    }
  }
  
  static async findById(id) {
    const adminSupabase = getAdminSupabase();
    if (!adminSupabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return null;
    }
    
    if (!id) {
      console.error('조회할 수강료 ID가 없습니다.');
      return null;
    }
    
    try {
      console.log('수강료 조회 시도 - ID:', id);
      const { data, error } = await adminSupabase
        .from('tuition_fees')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error('수강료 조회 에러:', error);
        console.error('에러 코드:', error.code);
        console.error('에러 메시지:', error.message);
        console.error('에러 상세:', error.details);
        console.error('에러 힌트:', error.hint);
        return null;
      }
      
      if (data) {
        console.log('✅ 수강료 찾음:', { id: data.id, amount: data.amount });
        return new TuitionFee(data);
      }
      
      console.log('⚠️ 수강료를 찾을 수 없음 - ID:', id);
      // 해당 학원의 모든 수강료 조회해서 디버깅
      try {
        const { data: allData, error: allError } = await adminSupabase
          .from('tuition_fees')
          .select('id, academy_id, amount')
          .limit(10);
        
        if (allError) {
          console.error('전체 조회 에러:', allError);
        } else {
          console.log('DB에 있는 수강료 샘플:', allData);
          console.log('DB에 있는 수강료 개수:', allData?.length || 0);
        }
      } catch (debugError) {
        console.error('디버깅 조회 실패:', debugError);
      }
      
      return null;
    } catch (error) {
      console.error('수강료 조회 실패:', error);
      return null;
    }
  }
  
  async save() {
    const adminSupabase = getAdminSupabase();
    if (!adminSupabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return this;
    }
    
    try {
      const feeData = {
        academy_id: this.academy_id,
        amount: this.amount,
        value: this.value,
        class_type: this.class_type || null,
        payment_method: this.payment_method || null,
        updated_at: new Date().toISOString(),
      };
      
      let shouldInsert = true;
      
      if (this.id) {
        // ID가 있으면 먼저 존재하는지 확인
        const existingFee = await TuitionFee.findById(this.id);
        
        if (existingFee) {
          // 존재하면 업데이트
          shouldInsert = false;
          console.log('📝 수강료 UPDATE 시도 - ID:', this.id);
          const { data: updateResult, error: updateError } = await adminSupabase
            .from('tuition_fees')
            .update(feeData)
            .eq('id', this.id)
            .select();
          
          if (updateError) {
            console.error('수강료 업데이트 에러:', updateError);
            throw new Error(`수강료 업데이트 실패: ${updateError.message}`);
          }
          
          if (updateResult && updateResult.length > 0) {
            console.log('✅ UPDATE 성공:', updateResult[0]);
            Object.assign(this, new TuitionFee(updateResult[0]));
            return this;
          }
        } else {
          // 존재하지 않으면 INSERT로 처리 (새로 생성하는 경우)
          console.log('📝 ID가 있지만 DB에 존재하지 않음. INSERT로 처리 - ID:', this.id);
          shouldInsert = true;
        }
      }
      
      // INSERT 처리 (ID가 없거나, ID가 있지만 DB에 존재하지 않는 경우)
      if (shouldInsert) {
        // 생성
        const insertData = {
          ...feeData,
          created_at: new Date().toISOString(),
        };
        
        // ID가 있으면 포함 (컨트롤러에서 생성한 UUID 사용)
        if (this.id) {
          insertData.id = this.id;
        }
        
        console.log('📝 수강료 INSERT 시도 - insertData:', JSON.stringify(insertData, null, 2));
        console.log('📝 사용할 ID:', this.id);
        console.log('📝 Service Role Key 사용 여부:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 사용 중' : '❌ 없음');
        
        // INSERT 실행 (select 포함) - Service Role Key 사용 (RLS 우회)
        const { data: insertResult, error: insertError } = await adminSupabase
          .from('tuition_fees')
          .insert(insertData)
          .select();
        
        console.log('📝 INSERT 결과 - insertResult:', insertResult);
        console.log('📝 INSERT 결과 - insertError:', insertError);
        
        if (insertError) {
          console.error('❌ 수강료 생성 에러:', insertError);
          console.error('에러 코드:', insertError.code);
          console.error('에러 메시지:', insertError.message);
          console.error('에러 상세:', insertError.details);
          console.error('에러 힌트:', insertError.hint);
          throw new Error(`수강료 생성 실패: ${insertError.message}`);
        }
        
        if (!insertResult || insertResult.length === 0) {
          console.error('❌ INSERT 실패: insertResult가 비어있습니다.');
          console.error('⚠️ INSERT 쿼리는 실행되었지만 SELECT 결과가 없습니다.');
          console.error('⚠️ 이는 RLS 정책 문제이거나 테이블 구조 문제일 수 있습니다.');
          
          // 실제로 저장되었는지 확인
          if (this.id) {
            console.log('🔍 저장 확인을 위해 조회 시도 - ID:', this.id);
            const verifyFee = await TuitionFee.findById(this.id);
            if (verifyFee) {
              console.log('✅ 조회 성공 - 실제로는 저장되었습니다:', verifyFee.id);
              Object.assign(this, verifyFee);
              return this;
            }
          }
          
          throw new Error('INSERT가 실패했습니다. insertResult가 비어있고 DB에서도 찾을 수 없습니다.');
        }
        
        // insertResult가 있으면 성공
        console.log('✅ INSERT 성공 - insertResult:', insertResult[0]);
        Object.assign(this, new TuitionFee(insertResult[0]));
        console.log('✅ 저장된 수강료 ID:', this.id);
        
        // 즉시 조회하여 저장 확인
        const verifyFee = await TuitionFee.findById(this.id);
        if (verifyFee) {
          console.log('✅ 즉시 조회 성공 - DB에 저장 확인됨:', verifyFee.id);
        } else {
          console.error('❌ 즉시 조회 실패 - INSERT는 성공했지만 DB에서 찾을 수 없음');
          console.error('⚠️ 이는 심각한 문제입니다. Supabase 설정을 확인하세요.');
          throw new Error('INSERT는 성공했지만 DB에서 조회할 수 없습니다.');
        }
      }
      
      return this;
    } catch (error) {
      console.error('수강료 저장 실패:', error);
      throw error;
    }
  }
  
  async delete() {
    const adminSupabase = getAdminSupabase();
    if (!adminSupabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return false;
    }
    
    if (!this.id) {
      console.error('삭제할 수강료 ID가 없습니다.');
      throw new Error('Tuition fee ID is required for deletion');
    }
    
    try {
      console.log('Supabase 삭제 쿼리 실행 - ID:', this.id);
      const { data, error } = await adminSupabase
        .from('tuition_fees')
        .delete()
        .eq('id', this.id)
        .select();
      
      if (error) {
        console.error('수강료 삭제 에러:', error);
        console.error('에러 코드:', error.code);
        console.error('에러 메시지:', error.message);
        console.error('에러 상세:', error.details);
        console.error('에러 힌트:', error.hint);
        throw error;
      }
      
      console.log('Supabase 삭제 성공:', data);
      return true;
    } catch (error) {
      console.error('수강료 삭제 실패:', error);
      throw error;
    }
  }
}

