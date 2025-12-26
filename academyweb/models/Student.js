import { supabase } from '../config/supabase.js';

// Student Model
export class Student {
  constructor(data) {
    this.id = data.id;
    this.academy_id = data.academy_id;
    this.name = data.name;
    this.parent_contact = data.parent_contact;
    this.class_id = data.class_id;
    this.teacher_id = data.teacher_id;
    this.fee = data.fee;
    this.has_receipt = data.has_receipt;
    this.note = data.note;
    this.createdAt = data.created_at || data.createdAt || new Date();
    this.updatedAt = data.updated_at || data.updatedAt || new Date();
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
          Object.assign(this, { ...this, ...studentData });
        } else if (fetchedData) {
          Object.assign(this, new Student(fetchedData));
        } else {
          Object.assign(this, { ...this, ...studentData });
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
            Object.assign(this, new Student({ ...insertData, id: this.id }));
          } else {
            Object.assign(this, new Student(fetchedData));
          }
        } else {
          Object.assign(this, new Student(insertResult[0]));
        }
      }
      
      return this;
    } catch (error) {
      console.error('학생 저장 실패:', error);
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
