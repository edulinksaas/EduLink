import { supabase } from '../config/supabase.js';

// Parent Model
export class Parent {
  constructor(data) {
    this.id = data.id;
    this.name = data.name || '';
    this.email = data.email || '';
    this.phone = data.phone || '';
    this.address = data.address || '';
    this.institution_name = data.institution_name || '';
    this.institution_type = data.institution_type || '';
    this.institution_address = data.institution_address || '';
    this.institution_phone = data.institution_phone || '';
    this.createdAt = data.created_at || data.createdAt || new Date();
    this.updatedAt = data.updated_at || data.updatedAt || new Date();
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
        // 데이터가 없는 경우는 null 반환 (에러 아님)
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
      const parentData = {
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

      if (this.id) {
        // 업데이트
        const { error: updateError } = await supabase
          .from('parents')
          .update(parentData)
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
          Object.assign(this, { ...this, ...parentData });
        } else if (fetchedData) {
          Object.assign(this, new Parent(fetchedData));
        } else {
          Object.assign(this, { ...this, ...parentData });
        }
      } else {
        // 생성
        const insertData = {
          ...parentData,
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
          // insert는 성공했을 수 있으므로 현재 데이터로 설정
          Object.assign(this, new Parent({ ...insertData, id: this.id }));
        } else {
          Object.assign(this, new Parent(insertResult[0]));
        }
      }

      return this;
    } catch (error) {
      console.error('학부모 저장 실패:', error);
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


