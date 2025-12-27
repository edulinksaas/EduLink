import { Class } from '../models/Class.js';
import { Classroom } from '../models/Classroom.js';
import { Student } from '../models/Student.js';
import crypto from 'crypto';

export const getClasses = async (req, res, next) => {
  try {
    const { academy_id } = req.query;
    
    console.log('📥 GET /api/classes 요청');
    console.log('   Query 파라미터:', req.query);
    console.log('   academy_id:', academy_id);
    
    if (!academy_id) {
      console.warn('⚠️ academy_id가 없습니다.');
      return res.status(400).json({ error: 'academy_id is required' });
    }
    
    const classes = await Class.findAll(academy_id);
    console.log('✅ 수업 목록 반환:', classes.length, '개');
    
    if (classes.length > 0) {
      console.log('📋 반환되는 수업 상세:');
      classes.forEach((cls, index) => {
        console.log(`   ${index + 1}. ${cls.name} (ID: ${cls.id})`);
        console.log(`      - classroom_id: ${cls.classroom_id}`);
        console.log(`      - start_time: ${cls.start_time}`);
        console.log(`      - end_time: ${cls.end_time}`);
      });
    } else {
      console.warn('⚠️ 반환되는 수업이 없습니다.');
    }
    
    res.json({ classes, total: classes.length });
  } catch (error) {
    console.error('❌ getClasses 컨트롤러 에러:', error);
    console.error('   에러 스택:', error.stack);
    next(error);
  }
};

export const getClassById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const classItem = await Class.findById(id);
    
    if (!classItem) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    res.json({ class: classItem });
  } catch (error) {
    next(error);
  }
};

/**
 * 강의실 찾기 또는 생성 헬퍼 함수
 */
async function findOrCreateClassroom(classroom_id, academy_id) {
  // UUID 형식 확인
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(classroom_id));
  
  console.log('🔍 findOrCreateClassroom 호출:', {
    classroom_id,
    academy_id,
    isUUID
  });
  
  // 1. 강의실 목록 먼저 가져오기
  const allClassrooms = await Classroom.findAll(academy_id);
  console.log('📋 가져온 강의실 목록:', allClassrooms.length, '개');
  
  // academy_id 없이 전체 조회한 결과를 저장할 변수 (에러 로깅용)
  let allClassroomsWithoutFilter = null;
  
  // 2. UUID인 경우 ID로 찾기
  if (isUUID) {
    // 목록에서 찾기
    const foundById = allClassrooms.find(c => c.id === classroom_id);
    if (foundById) {
      console.log('✅ 강의실 목록에서 찾음 (UUID):', foundById.id, foundById.name);
      return foundById;
    }
    
    console.log('⚠️ 강의실 목록에서 찾지 못함. DB에서 직접 조회 시도...');
    
    // DB에서 직접 조회 시도 (academy_id와 함께 조회)
    const classroom = await Classroom.findById(classroom_id, academy_id);
    if (classroom) {
      console.log('✅ 강의실 찾음 (UUID, 직접 조회):', classroom.id, classroom.name);
      return classroom;
    }
    
    console.warn('⚠️ DB에서도 찾지 못함. academy_id 없이 전체 조회 시도...');
    
    // academy_id 없이 전체 조회 시도 (RLS 문제일 수 있음)
    allClassroomsWithoutFilter = await Classroom.findAll(null);
    const foundInAll = allClassroomsWithoutFilter.find(c => c.id === classroom_id);
    if (foundInAll) {
      console.log('✅ 전체 강의실 목록에서 찾음:', foundInAll.id, foundInAll.name);
      // academy_id가 일치하는지 확인
      if (foundInAll.academy_id === academy_id) {
        return foundInAll;
      } else {
        console.warn('⚠️ 강의실이 다른 학원에 속해있습니다:', {
          강의실학원ID: foundInAll.academy_id,
          요청학원ID: academy_id
        });
      }
    }
  } else {
    // 3. 이름으로 찾기
    const foundByName = allClassrooms.find(c => c.name === classroom_id);
    if (foundByName) {
      console.log('✅ 강의실 목록에서 찾음 (이름):', foundByName.id, foundByName.name);
      return foundByName;
    }
    
    // DB에서 이름으로 직접 조회 시도
    const classroom = await Classroom.findByName(classroom_id, academy_id);
    if (classroom) {
      console.log('✅ 강의실 찾음 (이름):', classroom.id, classroom.name);
      return classroom;
    }
  }
  
  // 4. 강의실 생성 시도
  // UUID가 전달되었는데 강의실을 찾지 못한 경우는 에러 (잘못된 ID)
  if (isUUID) {
    console.error('❌ UUID 형식의 classroom_id에 해당하는 강의실을 찾을 수 없습니다:', classroom_id);
    console.error('   요청된 academy_id:', academy_id);
    console.error('   전체 강의실 목록 (academy_id 필터 적용):', allClassrooms.map(c => ({ id: c.id, name: c.name, academy_id: c.academy_id })));
    
    // academy_id 없이 전체 조회한 결과도 로깅
    if (allClassroomsWithoutFilter && allClassroomsWithoutFilter.length > 0) {
      console.error('   전체 강의실 목록 (필터 없음):', allClassroomsWithoutFilter.map(c => ({ id: c.id, name: c.name, academy_id: c.academy_id })));
      const foundInOtherAcademy = allClassroomsWithoutFilter.find(c => c.id === classroom_id);
      if (foundInOtherAcademy) {
        console.error('   ⚠️ 해당 강의실은 다른 학원에 속해있습니다:', {
          강의실ID: foundInOtherAcademy.id,
          강의실명: foundInOtherAcademy.name,
          강의실의academy_id: foundInOtherAcademy.academy_id,
          요청한academy_id: academy_id
        });
      }
    }
    
    throw new Error(`강의실 ID "${classroom_id}"에 해당하는 강의실을 찾을 수 없습니다.`);
  }
  
  // 이름으로 전달된 경우에만 강의실 생성 시도
  try {
    const newClassroom = new Classroom({
      academy_id: academy_id,
      name: classroom_id, // 이름 그대로 사용
      capacity: 20
    });
    
    console.log('📝 강의실 생성 시도:', {
      id: newClassroom.id,
      name: newClassroom.name,
      academy_id: academy_id
    });
    
    await newClassroom.save();
    
    // save()가 예외 없이 끝나면 INSERT가 성공한 것으로 간주한다.
    console.log('✅ 강의실 생성 완료 (추가 검증 생략):', newClassroom.id, newClassroom.name);
    return newClassroom;
  } catch (error) {
    console.error('❌ 강의실 생성 실패:', error.message);
    console.error('   에러 상세:', error);
    throw new Error(`강의실 생성에 실패했습니다: ${error.message}`);
  }
}

export const createClass = async (req, res, next) => {
  try {
    console.log('📝 POST /api/classes 요청 받음');
    console.log('📝 요청 본문:', JSON.stringify(req.body, null, 2));
    
    const {
      academy_id,
      subject_id,
      teacher_id,
      classroom_id,
      name,
      level,
      start_time,
      end_time,
      max_students,
      schedule
    } = req.body;
    
    // 필수 필드 확인
    if (!academy_id || !subject_id || !teacher_id || !classroom_id || !name) {
      console.warn('⚠️ 필수 필드 누락:', {
        academy_id: !!academy_id,
        subject_id: !!subject_id,
        teacher_id: !!teacher_id,
        classroom_id: !!classroom_id,
        name: !!name
      });
      return res.status(400).json({
        error: '필수 필드가 누락되었습니다: academy_id, subject_id, teacher_id, classroom_id, name'
      });
    }
    
    // 강의실 찾기 또는 생성
    console.log('🔍 강의실 확인:', classroom_id);
    const classroom = await findOrCreateClassroom(classroom_id, academy_id);
    
    if (!classroom || !classroom.id) {
      throw new Error('강의실을 찾거나 생성할 수 없습니다.');
    }
    
    console.log('✅ 사용할 강의실:', {
      id: classroom.id,
      name: classroom.name,
      academy_id: classroom.academy_id
    });
    
    // 수업 생성
    const newId = crypto.randomUUID();
    const classItem = new Class({
      id: newId,
      academy_id,
      subject_id,
      teacher_id,
      classroom_id: classroom.id, // 확인된 강의실 ID 사용
      level: level || '초급',
      name,
      schedule: schedule || null,
      start_time,
      end_time,
      max_students: max_students ? parseInt(max_students) : null
    });
    
    console.log('💾 수업 저장 시도:', {
      id: classItem.id,
      name: classItem.name,
      classroom_id: classItem.classroom_id
    });
    
    await classItem.save(true); // forceInsert
    
    console.log('✅ 수업 저장 완료:', {
      id: classItem.id,
      name: classItem.name,
      academy_id: classItem.academy_id
    });
    
    res.status(201).json({
      class: classItem,
      message: '수업이 성공적으로 생성되었습니다.'
    });
  } catch (error) {
    console.error('❌ 수업 생성 실패:', error);
    console.error('   에러 메시지:', error.message);
    console.error('   에러 스택:', error.stack);
    
    res.status(500).json({
      error: error.message || '수업 생성에 실패했습니다.'
    });
  }
};

export const updateClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const classItem = await Class.findById(id);
    if (!classItem) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    // teacher_id가 변경되는 경우 확인
    const oldTeacherId = classItem.teacher_id;
    const newTeacherId = updateData.teacher_id;
    const teacherChanged = newTeacherId && newTeacherId !== oldTeacherId;
    
    // classroom_id가 변경되는 경우 강의실 확인
    if (updateData.classroom_id && updateData.classroom_id !== classItem.classroom_id) {
      const classroom = await findOrCreateClassroom(updateData.classroom_id, classItem.academy_id);
      updateData.classroom_id = classroom.id;
    }
    
    Object.assign(classItem, updateData);
    await classItem.save();
    
    // teacher_id가 변경된 경우, 해당 수업에 속한 모든 학생들의 teacher_id도 업데이트
    if (teacherChanged) {
      console.log(`🔄 수업 담당 선생님 변경 감지: ${oldTeacherId} → ${newTeacherId}`);
      console.log(`📚 수업 ID: ${id}, 수업명: ${classItem.name}`);
      
      try {
        const updatedStudents = await Student.updateTeacherByClassId(id, newTeacherId);
        console.log(`✅ ${updatedStudents.length}명의 학생 담당 선생님 업데이트 완료`);
      } catch (studentUpdateError) {
        console.error('⚠️ 학생 담당 선생님 업데이트 실패:', studentUpdateError);
        // 학생 업데이트 실패해도 수업 업데이트는 성공한 것으로 처리
        // 하지만 사용자에게 알림은 제공
        return res.json({
          class: classItem,
          message: '수업이 업데이트되었지만, 일부 학생의 담당 선생님 업데이트에 실패했습니다.',
          warning: '학생 관리 페이지에서 수동으로 확인해주세요.'
        });
      }
    }
    
    res.json({
      class: classItem,
      message: '수업이 성공적으로 업데이트되었습니다.'
    });
  } catch (error) {
    console.error('❌ 수업 업데이트 실패:', error);
    next(error);
  }
};

export const deleteClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('수업 삭제 요청:', id);
    
    const classItem = await Class.findById(id);
    
    if (!classItem) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    // 해당 수업에 등록된 학생이 있는지 확인
    const { Student } = await import('../models/Student.js');
    const relatedStudents = await Student.findAll(null); // 모든 학생 조회
    const studentsInClass = relatedStudents.filter(s => s.class_id === id);
    
    if (studentsInClass.length > 0) {
      const studentNames = studentsInClass.map(s => s.name).join(', ');
      console.error('삭제 불가: 해당 수업에 학생이 등록되어 있음:', studentNames);
      return res.status(400).json({ 
        error: `해당 수업에는 ${studentsInClass.length}명의 학생이 등록되어 있어 삭제할 수 없습니다.`,
        details: `등록된 학생: ${studentNames}`,
        students: studentsInClass.map(s => ({ id: s.id, name: s.name }))
      });
    }
    
    console.log('수업 삭제 시도:', classItem.name, classItem.id);
    const result = await classItem.delete();
    
    if (!result) {
      console.error('삭제 실패: delete() 메서드가 false 반환');
      return res.status(500).json({ error: 'Failed to delete class' });
    }
    
    console.log('수업 삭제 성공:', classItem.name);
    res.json({ message: '수업이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('❌ 수업 삭제 실패:', error);
    console.error('에러 메시지:', error.message);
    console.error('에러 스택:', error.stack);
    
    // 외래 키 제약 조건 위반 에러 처리
    if (error.message && error.message.includes('foreign key constraint')) {
      return res.status(400).json({ 
        error: '해당 수업에 등록된 학생이 있어 삭제할 수 없습니다. 먼저 학생 관리 페이지에서 해당 수업의 학생들을 다른 수업으로 이동하거나 삭제해주세요.'
      });
    }
    
    // Supabase 에러인 경우 상세 정보 전달
    if (error.code) {
      return res.status(500).json({ 
        error: error.message || 'Failed to delete class',
        code: error.code,
        details: error.details,
        hint: error.hint
      });
    }
    
    next(error);
  }
};
