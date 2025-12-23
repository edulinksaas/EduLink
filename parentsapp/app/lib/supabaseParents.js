import { supabase } from './supabase';

/**
 * 학부모 관련 Supabase 함수들
 */

/**
 * 학부모 정보 조회 (연락처로)
 * @param {string} phone - 학부모 연락처
 * @returns {Promise<Object|null>} 학부모 정보
 */
export const fetchParentByPhone = async (phone) => {
  if (!supabase) {
    console.warn('Supabase가 초기화되지 않았습니다.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('parents')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error) {
      // 데이터가 없으면 null 반환 (에러가 아닌 경우)
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('학부모 정보 조회 오류:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('학부모 정보 조회 중 예외 발생:', error);
    return null;
  }
};

/**
 * 학부모 정보 조회 (이메일로)
 * @param {string} email - 학부모 이메일
 * @returns {Promise<Object|null>} 학부모 정보
 */
export const fetchParentByEmail = async (email) => {
  if (!supabase) {
    console.warn('Supabase가 초기화되지 않았습니다.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('parents')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      // 데이터가 없으면 null 반환 (에러가 아닌 경우)
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('학부모 정보 조회 오류:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('학부모 정보 조회 중 예외 발생:', error);
    return null;
  }
};

/**
 * 학부모 정보 생성
 * @param {Object} parentData - 학부모 데이터
 * @param {string} parentData.name - 이름
 * @param {string} parentData.phone - 연락처
 * @param {string} parentData.email - 이메일 (선택)
 * @param {string} parentData.address - 주소 (선택)
 * @returns {Promise<Object|null>} 생성된 학부모 정보
 */
export const createParent = async (parentData) => {
  if (!supabase) {
    console.warn('Supabase가 초기화되지 않았습니다.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('parents')
      .insert([parentData])
      .select()
      .single();

    if (error) {
      console.error('학부모 정보 생성 오류:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('학부모 정보 생성 중 예외 발생:', error);
    return null;
  }
};

/**
 * 학부모 정보 수정
 * @param {string} phone - 학부모 연락처
 * @param {Object} updateData - 수정할 데이터
 * @returns {Promise<Object|null>} 수정된 학부모 정보
 */
export const updateParent = async (phone, updateData) => {
  if (!supabase) {
    console.warn('Supabase가 초기화되지 않았습니다.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('parents')
      .update(updateData)
      .eq('phone', phone)
      .select()
      .single();

    if (error) {
      console.error('학부모 정보 수정 오류:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('학부모 정보 수정 중 예외 발생:', error);
    return null;
  }
};

/**
 * 학부모 정보 생성 또는 업데이트 (upsert)
 * @param {Object} parentData - 학부모 데이터
 * @returns {Promise<Object|null>} 학부모 정보
 */
export const upsertParent = async (parentData) => {
  if (!supabase) {
    console.warn('Supabase가 초기화되지 않았습니다.');
    return null;
  }

  try {
    // 먼저 존재하는지 확인
    const existing = await fetchParentByPhone(parentData.phone);
    
    if (existing) {
      // 존재하면 업데이트
      return await updateParent(parentData.phone, parentData);
    } else {
      // 없으면 생성
      return await createParent(parentData);
    }
  } catch (error) {
    console.error('학부모 정보 upsert 중 예외 발생:', error);
    return null;
  }
};
