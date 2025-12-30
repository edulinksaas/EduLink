import { supabase } from '../config/supabase.js';

// Attendance Record Model
export class AttendanceRecord {
  constructor(data) {
    this.id = data.id;
    this.academy_id = data.academy_id;
    this.student_id = data.student_id;
    this.class_id = data.class_id;
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
      const recordData = {
        academy_id: this.academy_id,
        student_id: this.student_id,
        class_id: this.class_id || null,
        date: this.date,
        status: this.status,
        note: this.note || '',
        updated_at: new Date().toISOString(),
      };

      if (this.id) {
        const { data, error } = await supabase
          .from('attendance_records')
          .update(recordData)
          .eq('id', this.id)
          .select()
          .single();

        if (error) throw error;
        Object.assign(this, new AttendanceRecord(data));
      } else {
        const { data, error } = await supabase
          .from('attendance_records')
          .insert({
            ...recordData,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
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


