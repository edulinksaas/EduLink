import { supabase } from '../config/supabase.js';
import bcrypt from 'bcrypt';

// User Model
export class User {
  // 화이트리스트: 테이블 실제 컬럼만 정의
  // password_hash는 민감 정보이므로 writableColumns에 포함하되, update 시 주의 필요
  static columns = ['id', 'academy_code', 'password_hash', 'academy_id', 'name', 'email', 'phone', 'role', 'created_at', 'updated_at'];
  static writableColumns = ['academy_code', 'password_hash', 'academy_id', 'name', 'email', 'phone', 'role', 'updated_at'];

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
    this.academy_code = data.academy_code ?? null;
    this.password_hash = data.password_hash ?? null;
    this.academy_id = data.academy_id ?? null;
    this.name = data.name ?? null;
    this.email = data.email ?? null;
    this.phone = data.phone ?? null;
    this.role = data.role ?? 'admin';
    this.createdAt = data.created_at ?? data.createdAt ?? new Date();
    this.updatedAt = data.updated_at ?? data.updatedAt ?? new Date();
  }

  static async findByAcademyCode(academyCode) {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return null;
    }

    try {
      const normalizedCode = academyCode?.trim().toUpperCase();
      console.log('🔍 사용자 조회 시도 - 학원 코드:', normalizedCode);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('academy_code', normalizedCode)
        .maybeSingle();

      if (error) {
        console.error('사용자 조회 에러:', error);
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      if (data) {
        console.log('✅ 사용자 찾음:', data.academy_code);
        return new User(data);
      }

      console.log('❌ 사용자를 찾을 수 없습니다.');
      return null;
    } catch (error) {
      console.error('사용자 조회 실패:', error);
      return null;
    }
  }

  static async findById(id) {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data ? new User(data) : null;
    } catch (error) {
      console.error('사용자 조회 실패:', error);
      return null;
    }
  }

  async verifyPassword(password) {
    if (!this.password_hash) {
      console.warn('⚠️ 비밀번호 해시가 없습니다.');
      return false;
    }
    
    try {
      const isValid = await bcrypt.compare(password, this.password_hash);
      if (!isValid) {
        console.log('🔐 비밀번호 비교 실패');
      }
      return isValid;
    } catch (error) {
      console.error('❌ 비밀번호 검증 중 에러:', error);
      return false;
    }
  }

  async save() {
    if (!supabase) {
      const errorMsg = 'Supabase가 연결되지 않았습니다.';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      // 화이트리스트 방식으로 payload 생성
      const inputData = {
        academy_code: this.academy_code,
        academy_id: this.academy_id,
        name: this.name,
        role: this.role || 'admin',
        updated_at: new Date().toISOString(),
      };

      // 비밀번호 해시가 있으면 포함
      if (this.password_hash) {
        inputData.password_hash = this.password_hash;
      }

      // email과 phone은 값이 있을 때만 포함 (null이면 아예 제외)
      if (this.email && this.email.trim() !== '') {
        inputData.email = this.email.trim();
      }
      if (this.phone && this.phone.trim() !== '') {
        inputData.phone = this.phone.trim();
      }

      // 개발용 가드
      const extra = Object.keys(inputData).filter(k => !User.writableColumns.includes(k));
      if (extra.length) {
        console.warn('[User GUARD] extra keys ignored:', extra);
      }

      // 화이트리스트 payload 생성
      const dbPayload = User.pick(inputData, User.writableColumns);

      if (this.id) {
        // 업데이트
        const { error: updateError } = await supabase
          .from('users')
          .update(dbPayload)
          .eq('id', this.id);

        if (updateError) {
          console.error('사용자 업데이트 에러:', updateError);
          throw new Error(`사용자 업데이트 실패: ${updateError.message}`);
        }

        // 업데이트 후 조회
        const { data: fetchedData, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', this.id)
          .single();

        if (fetchError) {
          console.warn('업데이트 후 조회 실패:', fetchError);
        } else if (fetchedData) {
          // DB 결과를 화이트리스트 방식으로 반영
          const saved = new User(fetchedData);
          for (const k of User.columns) {
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

        // ID가 있으면 포함
        if (this.id) {
          insertData.id = this.id;
        }

        console.log('📝 사용자 생성 시도 - insertData:', JSON.stringify(insertData, null, 2));

        const { data: insertedData, error: insertError } = await supabase
          .from('users')
          .insert(insertData)
          .select()
          .single();

        if (insertError) {
          console.error('사용자 생성 에러:', insertError);
          throw new Error(`사용자 생성 실패: ${insertError.message}`);
        }

        if (insertedData) {
          // DB 결과를 화이트리스트 방식으로 반영
          const saved = new User(insertedData);
          for (const k of User.columns) {
            this[k] = saved[k];
          }
          this.createdAt = saved.createdAt;
          this.updatedAt = saved.updatedAt;
        }
      }

      return this;
    } catch (error) {
      console.error('사용자 저장 실패:', error);
      throw error;
    }
  }

  async delete() {
    if (!supabase) {
      throw new Error('Supabase가 연결되지 않았습니다.');
    }

    if (!this.id) {
      throw new Error('삭제할 사용자 ID가 없습니다.');
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', this.id);

      if (error) {
        console.error('사용자 삭제 에러:', error);
        throw new Error(`사용자 삭제 실패: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('사용자 삭제 실패:', error);
      throw error;
    }
  }
}
