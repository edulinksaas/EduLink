import { supabase } from '../config/supabase.js';

// ParentStudent 관계 모델
export class ParentStudent {
  constructor(data) {
    this.id = data.id;
    this.parent_id = data.parent_id;
    this.student_id = data.student_id;
    this.relationship = data.relationship || 'parent';
    this.is_primary = data.is_primary !== undefined ? data.is_primary : true;
    this.createdAt = data.created_at || data.createdAt || new Date();
    this.updatedAt = data.updated_at || data.updatedAt || new Date();
  }

  static async findByParentId(parentId) {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('parent_students')
        .select('*')
        .eq('parent_id', parentId);

      if (error) throw error;

      return (data || []).map(item => new ParentStudent(item));
    } catch (error) {
      console.error('학부모별 자녀 조회 실패:', error);
      return [];
    }
  }

  static async findByStudentId(studentId) {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('parent_students')
        .select('*')
        .eq('student_id', studentId);

      if (error) throw error;

      return (data || []).map(item => new ParentStudent(item));
    } catch (error) {
      console.error('학생별 학부모 조회 실패:', error);
      return [];
    }
  }

  static async findByParentAndStudent(parentId, studentId) {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('parent_students')
        .select('*')
        .eq('parent_id', parentId)
        .eq('student_id', studentId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data ? new ParentStudent(data) : null;
    } catch (error) {
      console.error('관계 조회 실패:', error);
      return null;
    }
  }

  async save() {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return this;
    }

    try {
      const relationData = {
        parent_id: this.parent_id,
        student_id: this.student_id,
        relationship: this.relationship || 'parent',
        is_primary: this.is_primary !== undefined ? this.is_primary : true,
        updated_at: new Date().toISOString(),
      };

      if (this.id) {
        // 업데이트
        const { error: updateError } = await supabase
          .from('parent_students')
          .update(relationData)
          .eq('id', this.id);

        if (updateError) {
          console.error('Supabase 업데이트 에러:', updateError);
          throw new Error(updateError.message || 'Failed to update parent-student relation');
        }

        // 업데이트 후 다시 조회
        const { data: fetchedData, error: fetchError } = await supabase
          .from('parent_students')
          .select('*')
          .eq('id', this.id)
          .single();

        if (fetchError) {
          console.warn('업데이트 후 조회 실패:', fetchError);
          Object.assign(this, { ...this, ...relationData });
        } else if (fetchedData) {
          Object.assign(this, new ParentStudent(fetchedData));
        } else {
          Object.assign(this, { ...this, ...relationData });
        }
      } else {
        // 생성
        const insertData = {
          ...relationData,
          created_at: new Date().toISOString(),
        };

        const { data: insertResult, error: insertError } = await supabase
          .from('parent_students')
          .insert(insertData)
          .select();

        if (insertError) {
          console.error('Supabase 삽입 에러:', insertError);
          throw new Error(insertError.message || 'Failed to create parent-student relation');
        }

        if (!insertResult || insertResult.length === 0) {
          console.warn('insert().select()가 빈 배열을 반환했습니다.');
          Object.assign(this, new ParentStudent({ ...insertData, id: this.id }));
        } else {
          Object.assign(this, new ParentStudent(insertResult[0]));
        }
      }

      return this;
    } catch (error) {
      console.error('관계 저장 실패:', error);
      throw error;
    }
  }

  async delete() {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return false;
    }

    try {
      const { error } = await supabase
        .from('parent_students')
        .delete()
        .eq('id', this.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('관계 삭제 실패:', error);
      throw error;
    }
  }
}


