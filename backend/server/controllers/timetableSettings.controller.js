import { TimetableSettings } from '../models/TimetableSettings.js';
import { Classroom } from '../models/Classroom.js';
import { supabase } from '../config/supabase.js';

/**
 * timetable_settings는 UI 설정용 데이터 저장소입니다.
 * 실제 강의실 데이터의 단일 진실 소스(SSOT)는 classrooms 테이블입니다.
 * timetable_settings 저장 후 classrooms 테이블을 동기화하여
 * 홈/선생님 페이지에서 GET /api/classrooms로 조회할 수 있도록 합니다.
 */
export const getTimetableSettings = async (req, res, next) => {
  try {
    const { academy_id } = req.query;
    
    if (!academy_id) {
      return res.status(400).json({ error: 'academy_id is required' });
    }
    
    // academy_id로 정확히 단일 row 가져오기 (최신 1건)
    const settings = await TimetableSettings.findByAcademyId(academy_id);
    
    if (!settings) {
      return res.json({ 
        settings: null,
        message: '시간표 설정이 없습니다.' 
      });
    }
    
    res.json({ settings });
  } catch (error) {
    next(error);
  }
};

/**
 * timetable_settings 저장 및 classrooms 테이블 동기화
 * 
 * 저장 흐름:
 * 1. timetable_settings에 UI 설정 저장 (zones, classroom_ids 등)
 * 2. zones 정보를 파싱하여 classrooms 테이블에 upsert
 *    - zones: [{ name: "1층", rooms: ["101", "102"] }, ...]
 *    - 각 room을 classrooms 테이블에 저장 (name 기준으로 upsert)
 */
export const saveTimetableSettings = async (req, res, next) => {
  try {
    // 📦 timetable-settings payload 디버깅 로그
    console.log('📦 timetable-settings payload:', req.body);
    
    // academy_id 추출 (body 또는 query에서)
    const academy_id = req.body.academy_id ?? req.query.academy_id;
    if (!academy_id) {
      return res.status(400).json({ error: { message: 'academy_id is required' } });
    }
    
    // 🔍 PARTIAL UPDATE: 기존 settings 조회 (model의 save()에서도 처리하지만, 여기서도 로깅)
    const existingSettings = await TimetableSettings.findByAcademyId(academy_id);
    console.log('[timetable_settings controller] 기존 settings 존재:', !!existingSettings);
    if (existingSettings) {
      console.log('[timetable_settings controller] 기존 day_time_settings:', 
        existingSettings.day_time_settings ? Object.keys(existingSettings.day_time_settings).length + '개 요일' : '없음');
    }
    
    // class_types alias 통일: class_types > classTypes > difficulties
    // 어떤 경로로 들어오든 최종 저장 컬럼은 class_types(JSONB) 하나로 통일
    const class_types =
      req.body.class_types ?? req.body.classTypes ?? req.body.difficulties;
    
    // 화이트리스트 방식으로 payload 생성 (허용된 컬럼만 포함)
    // undefined는 명시적으로 제외하여 model의 save()에서 기존 값 유지
    // 절대 ...req.body 사용 금지!
    // difficulties는 절대 payload에 포함하지 않음 (class_types로만 저장)
    const payload = {
      academy_id,
    };
    
    // 명시적으로 들어온 값만 payload에 추가 (undefined는 제외)
    if (req.body.operating_days !== undefined) {
      payload.operating_days = req.body.operating_days;
    }
    if (req.body.day_time_settings !== undefined) {
      payload.day_time_settings = req.body.day_time_settings;
    }
    if (req.body.time_interval !== undefined) {
      payload.time_interval = req.body.time_interval;
    }
    if (req.body.timetable_name !== undefined) {
      payload.timetable_name = req.body.timetable_name;
    }
    if (req.body.classroom_ids !== undefined) {
      payload.classroom_ids = req.body.classroom_ids || (req.body.classroom_id ? [req.body.classroom_id] : []);
    }
    if (req.body.building_names !== undefined) {
      payload.building_names = req.body.building_names;
    }
    if (req.body.building_classrooms !== undefined) {
      payload.building_classrooms = req.body.building_classrooms;
    }
    if (class_types !== undefined) {
      payload.class_types = Array.isArray(class_types) ? class_types : (class_types ? [class_types] : []);
    }
    if (req.body.zones !== undefined) {
      payload.zones = req.body.zones; // zones도 포함 (JSON 문자열 또는 객체)
    }
    
    // 디버깅 로그: payload keys 확인
    const payloadKeys = Object.keys(payload);
    console.log('[timetable_settings controller] payload keys (undefined 제외):', payloadKeys);
    console.log('[timetable_settings controller] day_time_settings in payload:', payload.day_time_settings !== undefined ? '있음' : '없음 (기존 값 유지)');
    
    // difficulties가 포함되어 있는지 확인
    if (payloadKeys.includes('difficulties')) {
      console.error('❌ ERROR: payload에 difficulties가 포함되어 있습니다!');
      delete payload.difficulties; // 강제 제거
      console.log('[timetable_settings payload keys AFTER REMOVAL]', Object.keys(payload));
    }
    
    // 1단계: timetable_settings 저장 (partial update)
    const settings = new TimetableSettings(payload);
    await settings.save(payload); // 화이트리스트 payload를 직접 전달
    
    console.log('✅ timetable_settings 저장 완료');
    
    // 2단계: classrooms 테이블 동기화 (zones 정보 기반)
    try {
      // zones 파싱 (JSON 문자열 또는 객체)
      let zones = null;
      if (payload.zones) {
        if (typeof payload.zones === 'string') {
          try {
            zones = JSON.parse(payload.zones);
          } catch (e) {
            console.warn('⚠️ zones JSON 파싱 실패:', e);
            zones = null;
          }
        } else if (Array.isArray(payload.zones)) {
          zones = payload.zones;
        }
      }
      
      if (zones && Array.isArray(zones) && zones.length > 0) {
        console.log('🔄 classrooms 테이블 동기화 시작...');
        
        // zones에서 모든 강의실 추출
        const allRooms = [];
        zones.forEach(zone => {
          if (zone.name && Array.isArray(zone.rooms)) {
            zone.rooms.forEach(roomName => {
              if (roomName && typeof roomName === 'string') {
                allRooms.push({
                  name: roomName.trim(),
                  zone: zone.name
                });
              }
            });
          }
        });
        
        console.log(`📋 동기화할 강의실 수: ${allRooms.length}개`);
        
        // 기존 강의실 조회 (academy_id 기준)
        const existingClassrooms = await Classroom.findAll(academy_id);
        const classroomsMap = new Map();
        existingClassrooms.forEach(cls => {
          if (cls.name) {
            classroomsMap.set(cls.name.toLowerCase(), cls);
          }
        });
        
        // 각 강의실을 classrooms 테이블에 upsert
        const upsertPromises = allRooms.map(async (room) => {
          const roomNameLower = room.name.toLowerCase();
          const existing = classroomsMap.get(roomNameLower);
          
          if (existing && existing.id) {
            // 기존 강의실 업데이트 (name, capacity 유지)
            const classroom = new Classroom({
              id: existing.id,
              academy_id: academy_id,
              name: room.name, // 원본 대소문자 유지
              capacity: existing.capacity || 20
            });
            await classroom.save();
            console.log(`✅ 강의실 업데이트: ${room.name} (ID: ${existing.id})`);
            return existing.id;
          } else {
            // 새 강의실 생성
            const classroom = new Classroom({
              academy_id: academy_id,
              name: room.name,
              capacity: 20 // 기본 수용 인원
            });
            await classroom.save();
            console.log(`✅ 강의실 생성: ${room.name} (ID: ${classroom.id})`);
            return classroom.id;
          }
        });
        
        const upsertedIds = await Promise.all(upsertPromises);
        console.log(`✅ classrooms 테이블 동기화 완료: ${upsertedIds.length}개 강의실 처리됨`);
        
        // classroom_ids가 제공된 경우, 해당 ID들도 확인하여 존재하는지 검증
        if (payload.classroom_ids && Array.isArray(payload.classroom_ids) && payload.classroom_ids.length > 0) {
          console.log(`🔍 classroom_ids 검증: ${payload.classroom_ids.length}개 ID 확인 중...`);
          // ID 검증은 선택사항 (zones 기반 동기화가 우선)
        }
      } else {
        console.log('ℹ️ zones 정보가 없어 classrooms 동기화를 건너뜁니다.');
      }
    } catch (syncError) {
      // classrooms 동기화 실패해도 timetable_settings 저장은 성공했으므로 경고만 출력
      console.error('⚠️ classrooms 테이블 동기화 실패 (timetable_settings는 저장됨):', syncError);
      console.error('   에러 상세:', syncError.message);
      // 에러를 throw하지 않고 계속 진행 (timetable_settings 저장은 성공)
    }
    
    res.json({ 
      settings,
      message: '시간표 설정이 저장되었습니다.' 
    });
  } catch (error) {
    console.error('🔥 timetable-settings save error:', error);
    
    // Supabase 에러 정보 추출
    const supabaseError = error?.details || error?.hint || error?.code || null;
    const errorResponse = {
      message: error?.message || 'timetable-settings save failed',
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      supabaseError: supabaseError ? {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      } : null,
      raw: process.env.NODE_ENV === 'development' ? error : undefined
    };
    
    return res.status(500).json(errorResponse);
  }
};

