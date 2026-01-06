import { supabase } from '../config/supabase.js';

// Student Model
export class Student {
  constructor(data = {}) {
    // 화이트리스트 방식: 허용된 컬럼만 명시적으로 할당
    this.id = data.id ?? null;
    this.academy_id = data.academy_id ?? null;
    this.name = data.name ?? null;
    this.parent_contact = data.parent_contact ?? null;
    this.class_id = data.class_id ?? null;
    this.teacher_id = data.teacher_id ?? null;
    this.fee = data.fee ?? null;
    this.has_receipt = data.has_receipt ?? false;
    this.note = data.note ?? null;
    this.createdAt = data.created_at ?? data.createdAt ?? new Date();
    this.updatedAt = data.updated_at ?? data.updatedAt ?? new Date();
  }
  
  static async findAll(academyId) {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return [];
    }
    
    try {
      let query = supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (academyId) {
        query = query.eq('academy_id', academyId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(item => new Student(item));
    } catch (error) {
      console.error('학생 목록 조회 실패:', error);
      return [];
    }
  }
  
  static async findByTeacherId(teacherId) {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('teacher_id', teacherId);
      
      if (error) throw error;
      
      return (data || []).map(item => new Student(item));
    } catch (error) {
      console.error('선생님별 학생 조회 실패:', error);
      return [];
    }
  }
  
  static async findByClassId(classId) {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classId);
      
      if (error) throw error;
      
      return (data || []).map(item => new Student(item));
    } catch (error) {
      console.error('수업별 학생 조회 실패:', error);
      return [];
    }
  }
  
  static async updateTeacherByClassId(classId, newTeacherId) {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return [];
    }
    
    try {
      // 먼저 해당 수업에 속한 학생들 조회
      const students = await Student.findByClassId(classId);
      console.log(`📚 수업 ID ${classId}에 속한 학생 수: ${students.length}명`);
      
      if (students.length === 0) {
        console.log('업데이트할 학생이 없습니다.');
        return [];
      }
      
      // 모든 학생들의 teacher_id를 일괄 업데이트
      const { data, error } = await supabase
        .from('students')
        .update({ 
          teacher_id: newTeacherId,
          updated_at: new Date().toISOString()
        })
        .eq('class_id', classId)
        .select();
      
      if (error) {
        console.error('학생 담당 선생님 일괄 업데이트 실패:', error);
        throw error;
      }
      
      console.log(`✅ ${data?.length || 0}명의 학생 담당 선생님 업데이트 완료`);
      return (data || []).map(item => new Student(item));
    } catch (error) {
      console.error('수업별 학생 담당 선생님 업데이트 실패:', error);
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
        .from('students')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data ? new Student(data) : null;
    } catch (error) {
      console.error('학생 조회 실패:', error);
      return null;
    }
  }
  
  async save() {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return this;
    }
    
    try {
      const studentData = {
        academy_id: this.academy_id,
        name: this.name,
        parent_contact: this.parent_contact,
        class_id: this.class_id || null,
        teacher_id: this.teacher_id || null,
        fee: this.fee ?? null,
        has_receipt: this.has_receipt ?? false,
        note: this.note,
        updated_at: new Date().toISOString(),
      };
      
      if (this.id) {
        // 업데이트
        const { error: updateError } = await supabase
          .from('students')
          .update(studentData)
          .eq('id', this.id);
        
        if (updateError) {
          console.error('Supabase 업데이트 에러:', updateError);
          throw new Error(updateError.message || 'Failed to update student');
        }
        
        // 업데이트 후 다시 조회
        const { data: fetchedData, error: fetchError } = await supabase
          .from('students')
          .select('*')
          .eq('id', this.id)
          .single();
        
        if (fetchError) {
          console.warn('업데이트 후 조회 실패:', fetchError);
          // 화이트리스트 방식으로 업데이트
          this.academy_id = studentData.academy_id ?? this.academy_id;
          this.name = studentData.name ?? this.name;
          this.parent_contact = studentData.parent_contact ?? this.parent_contact;
          this.class_id = studentData.class_id ?? this.class_id;
          this.teacher_id = studentData.teacher_id ?? this.teacher_id;
          this.fee = studentData.fee ?? this.fee;
          this.has_receipt = studentData.has_receipt ?? this.has_receipt;
          this.note = studentData.note ?? this.note;
        } else if (fetchedData) {
          const saved = new Student(fetchedData);
          this.id = saved.id;
          this.academy_id = saved.academy_id;
          this.name = saved.name;
          this.parent_contact = saved.parent_contact;
          this.class_id = saved.class_id;
          this.teacher_id = saved.teacher_id;
          this.fee = saved.fee;
          this.has_receipt = saved.has_receipt;
          this.note = saved.note;
          this.createdAt = saved.createdAt;
          this.updatedAt = saved.updatedAt;
        } else {
          this.academy_id = studentData.academy_id ?? this.academy_id;
          this.name = studentData.name ?? this.name;
          this.parent_contact = studentData.parent_contact ?? this.parent_contact;
          this.class_id = studentData.class_id ?? this.class_id;
          this.teacher_id = studentData.teacher_id ?? this.teacher_id;
          this.fee = studentData.fee ?? this.fee;
          this.has_receipt = studentData.has_receipt ?? this.has_receipt;
          this.note = studentData.note ?? this.note;
        }
      } else {
        // 생성
        const insertData = {
          ...studentData,
          created_at: new Date().toISOString(),
        };
        
        const { data: insertResult, error: insertError } = await supabase
          .from('students')
          .insert(insertData)
          .select();
        
        if (insertError) {
          console.error('Supabase 삽입 에러:', insertError);
          throw new Error(insertError.message || 'Failed to create student');
        }
        
        // select()가 빈 배열을 반환하는 경우 (RLS 정책 문제), id로 다시 조회 시도
        if (!insertResult || insertResult.length === 0) {
          console.warn('insert().select()가 빈 배열을 반환했습니다. id로 다시 조회 시도...');
          const { data: fetchedData, error: fetchError } = await supabase
            .from('students')
            .select('*')
            .eq('id', this.id)
            .single();
          
          if (fetchError || !fetchedData) {
            console.error('id로 조회 실패:', fetchError);
            const temp = new Student({ ...insertData, id: this.id });
            this.id = temp.id;
            this.academy_id = temp.academy_id;
            this.name = temp.name;
            this.parent_contact = temp.parent_contact;
            this.class_id = temp.class_id;
            this.teacher_id = temp.teacher_id;
            this.fee = temp.fee;
            this.has_receipt = temp.has_receipt;
            this.note = temp.note;
            this.createdAt = temp.createdAt;
            this.updatedAt = temp.updatedAt;
          } else {
            const saved = new Student(fetchedData);
            this.id = saved.id;
            this.academy_id = saved.academy_id;
            this.name = saved.name;
            this.parent_contact = saved.parent_contact;
            this.class_id = saved.class_id;
            this.teacher_id = saved.teacher_id;
            this.fee = saved.fee;
            this.has_receipt = saved.has_receipt;
            this.note = saved.note;
            this.createdAt = saved.createdAt;
            this.updatedAt = saved.updatedAt;
          }
        } else {
          const saved = new Student(insertResult[0]);
          this.id = saved.id;
          this.academy_id = saved.academy_id;
          this.name = saved.name;
          this.parent_contact = saved.parent_contact;
          this.class_id = saved.class_id;
          this.teacher_id = saved.teacher_id;
          this.fee = saved.fee;
          this.has_receipt = saved.has_receipt;
          this.note = saved.note;
          this.createdAt = saved.createdAt;
          this.updatedAt = saved.updatedAt;
        }
      }
      
      return this;
    } catch (error) {
      console.error('학생 저장 실패:', error);
      throw error;
    }
  }
  
  async update(data) {
    // 화이트리스트 방식: 허용된 컬럼만 명시적으로 할당
    if (data.academy_id !== undefined) this.academy_id = data.academy_id;
    if (data.name !== undefined) this.name = data.name;
    if (data.parent_contact !== undefined) this.parent_contact = data.parent_contact;
    if (data.class_id !== undefined) this.class_id = data.class_id;
    if (data.teacher_id !== undefined) this.teacher_id = data.teacher_id;
    if (data.fee !== undefined) this.fee = data.fee;
    if (data.has_receipt !== undefined) this.has_receipt = data.has_receipt;
    if (data.note !== undefined) this.note = data.note;
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
        .from('students')
        .delete()
        .eq('id', this.id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('학생 삭제 실패:', error);
      throw error;
    }
  }
}
