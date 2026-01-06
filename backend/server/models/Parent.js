import { supabase } from '../config/supabase.js';

// Parent Model
export class Parent {
  // 화이트리스트: 테이블 실제 컬럼만 정의
  static columns = ['id', 'name', 'email', 'phone', 'address', 'institution_name', 'institution_type', 'institution_address', 'institution_phone', 'created_at', 'updated_at'];
  static writableColumns = ['name', 'email', 'phone', 'address', 'institution_name', 'institution_type', 'institution_address', 'institution_phone', 'updated_at'];

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
    this.name = data.name ?? '';
    this.email = data.email ?? '';
    this.phone = data.phone ?? '';
    this.address = data.address ?? '';
    this.institution_name = data.institution_name ?? '';
    this.institution_type = data.institution_type ?? '';
    this.institution_address = data.institution_address ?? '';
    this.institution_phone = data.institution_phone ?? '';
    this.createdAt = data.created_at ?? data.createdAt ?? new Date();
    this.updatedAt = data.updated_at ?? data.updatedAt ?? new Date();
  }

  static async findByPhone(phone) {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return null;
    }

    if (!phone || !phone.trim()) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('parents')
        .select('*')
        .eq('phone', phone.trim())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data ? new Parent(data) : null;
    } catch (error) {
      console.error('학부모 조회 실패:', error);
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
        .from('parents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data ? new Parent(data) : null;
    } catch (error) {
      console.error('학부모 조회 실패:', error);
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
        name: this.name || '',
        email: this.email || '',
        phone: this.phone || '',
        address: this.address || '',
        institution_name: this.institution_name || '',
        institution_type: this.institution_type || '',
        institution_address: this.institution_address || '',
        institution_phone: this.institution_phone || '',
        updated_at: new Date().toISOString(),
      };

      // 개발용 가드
      const extra = Object.keys(inputData).filter(k => !Parent.writableColumns.includes(k));
      if (extra.length) {
        console.warn('[Parent GUARD] extra keys ignored:', extra);
      }

      // 화이트리스트 payload 생성
      const dbPayload = Parent.pick(inputData, Parent.writableColumns);

      if (this.id) {
        // 업데이트
        const { error: updateError } = await supabase
          .from('parents')
          .update(dbPayload)
          .eq('id', this.id);

        if (updateError) {
          console.error('Supabase 업데이트 에러:', updateError);
          throw new Error(updateError.message || 'Failed to update parent');
        }

        // 업데이트 후 다시 조회
        const { data: fetchedData, error: fetchError } = await supabase
          .from('parents')
          .select('*')
          .eq('id', this.id)
          .single();

        if (fetchError) {
          console.warn('업데이트 후 조회 실패:', fetchError);
          // 화이트리스트 방식으로 업데이트
          for (const k of Parent.writableColumns) {
            if (inputData[k] !== undefined) {
              this[k] = inputData[k];
            }
          }
        } else if (fetchedData) {
          const saved = new Parent(fetchedData);
          for (const k of Parent.columns) {
            this[k] = saved[k];
          }
          this.createdAt = saved.createdAt;
          this.updatedAt = saved.updatedAt;
        } else {
          for (const k of Parent.writableColumns) {
            if (inputData[k] !== undefined) {
              this[k] = inputData[k];
            }
          }
        }
      } else {
        // 생성
        const insertData = {
          ...dbPayload,
          created_at: new Date().toISOString(),
        };

        const { data: insertResult, error: insertError } = await supabase
          .from('parents')
          .insert(insertData)
          .select();

        if (insertError) {
          console.error('Supabase 삽입 에러:', insertError);
          throw new Error(insertError.message || 'Failed to create parent');
        }

        if (!insertResult || insertResult.length === 0) {
          console.warn('insert().select()가 빈 배열을 반환했습니다.');
          // insert는 성공했을 수 있으므로 현재 데이터로 설정 (화이트리스트 방식)
          const temp = new Parent({ ...insertData, id: this.id });
          for (const k of Parent.columns) {
            this[k] = temp[k];
          }
          this.createdAt = temp.createdAt;
          this.updatedAt = temp.updatedAt;
        } else {
          const saved = new Parent(insertResult[0]);
          for (const k of Parent.columns) {
            this[k] = saved[k];
          }
          this.createdAt = saved.createdAt;
          this.updatedAt = saved.updatedAt;
        }
      }

      return this;
    } catch (error) {
      console.error('학부모 저장 실패:', error);
      throw error;
    }
  }

  async update(data) {
    // 화이트리스트 방식: 허용된 컬럼만 명시적으로 할당
    if (data.name !== undefined) this.name = data.name;
    if (data.email !== undefined) this.email = data.email;
    if (data.phone !== undefined) this.phone = data.phone;
    if (data.address !== undefined) this.address = data.address;
    if (data.institution_name !== undefined) this.institution_name = data.institution_name;
    if (data.institution_type !== undefined) this.institution_type = data.institution_type;
    if (data.institution_address !== undefined) this.institution_address = data.institution_address;
    if (data.institution_phone !== undefined) this.institution_phone = data.institution_phone;
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
        .from('parents')
        .delete()
        .eq('id', this.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('학부모 삭제 실패:', error);
      throw error;
    }
  }
}
