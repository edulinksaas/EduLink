import { supabase } from '../config/supabase.js';

// Attendance Record Model
export class AttendanceRecord {
  // 화이트리스트: 테이블 실제 컬럼만 정의
  static columns = ['id', 'academy_id', 'student_id', 'class_id', 'enrollment_id', 'date', 'status', 'note', 'created_at', 'updated_at'];
  static writableColumns = ['academy_id', 'student_id', 'class_id', 'enrollment_id', 'date', 'status', 'note', 'updated_at'];

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
    this.class_id = data.class_id ?? null;
    this.enrollment_id = data.enrollment_id ?? null;
    this.date = data.date ?? null;
    this.status = data.status ?? null;
    this.note = data.note ?? '';
    this.createdAt = data.created_at ?? data.createdAt ?? new Date();
    this.updatedAt = data.updated_at ?? data.updatedAt ?? new Date();
  }

  static async findByStudent(studentId, fromDate = null, toDate = null) {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return [];
    }

    try {
      let query = supabase
        .from('attendance_records')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: true });

      if (fromDate) {
        query = query.gte('date', fromDate);
      }
      if (toDate) {
        query = query.lt('date', toDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((item) => new AttendanceRecord(item));
    } catch (error) {
      console.error('출석 기록 조회 실패:', error);
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
        class_id: this.class_id || null,
        enrollment_id: this.enrollment_id || null,
        date: this.date,
        status: this.status,
        note: this.note || '',
        updated_at: new Date().toISOString(),
      };

      // 개발용 가드: writableColumns에 없는 키 확인
      const extra = Object.keys(inputData).filter(k => !AttendanceRecord.writableColumns.includes(k));
      if (extra.length) {
        console.warn('[AttendanceRecord GUARD] extra keys ignored:', extra);
      }

      // 화이트리스트 payload 생성
      const dbPayload = AttendanceRecord.pick(inputData, AttendanceRecord.writableColumns);

      if (this.id) {
        const { data, error } = await supabase
          .from('attendance_records')
          .update(dbPayload)
          .eq('id', this.id)
          .select()
          .single();

        if (error) throw error;
        
        // DB 결과를 화이트리스트 방식으로 반영
        if (data) {
          const saved = new AttendanceRecord(data);
          for (const k of AttendanceRecord.columns) {
            this[k] = saved[k];
          }
          this.createdAt = saved.createdAt;
          this.updatedAt = saved.updatedAt;
        }
      } else {
        // enrollment_id 컬럼이 없을 수 있으므로, 먼저 enrollment_id 없이 시도
        let insertData = {
          ...dbPayload,
          created_at: new Date().toISOString(),
        };

        let { data, error } = await supabase
          .from('attendance_records')
          .insert(insertData)
          .select()
          .single();

        // enrollment_id 컬럼이 없는 경우 에러 발생 시, enrollment_id 없이 재시도
        if (error && (error.code === '42703' || error.message?.includes('column') || error.message?.includes('enrollment_id'))) {
          console.warn('⚠️ enrollment_id 컬럼이 없거나 에러 발생, enrollment_id 없이 재시도:', error.message);
          const { enrollment_id, ...dataWithoutEnrollment } = insertData;
          const retryData = dataWithoutEnrollment;
          
          const retryResult = await supabase
            .from('attendance_records')
            .insert(retryData)
            .select()
            .single();
          
          if (retryResult.error) {
            console.error('❌ 출석 기록 삽입 실패 (재시도 후):', retryResult.error);
            throw retryResult.error;
          }
          
          data = retryResult.data;
          error = null;
        } else if (error) {
          console.error('❌ 출석 기록 삽입 실패:', error);
          throw error;
        }

        if (error) throw error;
        
        // DB 결과를 화이트리스트 방식으로 반영
        if (data) {
          const saved = new AttendanceRecord(data);
          for (const k of AttendanceRecord.columns) {
            this[k] = saved[k];
          }
          this.createdAt = saved.createdAt;
          this.updatedAt = saved.updatedAt;
        }
      }

      return this;
    } catch (error) {
      console.error('출석 기록 저장 실패:', error);
      throw error;
    }
  }

  static async findById(id) {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data ? new AttendanceRecord(data) : null;
    } catch (error) {
      console.error('출석 기록 조회 실패:', error);
      throw error;
    }
  }

  async delete() {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return;
    }

    if (!this.id) {
      throw new Error('Cannot delete record without id');
    }

    try {
      const { error } = await supabase
        .from('attendance_records')
        .delete()
        .eq('id', this.id);

      if (error) throw error;
    } catch (error) {
      console.error('출석 기록 삭제 실패:', error);
      throw error;
    }
  }
}
