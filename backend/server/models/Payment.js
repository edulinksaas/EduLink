import { supabase } from '../config/supabase.js';

// Payment Model (수강 결제 내역)
export class Payment {
  // 화이트리스트: 테이블 실제 컬럼만 정의
  static columns = ['id', 'academy_id', 'student_id', 'class_id', 'amount', 'remaining_sessions', 'next_payment_date', 'invoice_issued', 'unpaid', 'created_at', 'updated_at'];
  static writableColumns = ['academy_id', 'student_id', 'class_id', 'amount', 'remaining_sessions', 'next_payment_date', 'invoice_issued', 'unpaid', 'updated_at'];

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
    this.amount = data.amount ?? 0;
    this.remaining_sessions = data.remaining_sessions ?? null;
    this.next_payment_date = data.next_payment_date ?? null;
    this.invoice_issued = data.invoice_issued ?? false;
    this.unpaid = data.unpaid ?? false;
    this.createdAt = data.created_at ?? data.createdAt ?? new Date();
    this.updatedAt = data.updated_at ?? data.updatedAt ?? new Date();
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
        amount: this.amount ?? 0,
        remaining_sessions: this.remaining_sessions,
        next_payment_date: this.next_payment_date,
        invoice_issued: this.invoice_issued ?? false,
        unpaid: this.unpaid ?? false,
        updated_at: new Date().toISOString(),
      };

      // 개발용 가드
      const extra = Object.keys(inputData).filter(k => !Payment.writableColumns.includes(k));
      if (extra.length) {
        console.warn('[Payment GUARD] extra keys ignored:', extra);
      }

      // 화이트리스트 payload 생성
      const dbPayload = Payment.pick(inputData, Payment.writableColumns);

      if (this.id) {
        const { data, error } = await supabase
          .from('payments')
          .update(dbPayload)
          .eq('id', this.id)
          .select()
          .single();

        if (error) throw error;
        
        // DB 결과를 화이트리스트 방식으로 반영
        if (data) {
          const saved = new Payment(data);
          for (const k of Payment.columns) {
            this[k] = saved[k];
          }
          this.createdAt = saved.createdAt;
          this.updatedAt = saved.updatedAt;
        }
      } else {
        const insertData = {
          ...dbPayload,
          created_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from('payments')
          .insert(insertData)
          .select()
          .single();

        if (error) throw error;
        
        // DB 결과를 화이트리스트 방식으로 반영
        if (data) {
          const saved = new Payment(data);
          for (const k of Payment.columns) {
            this[k] = saved[k];
          }
          this.createdAt = saved.createdAt;
          this.updatedAt = saved.updatedAt;
        }
      }

      return this;
    } catch (error) {
      console.error('결제 정보 저장 실패:', error);
      throw error;
    }
  }
}
