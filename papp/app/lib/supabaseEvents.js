import { supabase } from './supabase';

/**
 * Supabase에서 일정 목록 가져오기
 * @param {Date} startDate - 시작 날짜
 * @param {Date} endDate - 종료 날짜
 * @returns {Promise<Array>} 일정 배열
 */
export const fetchEvents = async (startDate, endDate) => {
  if (!supabase) {
    console.warn('Supabase가 초기화되지 않았습니다.');
    return [];
  }

  try {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', startDateStr)
      .lte('event_date', endDateStr)
      .order('event_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('일정 조회 오류:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('일정 조회 중 예외 발생:', error);
    return [];
  }
};

/**
 * 일정 생성
 * @param {Object} eventData - 일정 데이터
 * @param {string} eventData.title - 제목
 * @param {string} eventData.event_date - 날짜 (YYYY-MM-DD)
 * @param {string} eventData.start_time - 시작 시간 (HH:MM)
 * @param {string} eventData.end_time - 종료 시간 (HH:MM)
 * @param {string} eventData.location - 장소 (선택)
 * @param {string} eventData.memo - 메모 (선택)
 * @returns {Promise<Object|null>} 생성된 일정 또는 null
 */
export const createEvent = async (eventData) => {
  if (!supabase) {
    console.warn('Supabase가 초기화되지 않았습니다.');
    return null;
  }

  try {
    // 현재 사용자 ID 가져오기 (인증 사용 시)
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    const { data, error } = await supabase
      .from('events')
      .insert([
        {
          ...eventData,
          user_id: userId,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('일정 생성 오류:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('일정 생성 중 예외 발생:', error);
    return null;
  }
};

/**
 * 일정 수정
 * @param {string} eventId - 일정 ID
 * @param {Object} eventData - 수정할 일정 데이터
 * @returns {Promise<Object|null>} 수정된 일정 또는 null
 */
export const updateEvent = async (eventId, eventData) => {
  if (!supabase) {
    console.warn('Supabase가 초기화되지 않았습니다.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .update(eventData)
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      console.error('일정 수정 오류:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('일정 수정 중 예외 발생:', error);
    return null;
  }
};

/**
 * 일정 삭제
 * @param {string} eventId - 일정 ID
 * @returns {Promise<boolean>} 성공 여부
 */
export const deleteEvent = async (eventId) => {
  if (!supabase) {
    console.warn('Supabase가 초기화되지 않았습니다.');
    return false;
  }

  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('일정 삭제 오류:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('일정 삭제 중 예외 발생:', error);
    return false;
  }
};

/**
 * 특정 날짜의 일정 가져오기
 * @param {Date} date - 날짜
 * @returns {Promise<Array>} 일정 배열
 */
export const fetchEventsByDate = async (date) => {
  if (!supabase) {
    console.warn('Supabase가 초기화되지 않았습니다.');
    return [];
  }

  try {
    const dateStr = date.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('event_date', dateStr)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('일정 조회 오류:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('일정 조회 중 예외 발생:', error);
    return [];
  }
};

/**
 * Supabase 이벤트 데이터를 앱 형식으로 변환
 * @param {Object} supabaseEvent - Supabase 이벤트 데이터
 * @returns {Object} 앱 형식의 이벤트 데이터
 */
export const transformSupabaseEventToAppFormat = (supabaseEvent) => {
  // 시간을 오전/오후 형식으로 변환
  const formatTimeToAMPM = (timeStr) => {
    if (!timeStr) return '';
    const [hour, minute] = timeStr.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? '오후' : '오전';
    const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
    return `${ampm} ${displayHour}:${minute || '00'}`;
  };

  return {
    id: supabaseEvent.id,
    title: supabaseEvent.title,
    time: formatTimeToAMPM(supabaseEvent.start_time),
    location: supabaseEvent.location || '',
    // 일별 보기용
    startTime: supabaseEvent.start_time,
    endTime: supabaseEvent.end_time,
    memo: supabaseEvent.memo || '',
  };
};
