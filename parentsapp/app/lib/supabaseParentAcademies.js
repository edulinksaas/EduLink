import { supabase } from './supabase';

/**
 * 학부모 학습 기관 관련 Supabase 함수들
 * 
 * 중요: un_academies 테이블은 학부모 전용 앱에서 등록한 학원만 저장합니다.
 * 웹 프로그램(saas)에서 등록한 학원은 academies 테이블에 저장됩니다.
 */

/**
 * 학부모의 학습 기관 정보 조회
 * @param {string} parentPhone - 학부모 연락처
 * @returns {Promise<Object|null>} 학습 기관 정보
 */
export const fetchParentAcademy = async (parentPhone) => {
  if (!supabase) {
    console.warn('Supabase가 초기화되지 않았습니다.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('un_academies')
      .select('*')
      .eq('parent_phone', parentPhone)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // 데이터가 없으면 null 반환 (에러가 아닌 경우)
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('학부모 학습 기관 정보 조회 오류:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('학부모 학습 기관 정보 조회 중 예외 발생:', error);
    return null;
  }
};

/**
 * 학부모 학습 기관 정보 생성
 * @param {Object} academyData - 학습 기관 데이터
 * @param {string} academyData.parent_phone - 학부모 연락처
 * @param {string} academyData.name - 학원명
 * @param {string} academyData.type - 유형 (선택)
 * @param {string} academyData.address - 주소 (선택)
 * @param {string} academyData.phone - 전화번호 (선택)
 * @param {string} academyData.logo_url - 로고 URL (선택)
 * @param {string} academyData.floor - 층수 (선택)
 * @param {string} academyData.code - 코드 (선택)
 * @returns {Promise<Object|null>} 생성된 학습 기관 정보
 */
export const createParentAcademy = async (academyData) => {
  if (!supabase) {
    console.warn('Supabase가 초기화되지 않았습니다.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('un_academies')
      .insert([academyData])
      .select()
      .single();

    if (error) {
      console.error('학부모 학습 기관 정보 생성 오류:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('학부모 학습 기관 정보 생성 중 예외 발생:', error);
    return null;
  }
};

/**
 * 학부모 학습 기관 정보 수정
 * @param {string} academyId - 학습 기관 ID
 * @param {Object} updateData - 수정할 데이터
 * @returns {Promise<Object|null>} 수정된 학습 기관 정보
 */
export const updateParentAcademy = async (academyId, updateData) => {
  if (!supabase) {
    console.warn('Supabase가 초기화되지 않았습니다.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('un_academies')
      .update(updateData)
      .eq('id', academyId)
      .select()
      .single();

    if (error) {
      console.error('학부모 학습 기관 정보 수정 오류:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('학부모 학습 기관 정보 수정 중 예외 발생:', error);
    return null;
  }
};

/**
 * ID로 학원 정보 조회
 * @param {string} academyId - 학원 ID
 * @returns {Promise<Object|null>} 학원 정보
 */
export const fetchAcademyById = async (academyId) => {
  if (!supabase) {
    console.warn('Supabase가 초기화되지 않았습니다.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('un_academies')
      .select('*')
      .eq('id', academyId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
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
 * 학부모 학습 기관 정보 생성 또는 업데이트 (upsert)
 * @param {string} parentPhone - 학부모 연락처
 * @param {Object} academyData - 학습 기관 데이터
 * @returns {Promise<Object|null>} 학습 기관 정보
 */
export const upsertParentAcademy = async (parentPhone, academyData) => {
  if (!supabase) {
    console.warn('Supabase가 초기화되지 않았습니다.');
    return null;
  }

  try {
    // 먼저 존재하는지 확인
    const existing = await fetchParentAcademy(parentPhone);
    
    if (existing) {
      // 존재하면 업데이트
      return await updateParentAcademy(existing.id, {
        ...academyData,
        parent_phone: parentPhone,
      });
    } else {
      // 없으면 생성
      return await createParentAcademy({
        ...academyData,
        parent_phone: parentPhone,
      });
    }
  } catch (error) {
    console.error('학부모 학습 기관 정보 upsert 중 예외 발생:', error);
    return null;
  }
};

/**
 * 특정 자녀의 모든 학원 정보 조회 (un_academies 테이블에서)
 * @param {string} studentId - 자녀 ID
 * @returns {Promise<Array>} 학원 정보 배열
 */
export const fetchStudentUnAcademies = async (studentId) => {
  if (!supabase) {
    console.warn('Supabase가 초기화되지 않았습니다.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('student_un_academies')
      .select(`
        *,
        un_academies (*)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('자녀 학원 정보 조회 오류:', error);
      return [];
    }

    // un_academies 데이터만 추출하여 반환
    return (data || []).map(item => item.un_academies).filter(Boolean);
  } catch (error) {
    console.error('자녀 학원 정보 조회 중 예외 발생:', error);
    return [];
  }
};

/**
 * 자녀와 학원을 연결 (student_un_academies 테이블에 추가)
 * @param {string} studentId - 자녀 ID
 * @param {string} unAcademyId - 학원 ID
 * @returns {Promise<Object|null>} 연결 정보
 */
export const linkStudentToAcademy = async (studentId, unAcademyId) => {
  if (!supabase) {
    console.warn('Supabase가 초기화되지 않았습니다.');
    return null;
  }

  try {
    // 중복 체크
    const { data: existing } = await supabase
      .from('student_un_academies')
      .select('id')
      .eq('student_id', studentId)
      .eq('un_academy_id', unAcademyId)
      .single();

    if (existing) {
      // 이미 연결되어 있으면 기존 데이터 반환
      return existing;
    }

    // 연결 생성
    const { data, error } = await supabase
      .from('student_un_academies')
      .insert([{
        student_id: studentId,
        un_academy_id: unAcademyId,
      }])
      .select()
      .single();

    if (error) {
      console.error('자녀-학원 연결 오류:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('자녀-학원 연결 중 예외 발생:', error);
    return null;
  }
};
