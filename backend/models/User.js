import { supabase } from '../config/supabase.js';
import bcrypt from 'bcrypt';

// User Model
export class User {
  constructor(data) {
    this.id = data.id;
    this.academy_code = data.academy_code;
    this.password_hash = data.password_hash;
    this.academy_id = data.academy_id;
    this.name = data.name;
    this.email = data.email || null;
    this.phone = data.phone || null;
    this.role = data.role || 'admin';
    this.email_verified = data.email_verified || false;
    this.verification_token = data.verification_token || null;
    this.verification_token_expires_at = data.verification_token_expires_at || null;
    this.supabase_user_id = data.supabase_user_id || null;
    this.createdAt = data.created_at || data.createdAt || new Date();
    this.updatedAt = data.updated_at || data.updatedAt || new Date();
  }

  static async findByAcademyCode(academyCode) {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return null;
    }

    try {
      // 학원 코드 정규화 (대소문자 구분 없이)
      const normalizedCode = academyCode?.trim().toUpperCase();
      
      console.log('🔍 사용자 조회 시도 - 학원 코드:', normalizedCode);

      // 대소문자 구분 없이 조회 (ILIKE 사용)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('academy_code', normalizedCode)
        .maybeSingle();

      if (error) {
        console.error('사용자 조회 에러:', error);
        if (error.code === 'PGRST116') {
          // No rows returned
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

  static async findByEmail(email) {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return null;
    }

    if (!email || !email.trim()) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('이메일로 사용자 조회 에러:', error);
        return null;
      }

      return data ? new User(data) : null;
    } catch (error) {
      console.error('이메일로 사용자 조회 실패:', error);
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
      const userData = {
        academy_code: this.academy_code,
        academy_id: this.academy_id,
        name: this.name,
        role: this.role || 'admin',
        updated_at: new Date().toISOString(),
      };

      // 비밀번호 해시가 있으면 포함
      if (this.password_hash) {
        userData.password_hash = this.password_hash;
      }

      // email과 phone은 값이 있을 때만 포함 (null이면 아예 제외)
      if (this.email && this.email.trim() !== '') {
        userData.email = this.email.trim();
      }
      if (this.phone && this.phone.trim() !== '') {
        userData.phone = this.phone.trim();
      }

      // 이메일 인증 관련 필드
      if (this.email_verified !== undefined) {
        userData.email_verified = this.email_verified;
      }
      if (this.verification_token !== undefined) {
        userData.verification_token = this.verification_token;
      }
      if (this.verification_token_expires_at !== undefined) {
        userData.verification_token_expires_at = this.verification_token_expires_at;
      }
      if (this.supabase_user_id !== undefined) {
        userData.supabase_user_id = this.supabase_user_id;
      }

      if (this.id) {
        // 업데이트
        const { error: updateError } = await supabase
          .from('users')
          .update(userData)
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
          Object.assign(this, new User(fetchedData));
        }
      } else {
        // 생성
        userData.created_at = new Date().toISOString();
        userData.id = this.id || undefined; // ID가 없으면 Supabase가 자동 생성

        // password_hash가 있으면 포함
        if (this.password_hash) {
          userData.password_hash = this.password_hash;
        }

        console.log('📝 사용자 생성 시도 - insertData:', JSON.stringify(userData, null, 2));

        const { data: insertedData, error: insertError } = await supabase
          .from('users')
          .insert(userData)
          .select()
          .single();

        if (insertError) {
          console.error('사용자 생성 에러:', insertError);
          throw new Error(`사용자 생성 실패: ${insertError.message}`);
        }

        if (insertedData) {
          Object.assign(this, new User(insertedData));
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
