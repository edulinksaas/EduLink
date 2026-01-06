import { supabase } from '../config/supabase.js';

// TimetableSettings Model
export class TimetableSettings {
  constructor(data = {}) {
    // 화이트리스트 방식: 허용된 컬럼만 명시적으로 할당
    // difficulties는 절대 포함하지 않음 (DB에 존재하지 않는 컬럼)
    this.id = data.id ?? null;
    this.academy_id = data.academy_id ?? null;
    this.operating_days = Array.isArray(data.operating_days) ? data.operating_days : (Array.isArray(data.operatingDays) ? data.operatingDays : []);
    this.time_interval = data.time_interval ?? data.timeInterval ?? '1시간';
    this.day_time_settings = data.day_time_settings ?? data.dayTimeSettings ?? {};
    this.timetable_name = data.timetable_name ?? data.timetableName ?? null;
    this.classroom_ids = Array.isArray(data.classroom_ids) ? data.classroom_ids : (Array.isArray(data.classroomIds) ? data.classroomIds : []);
    this.building_names = data.building_names ?? data.buildingNames ?? null;
    this.building_classrooms = data.building_classrooms ?? data.buildingClassrooms ?? null;
    // class_types 정규화: class_types > classTypes > difficulties 순서로 우선순위 (difficulties는 읽기용으로만 사용)
    this.class_types = Array.isArray(data.class_types) ? data.class_types : (Array.isArray(data.classTypes) ? data.classTypes : (Array.isArray(data.difficulties) ? data.difficulties : []));
    this.zones = data.zones ?? null;
    this.createdAt = data.created_at ?? data.createdAt ?? new Date();
    this.updatedAt = data.updated_at ?? data.updatedAt ?? new Date();
  }
  
  static async findByAcademyId(academyId) {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return null;
    }
    
    try {
      // academy_id로 정확히 단일 row 가져오기 (최신 1건만)
      // updated_at desc, created_at desc 순서로 정렬하여 최신 1건만 반환
      // Supabase는 여러 order() 체이닝을 지원하지 않으므로, updated_at만 사용 (updated_at이 없으면 created_at 사용)
      const { data, error } = await supabase
        .from('timetable_settings')
        .select('*')
        .eq('academy_id', academyId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      // 만약 결과가 없고 created_at으로도 정렬이 필요하면 별도 쿼리 실행
      // 하지만 일반적으로 updated_at이 있으면 충분하므로 일단 이대로 진행
      
      if (error) {
        console.error('시간표 설정 조회 에러:', error);
        return null;
      }
      
      if (data) {
        return new TimetableSettings(data);
      }
      
      return null;
    } catch (error) {
      console.error('시간표 설정 조회 실패:', error);
      return null;
    }
  }
  
  async save(data) {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return this;
    }

    const academy_id = data.academy_id;
    if (!academy_id) {
      throw new Error('academy_id is required');
    }

    // 🔍 PARTIAL UPDATE: 기존 row를 먼저 조회
    const existing = await TimetableSettings.findByAcademyId(academy_id);
    
    // 기존 데이터와 incoming 데이터를 merge (incoming에 명시적으로 들어온 키만 덮어쓰기)
    const mergedData = existing ? {
      // 기존 데이터 유지
      academy_id: existing.academy_id,
      operating_days: existing.operating_days || [],
      day_time_settings: existing.day_time_settings || {},
      time_interval: existing.time_interval || '1시간',
      timetable_name: existing.timetable_name || null,
      classroom_ids: existing.classroom_ids || [],
      building_names: existing.building_names || null,
      building_classrooms: existing.building_classrooms || null,
      class_types: existing.class_types || [],
      zones: existing.zones || null,
    } : {
      // 새로 생성하는 경우 기본값
      academy_id,
      operating_days: [],
      day_time_settings: {},
      time_interval: '1시간',
      timetable_name: null,
      classroom_ids: [],
      building_names: null,
      building_classrooms: null,
      class_types: [],
      zones: null,
    };

    // incoming data에서 명시적으로 들어온 키만 덮어쓰기 (undefined는 제외)
    if (data.operating_days !== undefined) {
      mergedData.operating_days = Array.isArray(data.operating_days) ? data.operating_days : [];
    }
    if (data.day_time_settings !== undefined) {
      mergedData.day_time_settings = data.day_time_settings || {};
    }
    if (data.time_interval !== undefined) {
      mergedData.time_interval = data.time_interval || '1시간';
    }
    if (data.timetable_name !== undefined) {
      mergedData.timetable_name = data.timetable_name || null;
    }
    if (data.classroom_ids !== undefined) {
      mergedData.classroom_ids = Array.isArray(data.classroom_ids) ? data.classroom_ids : [];
    }
    if (data.building_names !== undefined) {
      mergedData.building_names = data.building_names || null;
    }
    if (data.building_classrooms !== undefined) {
      mergedData.building_classrooms = data.building_classrooms || null;
    }
    
    // class_types 정규화: 어떤 경로로 들어오든 class_types 하나로 통일
    if (data.class_types !== undefined || data.classTypes !== undefined || data.difficulties !== undefined) {
      const class_types = data.class_types ?? data.classTypes ?? data.difficulties ?? [];
      mergedData.class_types = Array.isArray(class_types) ? class_types : (class_types ? [class_types] : []);
    }

    // zones 추출 (JSON 문자열로 저장)
    if (data.zones !== undefined) {
      const zones = data.zones;
      mergedData.zones = zones ? (typeof zones === 'string' ? zones : JSON.stringify(zones)) : null;
    }

    // 화이트리스트로 DB payload 구성
    const dbPayload = {
      academy_id: mergedData.academy_id,
      operating_days: mergedData.operating_days,
      day_time_settings: mergedData.day_time_settings,
      time_interval: mergedData.time_interval,
      timetable_name: mergedData.timetable_name,
      classroom_ids: mergedData.classroom_ids,
      building_names: mergedData.building_names,
      building_classrooms: mergedData.building_classrooms,
      class_types: mergedData.class_types,
      zones: mergedData.zones,
    };

    // DB 호출 직전 로그: payload keys 확인
    const finalPayloadKeys = Object.keys(dbPayload);
    console.log('[TimetableSettings.save] PARTIAL UPDATE - payload keys:', finalPayloadKeys);
    console.log('[TimetableSettings.save] day_time_settings preserved:', !!mergedData.day_time_settings && Object.keys(mergedData.day_time_settings).length > 0);
    
    // difficulties가 포함되어 있는지 확인
    if (finalPayloadKeys.includes('difficulties')) {
      console.error('❌ ERROR: difficulties가 DB payload에 포함되어 있습니다!');
      throw new Error('difficulties는 DB에 저장할 수 없습니다. class_types만 사용하세요.');
    }

    // upsert 사용 (academy_id 기준으로 update or insert)
    const { data: result, error } = await supabase
      .from('timetable_settings')
      .upsert(dbPayload, { onConflict: 'academy_id' })
      .select();

    if (error) {
      console.error('시간표 설정 저장 에러:', error);
      throw new Error(`시간표 설정 저장 실패: ${error.message}`);
    }

    // 응답 데이터로 this 업데이트 (화이트리스트 방식)
    if (result && result.length > 0) {
      const saved = result[0];
      this.id = saved.id;
      this.academy_id = saved.academy_id;
      this.operating_days = saved.operating_days || [];
      this.time_interval = saved.time_interval || '1시간';
      this.day_time_settings = saved.day_time_settings || {};
      this.timetable_name = saved.timetable_name || null;
      this.classroom_ids = saved.classroom_ids || [];
      this.building_names = saved.building_names || null;
      this.building_classrooms = saved.building_classrooms || null;
      this.class_types = saved.class_types || [];
      this.zones = saved.zones || null;
      this.createdAt = saved.created_at || new Date();
      this.updatedAt = saved.updated_at || new Date();
    }

    return this;
  }
}

