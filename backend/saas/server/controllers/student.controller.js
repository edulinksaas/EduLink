import crypto from 'crypto';
import { Student } from '../models/Student.js';
import { Parent } from '../models/Parent.js';
import { ParentStudent } from '../models/ParentStudent.js';
import { Academy } from '../models/Academy.js';
import { supabase } from '../config/supabase.js';

export const getStudents = async (req, res, next) => {
  try {
    const { academy_id } = req.query;
    
    if (!academy_id) {
      return res.status(400).json({ error: 'academy_id is required' });
    }
    
    const students = await Student.findAll(academy_id);
    res.json({ students, total: students.length });
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({ student });
  } catch (error) {
    next(error);
  }
};

export const createStudent = async (req, res, next) => {
  try {
    const { academy_id, name, parent_contact, note, class_id, teacher_id, fee, has_receipt } = req.body;
    
    if (!academy_id || !name) {
      return res.status(400).json({ error: 'academy_id and name are required' });
    }
    
    // id는 Student.save()에서 INSERT 시 자동으로 생성되므로 여기서는 지정하지 않는다.
    const student = new Student({
      academy_id,
      name,
      parent_contact: parent_contact || '',
      class_id: class_id || null,
      teacher_id: teacher_id || null,
      fee: typeof fee === 'number' ? fee : fee ? parseInt(fee, 10) : null,
      has_receipt: !!has_receipt,
      note: note || ''
    });
    
    await student.save();
    
    // 학부모 자동 생성/연결 로직
    if (parent_contact && parent_contact.trim()) {
      try {
        console.log(`\n📞 학부모 자동 연결 시작: 학생 ${student.name}, 연락처 ${parent_contact.trim()}`);
        
        // 학원 정보 조회 (학부모 생성 시 사용)
        const academy = await Academy.findById(academy_id);
        console.log(`🏫 학원 정보 조회: ${academy ? academy.name : '없음'}`);
        
        // 전화번호로 학부모 조회
        let parent = await Parent.findByPhone(parent_contact.trim());
        
        if (!parent) {
          // 학부모가 없으면 새로 생성
          console.log(`➕ 새 학부모 생성 시도...`);
          parent = new Parent({
            name: '', // 이름은 나중에 업데이트 가능
            email: '',
            phone: parent_contact.trim(),
            address: '',
            institution_name: academy ? academy.name : '',
            institution_type: '학원',
            institution_address: academy ? academy.address || '' : '',
            institution_phone: '',
          });
          
          await parent.save();
          console.log(`✅ 새 학부모 생성 완료: ${parent.phone} (ID: ${parent.id})`);
        } else {
          console.log(`✅ 기존 학부모 사용: ${parent.phone} (ID: ${parent.id})`);
        }
        
        // 이미 관계가 있는지 확인
        const existingRelation = await ParentStudent.findByParentAndStudent(parent.id, student.id);
        
        if (!existingRelation) {
          // parent_students 관계 생성
          console.log(`🔗 학부모-학생 관계 생성 시도...`);
          const relation = new ParentStudent({
            parent_id: parent.id,
            student_id: student.id,
            relationship: 'parent',
            is_primary: true,
          });
          
          await relation.save();
          console.log(`✅ 학부모-학생 관계 생성 완료: ${parent.phone} ↔ ${student.name} (관계 ID: ${relation.id})`);
          console.log(`📱 학부모 앱에서 확인 가능: /parent/${parent.id}/children\n`);
        } else {
          console.log(`ℹ️ 이미 관계가 존재함: ${parent.phone} ↔ ${student.name} (관계 ID: ${existingRelation.id})`);
        }

        // parentsapp에 가입된 학부모인 경우, 자녀 페이지에 학원 정보 자동 추가
        console.log(`\n🎯 학원 정보 자동 추가 함수 호출 시작...`);
        try {
          await addAcademyToParentApp(parent.phone, academy_id, student.id, academy);
          console.log(`✅ 학원 정보 자동 추가 함수 완료\n`);
        } catch (academyError) {
          // 학원 정보 추가 실패해도 학생 등록은 성공으로 처리
          console.error('❌ 학원 정보 자동 추가 실패 (학생 등록은 성공):');
          console.error('에러 상세:', academyError.message);
          console.error('에러 스택:', academyError.stack);
        }
      } catch (parentError) {
        // 학부모 생성/연결 실패해도 학생 등록은 성공으로 처리
        console.error('❌ 학부모 자동 생성/연결 실패 (학생 등록은 성공):');
        console.error('에러 상세:', parentError.message);
        console.error('에러 스택:', parentError.stack);
        // 에러를 던지지 않고 계속 진행
      }
    } else {
      console.log(`ℹ️ 학부모 연락처가 없어 자동 연결을 건너뜁니다.`);
    }
    
    res.status(201).json({ student });
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    await student.update(req.body);
    res.json({ student });
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    await student.delete();
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * parentsapp에 가입된 학부모의 자녀 페이지에 학원 정보 자동 추가
 * @param {string} parentPhone - 학부모 연락처 (하이픈 포함/미포함 가능)
 * @param {string} academyId - 학원 ID (academies 테이블)
 * @param {string} studentId - 학생 ID
 * @param {Academy} academy - 학원 정보 객체
 */
async function addAcademyToParentApp(parentPhone, academyId, studentId, academy) {
  if (!supabase) {
    console.warn('⚠️ Supabase가 연결되지 않아 학원 정보 추가를 건너뜁니다.');
    return;
  }

  if (!parentPhone || !academyId || !studentId || !academy) {
    console.warn('⚠️ 필수 정보가 없어 학원 정보 추가를 건너뜁니다.');
    console.warn(`  parentPhone: ${parentPhone}, academyId: ${academyId}, studentId: ${studentId}, academy: ${academy ? '있음' : '없음'}`);
    return;
  }

  try {
    // 전화번호 정규화 (하이픈 제거하여 숫자만)
    const phoneNumber = parentPhone.replace(/[^0-9]/g, '');
    
    console.log(`\n🎓 parentsapp 학원 정보 자동 추가 시작`);
    console.log(`  학부모 연락처: ${parentPhone} → ${phoneNumber}`);
    console.log(`  학원: ${academy.name} (ID: ${academyId})`);
    console.log(`  학생 ID: ${studentId}`);

    // 1. 학부모가 parentsapp에 가입되어 있는지 확인 (parents 테이블)
    // 전화번호 형식이 다를 수 있으므로 여러 형식으로 시도
    const phoneVariations = [
      phoneNumber,                    // 01012345678
      phoneNumber.replace(/^010/, '010-').replace(/(\d{4})(\d{4})$/, '$1-$2'), // 010-1234-5678
    ];

    let parentData = null;
    let parentError = null;

    for (const phoneVar of phoneVariations) {
      const { data, error } = await supabase
        .from('parents')
        .select('id, phone, name')
        .eq('phone', phoneVar)
        .maybeSingle();

      if (data) {
        parentData = data;
        console.log(`✅ parentsapp 가입 학부모 확인: ${data.phone} (이름: ${data.name || '없음'})`);
        break;
      }
      
      if (error && error.code !== 'PGRST116') {
        parentError = error;
        break;
      }
    }

    if (parentError) {
      console.error('❌ 학부모 조회 오류:', parentError);
      return;
    }

    if (!parentData) {
      console.log(`ℹ️ parentsapp에 가입되지 않은 학부모입니다. (연락처: ${phoneNumber})`);
      console.log(`   학원 정보 추가를 건너뜁니다.\n`);
      return;
    }

    // 2. un_academies 테이블에서 해당 학부모의 학원 정보 확인
    // 학원 이름과 학부모 연락처로 조회
    const { data: existingUnAcademy, error: unAcademyError } = await supabase
      .from('un_academies')
      .select('id, name, parent_phone')
      .eq('parent_phone', phoneNumber)
      .ilike('name', academy.name)
      .maybeSingle();

    if (unAcademyError && unAcademyError.code !== 'PGRST116') {
      console.error('❌ un_academies 조회 오류:', unAcademyError);
      return;
    }

    let unAcademyId;

    if (existingUnAcademy) {
      // 기존 학원이 있으면 사용
      unAcademyId = existingUnAcademy.id;
      console.log(`✅ 기존 학원 사용: ${existingUnAcademy.name} (ID: ${unAcademyId})`);
    } else {
      // 없으면 새로 생성
      const unAcademyData = {
        parent_phone: phoneNumber,
        name: academy.name || '',
        address: academy.address || '',
        floor: academy.floor || '',
        code: academy.code || '',
        type: '학원',
        phone: '',
        logo_url: academy.logo_url || '',
      };

      console.log(`➕ 새 학원 생성 시도: ${unAcademyData.name}`);

      const { data: newUnAcademy, error: createError } = await supabase
        .from('un_academies')
        .insert([unAcademyData])
        .select()
        .single();

      if (createError) {
        console.error('❌ un_academies 생성 오류:', createError);
        console.error('   에러 코드:', createError.code);
        console.error('   에러 메시지:', createError.message);
        console.error('   에러 상세:', createError.details);
        return;
      }

      unAcademyId = newUnAcademy.id;
      console.log(`✅ 새 학원 생성 완료: ${newUnAcademy.name} (ID: ${unAcademyId})`);
    }

    // 3. student_un_academies 테이블에 학생-학원 연결 확인 및 생성
    const { data: existingLink, error: linkCheckError } = await supabase
      .from('student_un_academies')
      .select('id')
      .eq('student_id', studentId)
      .eq('un_academy_id', unAcademyId)
      .maybeSingle();

    if (linkCheckError && linkCheckError.code !== 'PGRST116') {
      console.error('❌ student_un_academies 조회 오류:', linkCheckError);
      return;
    }

    if (existingLink) {
      console.log(`ℹ️ 이미 학생-학원 연결이 존재합니다. (연결 ID: ${existingLink.id})`);
    } else {
      // 연결 생성
      console.log(`🔗 학생-학원 연결 생성 시도...`);

      const { data: newLink, error: linkError } = await supabase
        .from('student_un_academies')
        .insert([{
          student_id: studentId,
          un_academy_id: unAcademyId,
        }])
        .select()
        .single();

      if (linkError) {
        console.error('❌ student_un_academies 연결 생성 오류:', linkError);
        console.error('   에러 코드:', linkError.code);
        console.error('   에러 메시지:', linkError.message);
        console.error('   에러 상세:', linkError.details);
        return;
      }

      console.log(`✅ 학생-학원 연결 완료: 학생 ID ${studentId} ↔ 학원 ID ${unAcademyId} (연결 ID: ${newLink.id})`);
      console.log(`📱 parentsapp에서 확인 가능: 자녀 페이지의 학원 정보에 자동 추가됨\n`);
    }
  } catch (error) {
    console.error('❌ 학원 정보 자동 추가 중 예외 발생:', error);
    console.error('에러 메시지:', error.message);
    console.error('에러 스택:', error.stack);
    throw error;
  }
}

