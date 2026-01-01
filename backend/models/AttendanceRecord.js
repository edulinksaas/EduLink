import { supabase } from '../config/supabase.js';

// Attendance Record Model
export class AttendanceRecord {
  constructor(data) {
    this.id = data.id;
    this.academy_id = data.academy_id;
    this.student_id = data.student_id;
    this.class_id = data.class_id;
    this.enrollment_id = data.enrollment_id || null;
    this.date = data.date; // YYYY-MM-DD
    this.status = data.status; // 'present' | 'absent' | 'late' | 'sick' | 'carryover'
    this.note = data.note || '';
    this.createdAt = data.created_at || data.createdAt || new Date();
    this.updatedAt = data.updated_at || data.updatedAt || new Date();
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
      // 기본 데이터 구성 (enrollment_id 제외)
      const recordData = {
        academy_id: this.academy_id,
        student_id: this.student_id,
        class_id: this.class_id || null,
        date: this.date,
        status: this.status,
        note: this.note || '',
        updated_at: new Date().toISOString(),
      };

      console.log('💾 DB에 저장할 데이터 (기본):', recordData);
      console.log('💾 enrollment_id 값:', this.enrollment_id);

      if (this.id) {
        const { data, error } = await supabase
          .from('attendance_records')
          .update(recordData)
          .eq('id', this.id)
          .select()
          .single();

        if (error) {
          console.error('❌ 출석 기록 업데이트 실패:', error);
          console.error('에러 상세:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          });
          throw error;
        }
        Object.assign(this, new AttendanceRecord(data));
      } else {
        // enrollment_id 컬럼이 없을 수 있으므로, 먼저 enrollment_id 없이 시도
        let insertData = {
          ...recordData,
          created_at: new Date().toISOString(),
        };

        // enrollment_id가 있고 유효한 UUID 형식인 경우에만 추가 시도
        if (this.enrollment_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(this.enrollment_id)) {
          insertData.enrollment_id = this.enrollment_id;
          console.log('💾 enrollment_id 포함하여 저장 시도');
        } else {
          console.log('💾 enrollment_id 없이 저장 (값이 없거나 유효하지 않음)');
        }

        let { data, error } = await supabase
          .from('attendance_records')
          .insert(insertData)
          .select()
          .single();

        // enrollment_id 컬럼이 없는 경우 에러 발생 시, enrollment_id 없이 재시도
        if (error && (
          error.code === '42703' || 
          error.message?.includes('column') || 
          error.message?.includes('enrollment_id') ||
          error.message?.includes('does not exist') ||
          error.details?.includes('enrollment_id')
        )) {
          console.warn('⚠️ enrollment_id 컬럼 관련 에러 감지, enrollment_id 없이 재시도');
          console.warn('원본 에러:', error.message);
          
          // enrollment_id 제거하고 재시도
          const { enrollment_id, ...dataWithoutEnrollment } = insertData;
          const retryData = dataWithoutEnrollment;
          
          console.log('🔄 재시도 데이터:', retryData);
          
          const retryResult = await supabase
            .from('attendance_records')
            .insert(retryData)
            .select()
            .single();
          
          if (retryResult.error) {
            console.error('❌ 출석 기록 삽입 실패 (재시도 후):', retryResult.error);
            console.error('에러 상세:', {
              message: retryResult.error.message,
              code: retryResult.error.code,
              details: retryResult.error.details,
              hint: retryResult.error.hint,
            });
            throw retryResult.error;
          }
          
          console.log('✅ 재시도 성공');
          data = retryResult.data;
          error = null;
        } else if (error) {
          console.error('❌ 출석 기록 삽입 실패:', error);
          console.error('에러 상세:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          });
          throw error;
        }

        if (error) throw error;
        console.log('✅ 출석 기록 저장 성공');
        Object.assign(this, new AttendanceRecord(data));
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

      if (error) throw error;
      return data ? new AttendanceRecord(data) : null;
    } catch (error) {
      console.error('출석 기록 조회 실패:', error);
      return null;
    }
  }

  async delete() {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return;
    }

    if (!this.id) {
      throw new Error('출석 기록 ID가 없습니다.');
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


