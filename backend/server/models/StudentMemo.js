import { supabase } from '../config/supabase.js';

// Student Memo Model (특이사항 메모)
export class StudentMemo {
  constructor(data) {
    this.id = data.id;
    this.academy_id = data.academy_id;
    this.student_id = data.student_id;
    this.author_id = data.author_id || null;
    this.text = data.text;
    this.createdAt = data.created_at || data.createdAt || new Date();
  }

  static async findByStudent(studentId) {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('student_memos')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((item) => new StudentMemo(item));
    } catch (error) {
      console.error('학생 메모 조회 실패:', error);
      return [];
    }
  }

  async save() {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return this;
    }

    try {
      const memoData = {
        academy_id: this.academy_id,
        student_id: this.student_id,
        author_id: this.author_id || null,
        text: this.text,
      };

      if (this.id) {
        // 메모는 일반적으로 수정하지 않고 새로 추가하는 용도이므로 업데이트는 생략 가능
        const { data, error } = await supabase
          .from('student_memos')
          .update(memoData)
          .eq('id', this.id)
          .select()
          .single();

        if (error) throw error;
        Object.assign(this, new StudentMemo(data));
      } else {
        const { data, error } = await supabase
          .from('student_memos')
          .insert({
            ...memoData,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        Object.assign(this, new StudentMemo(data));
      }

      return this;
    } catch (error) {
      console.error('학생 메모 저장 실패:', error);
      throw error;
    }
  }
}


