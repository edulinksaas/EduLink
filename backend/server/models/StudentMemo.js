import { supabase } from '../config/supabase.js';

// Student Memo Model (특이사항 메모)
export class StudentMemo {
  // 화이트리스트: 테이블 실제 컬럼만 정의
  static columns = ['id', 'academy_id', 'student_id', 'author_id', 'text', 'created_at'];
  static writableColumns = ['academy_id', 'student_id', 'author_id', 'text'];

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
    this.academy_id = data.academy_id ?? null;
    this.student_id = data.student_id ?? null;
    this.author_id = data.author_id ?? null;
    this.text = data.text ?? null;
    this.createdAt = data.created_at ?? data.createdAt ?? new Date();
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
      // 화이트리스트 방식으로 payload 생성
      const inputData = {
        academy_id: this.academy_id,
        student_id: this.student_id,
        author_id: this.author_id || null,
        text: this.text,
      };

      // 개발용 가드
      const extra = Object.keys(inputData).filter(k => !StudentMemo.writableColumns.includes(k));
      if (extra.length) {
        console.warn('[StudentMemo GUARD] extra keys ignored:', extra);
      }

      // 화이트리스트 payload 생성
      const dbPayload = StudentMemo.pick(inputData, StudentMemo.writableColumns);

      if (this.id) {
        // 메모는 일반적으로 수정하지 않고 새로 추가하는 용도이므로 업데이트는 생략 가능
        const { data, error } = await supabase
          .from('student_memos')
          .update(dbPayload)
          .eq('id', this.id)
          .select()
          .single();

        if (error) throw error;
        
        // DB 결과를 화이트리스트 방식으로 반영
        if (data) {
          const saved = new StudentMemo(data);
          for (const k of StudentMemo.columns) {
            this[k] = saved[k];
          }
          this.createdAt = saved.createdAt;
        }
      } else {
        const insertData = {
          ...dbPayload,
          created_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from('student_memos')
          .insert(insertData)
          .select()
          .single();

        if (error) throw error;
        
        // DB 결과를 화이트리스트 방식으로 반영
        if (data) {
          const saved = new StudentMemo(data);
          for (const k of StudentMemo.columns) {
            this[k] = saved[k];
          }
          this.createdAt = saved.createdAt;
        }
      }

      return this;
    } catch (error) {
      console.error('학생 메모 저장 실패:', error);
      throw error;
    }
  }
}
