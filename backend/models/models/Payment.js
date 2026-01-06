import { supabase } from '../config/supabase.js';

// Payment Model (수강 결제 내역)
export class Payment {
  constructor(data) {
    this.id = data.id;
    this.academy_id = data.academy_id;
    this.student_id = data.student_id;
    this.class_id = data.class_id;
    this.amount = data.amount;
    this.remaining_sessions = data.remaining_sessions ?? null;
    this.next_payment_date = data.next_payment_date || null;
    this.invoice_issued = data.invoice_issued ?? false;
    this.unpaid = data.unpaid ?? false;
    this.createdAt = data.created_at || data.createdAt || new Date();
    this.updatedAt = data.updated_at || data.updatedAt || new Date();
  }

  static async findByStudent(studentId) {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((item) => new Payment(item));
    } catch (error) {
      console.error('결제 정보 조회 실패:', error);
      return [];
    }
  }

  // 일별 매출 계산 (특정 날짜의 payments 합계)
  static async getDailyRevenue(academyId, date) {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return 0;
    }

    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('payments')
        .select('amount')
        .eq('academy_id', academyId)
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());

      if (error) throw error;
      
      const total = (data || []).reduce((sum, payment) => {
        const amount = typeof payment.amount === 'number' ? payment.amount : parseInt(payment.amount, 10) || 0;
        return sum + amount;
      }, 0);

      return total;
    } catch (error) {
      console.error('일별 매출 조회 실패:', error);
      return 0;
    }
  }

  // 오늘 등록된 학생들의 fee 합계 계산 (students 테이블 기준)
  static async getDailyRevenueFromStudents(academyId, date) {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return 0;
    }

    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('students')
        .select('fee')
        .eq('academy_id', academyId)
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());

      if (error) throw error;
      
      const total = (data || []).reduce((sum, student) => {
        const fee = typeof student.fee === 'number' ? student.fee : (student.fee ? parseInt(student.fee, 10) : 0);
        return sum + (isNaN(fee) ? 0 : fee);
      }, 0);

      return total;
    } catch (error) {
      console.error('학생 기준 일별 매출 조회 실패:', error);
      return 0;
    }
  }

  async save() {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return this;
    }

    try {
      const paymentData = {
        academy_id: this.academy_id,
        student_id: this.student_id,
        class_id: this.class_id || null,
        amount: this.amount ?? 0,
        remaining_sessions: this.remaining_sessions,
        next_payment_date: this.next_payment_date,
        invoice_issued: this.invoice_issued ?? false,
        unpaid: this.unpaid ?? false,
        updated_at: new Date().toISOString(),
      };

      if (this.id) {
        const { data, error } = await supabase
          .from('payments')
          .update(paymentData)
          .eq('id', this.id)
          .select()
          .single();

        if (error) throw error;
        Object.assign(this, new Payment(data));
      } else {
        const { data, error } = await supabase
          .from('payments')
          .insert({
            ...paymentData,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        Object.assign(this, new Payment(data));
      }

      return this;
    } catch (error) {
      console.error('결제 정보 저장 실패:', error);
      throw error;
    }
  }
}


