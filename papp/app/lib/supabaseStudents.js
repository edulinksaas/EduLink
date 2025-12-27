import { supabase } from './supabase';
import { transformStudentToAppFormat, transformEnrollmentToAcademyFormat } from './saasIntegration';

/**
 * 학생 관련 Supabase 함수들
 */

/**
 * 학부모 연락처로 학부모 ID 가져오기
 * @param {string} parentContact - 학부모 연락처
 * @returns {Promise<string|null>} 학부모 ID
 */
const getParentIdByPhone = async (parentContact) => {
  if (!supabase || !parentContact) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('parents')
      .select('id')
      .eq('phone', parentContact)
      .single();

    if (error || !data) {
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('학부모 ID 조회 오류:', error);
    return null;
  }
};

/**
 * 학부모 연락처로 자녀 목록 가져오기
 * @param {string} parentContact - 학부모 연락처
 * @returns {Promise<Array>} 자녀 목록
 */
export const fetchChildrenList = async (parentContact) => {
  if (!supabase) {
    console.warn('Supabase가 초기화되지 않았습니다.');
    return [];
  }

  try {
    // 학부모 ID 가져오기
    const parentId = await getParentIdByPhone(parentContact);
    
    if (!parentId) {
      // parent_students 테이블이 없거나 학부모가 등록되지 않은 경우
      // 기존 방식으로 fallback (parent_contact 사용)
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('parent_contact', parentContact)
        .order('created_at', { ascending: false });

      if (studentsError) {
        console.error('학생 정보 조회 오류:', studentsError);
        return [];
      }

      if (!students || students.length === 0) {
        return [];
      }

      // 각 학생의 수강 정보 조회 (기존 로직)
      return await processStudentsWithAcademies(students);
    }

    // parent_students 테이블을 통해 학생 정보 조회
    const { data: parentStudents, error: parentStudentsError } = await supabase
      .from('parent_students')
      .select(`
        *,
        students (*)
      `)
      .eq('parent_id', parentId)
      .order('created_at', { ascending: false });

    if (parentStudentsError) {
      console.error('parent_students 조회 오류:', parentStudentsError);
      return [];
    }

    if (!parentStudents || parentStudents.length === 0) {
      return [];
    }

    // students 데이터 추출
    const students = parentStudents
      .map(ps => ps.students)
      .filter(Boolean);

    if (students.length === 0) {
      return [];
    }

    // 각 학생의 수강 정보 조회
    return await processStudentsWithAcademies(students);
  } catch (error) {
    console.error('자녀 목록 조회 중 예외 발생:', error);
    return [];
  }
};

/**
 * 학생 배열을 처리하여 학원 정보를 포함한 자녀 목록 반환
 * @param {Array} students - 학생 배열
 * @returns {Promise<Array>} 학원 정보를 포함한 자녀 목록
 */
const processStudentsWithAcademies = async (students) => {
  if (!students || students.length === 0) {
    return [];
  }

  try {
    // 각 학생의 수강 정보 조회
    const childrenWithAcademies = await Promise.all(
    students.map(async (student) => {
        // 수강 등록 정보 조회
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select(`
            *,
            classes (
              id,
              name,
              level,
              schedule,
              subjects (
                id,
                name,
                color
              ),
              teachers (
                id,
                name,
                contact
              ),
              classrooms (
                id,
                name
              )
            )
          `)
          .eq('student_id', student.id)
          .eq('status', 'active');

        if (enrollmentsError) {
          console.error(`학생 ${student.id}의 수강 정보 조회 오류:`, enrollmentsError);
        }

        // 학원 정보 조회 (academy_id가 있을 때만)
        // 중요: academies 테이블은 웹 프로그램(saas)에서 등록한 학원만 저장합니다.
        let academy = null;
        if (student.academy_id) {
          const { data: academyData, error: academyError } = await supabase
            .from('academies')
            .select('*')
            .eq('id', student.academy_id)
            .single();

          if (academyError) {
            console.error(`학원 정보 조회 오류:`, academyError);
          } else {
            academy = academyData;
          }
        }

        // 수강 정보를 학원 형식으로 변환
        const academies = (enrollments || [])
          .map(transformEnrollmentToAcademyFormat)
          .filter(Boolean);

        // 생년월일 포맷팅
        let birthDateFormatted = '-';
        if (student.birth_date) {
          const date = new Date(student.birth_date);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          birthDateFormatted = `${year}.${month}.${day}`;
        }

        return {
          id: student.id,
          name: student.name,
          status: '연동됨',
          parentContact: student.parent_contact,
          note: student.note,
          academyId: student.academy_id,
          birthDate: birthDateFormatted,
          grade: student.grade || '-',
          phone: student.phone || '-',
          academy: academy ? {
            name: academy.name,
            address: academy.address,
            phone: academy.code || '',
          } : null,
          academies: academies,
        };
      })
    );

    return childrenWithAcademies;
  } catch (error) {
    console.error('자녀 목록 조회 중 예외 발생:', error);
    return [];
  }
};

/**
 * 학생 상세 정보 가져오기
 * @param {string} studentId - 학생 ID
 * @returns {Promise<Object|null>} 학생 상세 정보
 */
export const fetchStudentDetail = async (studentId) => {
  if (!supabase) {
    console.warn('Supabase가 초기화되지 않았습니다.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        academies (*)
      `)
      .eq('id', studentId)
      .single();

    if (error) {
      console.error('학생 상세 정보 조회 오류:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('학생 상세 정보 조회 중 예외 발생:', error);
    return null;
  }
};

/**
 * 학생(자녀) 생성
 * @param {Object} studentData - 학생 데이터
 * @param {string} studentData.name - 학생 이름
 * @param {string} studentData.parent_contact - 학부모 연락처
 * @param {string} studentData.academy_id - 학원 ID (선택)
 * @param {string} studentData.note - 특이사항 (선택)
 * @param {string} studentData.birth_date - 생년월일 (선택)
 * @param {string} studentData.grade - 학년 (선택)
 * @param {string} studentData.phone - 학생 전화번호 (선택)
 * @returns {Promise<Object|null>} 생성된 학생 정보
 */
export const createStudent = async (studentData) => {
  if (!supabase) {
    console.warn('Supabase가 초기화되지 않았습니다.');
    return null;
  }

  try {
    // 1. 학생 정보 생성
    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert([studentData])
      .select()
      .single();

    if (studentError) {
      console.error('학생 생성 오류:', studentError);
      return null;
    }

    if (!student) {
      return null;
    }

    // 2. parent_students 테이블에 연결 정보 생성
    if (studentData.parent_contact) {
      const parentId = await getParentIdByPhone(studentData.parent_contact);
      
      if (parentId) {
        const { error: linkError } = await supabase
          .from('parent_students')
          .insert([{
            parent_id: parentId,
            student_id: student.id,
            relationship: 'parent',
            is_primary: true,
          }]);

        if (linkError) {
          console.error('parent_students 연결 오류:', linkError);
          // 연결 실패해도 학생은 생성되었으므로 학생 정보는 반환
        }
      } else {
        console.warn('학부모 ID를 찾을 수 없습니다. parent_students 연결을 건너뜁니다.');
      }
    }

    return student;
  } catch (error) {
    console.error('학생 생성 중 예외 발생:', error);
    return null;
  }
};

/**
 * 학생(자녀) 정보 수정
 * @param {string} studentId - 학생 ID
 * @param {Object} updateData - 수정할 데이터
 * @param {string} updateData.name - 학생 이름 (선택)
 * @param {string} updateData.note - 특이사항 (선택)
 * @returns {Promise<Object|null>} 수정된 학생 정보
 */
export const updateStudent = async (studentId, updateData) => {
  if (!supabase) {
    console.warn('Supabase가 초기화되지 않았습니다.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('students')
      .update(updateData)
      .eq('id', studentId)
      .select()
      .single();

    if (error) {
      console.error('학생 정보 수정 오류:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('학생 정보 수정 중 예외 발생:', error);
    return null;
  }
};
