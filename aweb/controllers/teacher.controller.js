import crypto from 'crypto';
import { Teacher } from '../models/Teacher.js';
import { Academy } from '../models/Academy.js';
import { Class } from '../models/Class.js';
import { Student } from '../models/Student.js';

export const getTeachers = async (req, res, next) => {
  try {
    const { academy_id } = req.query;
    
    if (!academy_id) {
      return res.status(400).json({ error: 'academy_id is required' });
    }
    
    const teachers = await Teacher.findAll(academy_id);
    res.json({ teachers, total: teachers.length });
  } catch (error) {
    next(error);
  }
};

export const getTeacherById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findById(id);
    
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    
    res.json({ teacher });
  } catch (error) {
    next(error);
  }
};

// UUID 형식 검증 함수
const isValidUUID = (str) => {
  if (!str || typeof str !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const createTeacher = async (req, res, next) => {
  try {
    const { academy_id, name, subject_id, subject_ids, work_days, contact } = req.body;
    
    if (!academy_id || !name) {
      return res.status(400).json({ error: 'academy_id and name are required' });
    }
    
    // UUID 형식 검증
    if (!isValidUUID(academy_id)) {
      return res.status(400).json({ error: 'Invalid academy_id format. Must be a valid UUID.' });
    }
    
    // academy_id가 실제로 academies 테이블에 존재하는지 확인
    console.log(`🔍 학원 존재 확인 시도: ${academy_id}`);
    try {
      const academy = await Academy.findById(academy_id);
      if (!academy) {
        console.error(`❌ Academy not found: ${academy_id}`);
        // 모든 학원 목록을 조회해서 사용자에게 도움 제공
        try {
          const allAcademies = await Academy.findAll();
          console.log(`📋 현재 등록된 학원 수: ${allAcademies.length}`);
          if (allAcademies.length > 0) {
            console.log('📋 등록된 학원 목록:');
            allAcademies.forEach((a, idx) => {
              console.log(`  ${idx + 1}. ${a.name} (${a.id})`);
            });
            return res.status(400).json({ 
              error: `Academy with id ${academy_id} does not exist. Please register an academy first in the settings page.`,
              availableAcademies: allAcademies.map(a => ({ id: a.id, name: a.name }))
            });
          } else {
            return res.status(400).json({ 
              error: `No academy found. Please register an academy first in the settings page.`,
              availableAcademies: []
            });
          }
        } catch (listError) {
          console.error('❌ 학원 목록 조회 실패:', listError);
          return res.status(400).json({ error: `Academy with id ${academy_id} does not exist. Please register an academy first in the settings page.` });
        }
      }
      console.log(`✅ Academy found: ${academy.name} (${academy.id})`);
    } catch (error) {
      console.error('❌ Error checking academy existence:', error);
      return res.status(400).json({ error: `Failed to verify academy. Please ensure the academy is registered in the settings page. Error: ${error.message}` });
    }
    
    // subject_ids 처리: 배열이 아니거나 빈 배열이면 null
    let processedSubjectIds = null;
    if (subject_ids) {
      if (Array.isArray(subject_ids) && subject_ids.length > 0) {
        // UUID 형식 검증 및 필터링
        const validIds = subject_ids.filter(id => isValidUUID(id));
        if (validIds.length !== subject_ids.length) {
          return res.status(400).json({ error: 'Invalid subject_ids format. All subject IDs must be valid UUIDs.' });
        }
        processedSubjectIds = validIds;
      } else if (!Array.isArray(subject_ids) && subject_ids) {
        if (!isValidUUID(subject_ids)) {
          return res.status(400).json({ error: 'Invalid subject_id format. Must be a valid UUID.' });
        }
        processedSubjectIds = [subject_ids];
      }
    }
    
    // 새로 생성하는 경우 ID를 생성하지 않고 Supabase가 자동 생성하도록 함
    const teacher = new Teacher({
      academy_id,
      name,
      contact: contact || null,
      subject_id: subject_id || null,
      subject_ids: processedSubjectIds,
      work_days: work_days || ''
    });
    
    console.log('선생님 객체 생성 완료, save() 호출 전...');
    console.log('선생님 데이터:', {
      academy_id: teacher.academy_id,
      name: teacher.name,
      work_days: teacher.work_days,
      subject_ids: teacher.subject_ids
    });
    
    await teacher.save();
    
    // save() 후 생성된 ID 확인
    console.log('선생님 저장 완료! 생성된 ID:', teacher.id);
    
    console.log('선생님 저장 완료! 응답할 데이터:', {
      id: teacher.id,
      name: teacher.name,
      academy_id: teacher.academy_id
    });
    
    res.status(201).json({ teacher });
  } catch (error) {
    console.error('선생님 생성 에러:', error);
    // Supabase 에러 메시지 전달
    const errorMessage = error.message || error.details || 'Failed to create teacher';
    return res.status(400).json({ error: errorMessage });
  }
};

export const updateTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findById(id);
    
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    
    await teacher.update(req.body);
    res.json({ teacher });
  } catch (error) {
    next(error);
  }
};

export const deleteTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('선생님 삭제 요청:', id);
    
    if (!id) {
      return res.status(400).json({ error: 'Teacher ID is required' });
    }
    
    const teacher = await Teacher.findById(id);
    
    if (!teacher) {
      console.error('선생님을 찾을 수 없음:', id);
      return res.status(404).json({ error: 'Teacher not found' });
    }
    
    // 해당 선생님이 수업에 할당되어 있는지 확인 (실시간 DB 조회)
    const relatedClasses = await Class.findByTeacherId(id);
    console.log('할당된 수업 확인:', relatedClasses.length, '개');
    if (relatedClasses.length > 0) {
      console.log('할당된 수업 상세:', relatedClasses.map(c => ({ id: c.id, name: c.name, teacher_id: c.teacher_id })));
    }
    
    // 학생 테이블에서도 해당 선생님을 참조하는지 확인
    const relatedStudents = await Student.findByTeacherId(id);
    console.log('할당된 학생 확인:', relatedStudents.length, '명');
    if (relatedStudents.length > 0) {
      console.log('할당된 학생 상세:', relatedStudents.map(s => ({ id: s.id, name: s.name, teacher_id: s.teacher_id })));
    }
    
    // 수업과 학생 모두 확인
    if (relatedClasses.length > 0 || relatedStudents.length > 0) {
      const issues = [];
      if (relatedClasses.length > 0) {
        const classNames = relatedClasses.map(c => c.name).join(', ');
        issues.push(`수업 ${relatedClasses.length}개: ${classNames}`);
      }
      if (relatedStudents.length > 0) {
        const studentNames = relatedStudents.map(s => s.name).join(', ');
        issues.push(`학생 ${relatedStudents.length}명: ${studentNames}`);
      }
      
      console.error('삭제 불가: 해당 선생님이 할당되어 있음:', issues.join(' / '));
      return res.status(400).json({ 
        error: `해당 선생님은 ${relatedClasses.length > 0 ? `${relatedClasses.length}개의 수업` : ''}${relatedClasses.length > 0 && relatedStudents.length > 0 ? ' 및 ' : ''}${relatedStudents.length > 0 ? `${relatedStudents.length}명의 학생` : ''}에 할당되어 있어 삭제할 수 없습니다.`,
        details: issues.join('\n'),
        classes: relatedClasses.map(c => ({ id: c.id, name: c.name })),
        students: relatedStudents.map(s => ({ id: s.id, name: s.name }))
      });
    }
    
    console.log('선생님 삭제 시도:', teacher.name, teacher.id);
    const result = await teacher.delete();
    
    if (!result) {
      console.error('삭제 실패: delete() 메서드가 false 반환');
      return res.status(500).json({ error: 'Failed to delete teacher' });
    }
    
    console.log('선생님 삭제 성공:', teacher.name);
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('선생님 삭제 에러:', error);
    console.error('에러 메시지:', error.message);
    console.error('에러 스택:', error.stack);
    
    // 외래 키 제약 조건 위반 에러 처리
    if (error.message && error.message.includes('foreign key constraint')) {
      // 어떤 테이블에서 제약 조건이 발생했는지 확인
      let constraintTable = '수업 또는 학생';
      if (error.message.includes('classes_teacher_id_fkey')) {
        constraintTable = '수업';
      } else if (error.message.includes('students_teacher_id_fkey')) {
        constraintTable = '학생';
      }
      
      return res.status(400).json({ 
        error: `해당 선생님은 ${constraintTable}에 할당되어 있어 삭제할 수 없습니다. 먼저 ${constraintTable}에서 선생님을 제거해주세요.`,
        constraintTable: constraintTable
      });
    }
    
    // Supabase 에러인 경우 상세 정보 전달
    if (error.code) {
      return res.status(500).json({ 
        error: error.message || 'Failed to delete teacher',
        code: error.code,
        details: error.details,
        hint: error.hint
      });
    }
    
    next(error);
  }
};

