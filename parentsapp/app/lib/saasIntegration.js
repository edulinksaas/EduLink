import { supabase } from './supabase';

/**
 * 웹 프로그램(saas)과 연동하기 위한 서비스 함수들
 */

/**
 * 학부모 연락처로 자녀(학생) 정보 조회
 * @param {string} parentContact - 학부모 연락처 (예: '010-1234-5678')
 * @returns {Promise<Array>} 학생 배열
 */
export const fetchChildrenByParentContact = async (parentContact) => {
  if (!supabase) {
    console.warn('Supabase가 초기화되지 않았습니다.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('parent_contact', parentContact)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('자녀 정보 조회 오류:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('자녀 정보 조회 중 예외 발생:', error);
    return [];
  }
};

/**
 * 학생의 수업 일정 조회
 * @param {string} studentId - 학생 ID
 * @returns {Promise<Array>} 수강 등록 정보 배열 (수업 정보 포함)
 * 
 * 중요: enrollments와 classes를 통해 academies 테이블(웹 프로그램에서 등록한 학원)을 조회합니다.
 * 학부모 앱에서 등록한 학원(un_academies)은 별도로 조회해야 합니다.
 */
export const fetchStudentSchedule = async (studentId) => {
  if (!supabase) {
    console.warn('Supabase가 초기화되지 않았습니다.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        classes (
          id,
          name,
          level,
          schedule,
          academy_id,
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
            name,
            capacity
          ),
          academies (
            id,
            name,
            phone,
            address
          )
        ),
        academies (
          id,
          name,
          phone,
          address
        )
      `)
      .eq('student_id', studentId)
      .eq('status', 'active')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('수업 일정 조회 오류:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('수업 일정 조회 중 예외 발생:', error);
    return [];
  }
};

/**
 * 학생의 출석 정보 조회
 * @param {string} studentId - 학생 ID
 * @param {Date} startDate - 시작 날짜
 * @param {Date} endDate - 종료 날짜
 * @returns {Promise<Array>} 출석 기록 배열
 */
export const fetchStudentAttendance = async (studentId, startDate, endDate) => {
  if (!supabase) {
    console.warn('Supabase가 초기화되지 않았습니다.');
    return [];
  }

  try {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('student_id', studentId)
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .order('date', { ascending: false });

    if (error) {
      console.error('출석 정보 조회 오류:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('출석 정보 조회 중 예외 발생:', error);
    return [];
  }
};

/**
 * 학원 정보 조회 (웹 프로그램에서 등록한 학원)
 * @param {string} academyId - 학원 ID
 * @returns {Promise<Object|null>} 학원 정보
 * 
 * 중요: academies 테이블은 웹 프로그램(saas)에서 등록한 학원만 저장합니다.
 * 학부모 앱에서 등록한 학원은 un_academies 테이블에 저장되며, fetchAcademyById를 사용하세요.
 */
export const fetchAcademy = async (academyId) => {
  if (!supabase) {
    console.warn('Supabase가 초기화되지 않았습니다.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('academies')
      .select('*')
      .eq('id', academyId)
      .single();

    if (error) {
      console.error('학원 정보 조회 오류:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('학원 정보 조회 중 예외 발생:', error);
    return null;
  }
};

/**
 * 학생의 수강료 정보 조회
 * @param {string} studentId - 학생 ID
 * @returns {Promise<Array>} 수강료 정보 배열
 */
export const fetchStudentTuitionFees = async (studentId) => {
  if (!supabase) {
    console.warn('Supabase가 초기화되지 않았습니다.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('tuition_fees')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('수강료 정보 조회 오류:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('수강료 정보 조회 중 예외 발생:', error);
    return [];
  }
};

/**
 * 학생의 메모 정보 조회
 * @param {string} studentId - 학생 ID
 * @returns {Promise<Array>} 메모 배열
 */
export const fetchStudentMemos = async (studentId) => {
  if (!supabase) {
    console.warn('Supabase가 초기화되지 않았습니다.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('student_memos')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('메모 정보 조회 오류:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('메모 정보 조회 중 예외 발생:', error);
    return [];
  }
};

/**
 * 학원의 일정 정보 조회 (웹 프로그램의 schedules 테이블)
 * @param {string} academyId - 학원 ID
 * @param {Date} startDate - 시작 날짜
 * @param {Date} endDate - 종료 날짜
 * @returns {Promise<Array>} 일정 배열
 */
export const fetchAcademySchedules = async (academyId, startDate, endDate) => {
  if (!supabase) {
    console.warn('Supabase가 초기화되지 않았습니다.');
    return [];
  }

  try {
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();

    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('academy_id', academyId)
      .gte('start_date', startDateStr)
      .lte('end_date', endDateStr)
      .order('start_date', { ascending: true });

    if (error) {
      console.error('학원 일정 조회 오류:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('학원 일정 조회 중 예외 발생:', error);
    return [];
  }
};

/**
 * 웹 프로그램 데이터를 앱 형식으로 변환
 * @param {Object} student - 학생 데이터
 * @returns {Object} 앱 형식의 학생 데이터
 */
export const transformStudentToAppFormat = (student) => {
  return {
    id: student.id,
    name: student.name,
    status: '연동됨',
    parentContact: student.parent_contact,
    note: student.note,
    academyId: student.academy_id,
    // 추가 필드는 필요에 따라 매핑
  };
};

/**
 * 수업 정보를 앱 형식으로 변환
 * @param {Object} enrollment - 수강 등록 데이터 (수업 정보 포함)
 * @returns {Object} 앱 형식의 학원 정보
 */
export const transformEnrollmentToAcademyFormat = (enrollment) => {
  if (!enrollment.classes) return null;

  const classData = enrollment.classes;
  const subject = classData.subjects;
  const teacher = classData.teachers;
  const classroom = classData.classrooms;
  // enrollments의 academy_id로 가져온 학원 정보 (우선)
  const enrollmentAcademy = enrollment.academies;
  // classes의 academy_id로 가져온 학원 정보 (대체)
  const classAcademy = classData.academies;

  // 학원 정보 우선순위: enrollments.academies > classes.academies
  const academy = enrollmentAcademy || classAcademy;

  return {
    id: classData.id,
    name: subject?.name || '과목명 없음',
    subject: subject?.name || '',
    logo: '📚',
    address: academy?.address || classroom?.name || '',
    phone: academy?.phone || teacher?.contact || '', // 학원 전화번호 우선, 없으면 선생님 연락처
    teacher: teacher?.name || '',
    level: classData.level || '',
    schedule: classData.schedule || '',
  };
};
