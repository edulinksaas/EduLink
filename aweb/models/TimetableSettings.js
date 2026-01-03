import { supabase } from '../config/supabase.js';

// TimetableSettings Model
export class TimetableSettings {
  constructor(data) {
    this.id = data.id;
    this.academy_id = data.academy_id;
    this.operating_days = data.operating_days || data.operatingDays || [];
    this.time_interval = data.time_interval || data.timeInterval || '1시간';
    this.day_time_settings = data.day_time_settings || data.dayTimeSettings || {};
    this.timetable_name = data.timetable_name || data.timetableName || '';
    this.classroom_ids = data.classroom_ids || data.classroomIds || [];
    this.building_names = data.building_names || data.buildingNames || null;
    this.building_classrooms = data.building_classrooms || data.buildingClassrooms || null;
    this.createdAt = data.created_at || data.createdAt || new Date();
    this.updatedAt = data.updated_at || data.updatedAt || new Date();
  }
  
  static async findByAcademyId(academyId) {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('timetable_settings')
        .select('*')
        .eq('academy_id', academyId)
        .maybeSingle();
      
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
  
  async save() {
    if (!supabase) {
      console.warn('Supabase가 연결되지 않았습니다.');
      return this;
    }
    
    try {
      const settingsData = {
        academy_id: this.academy_id,
        operating_days: Array.isArray(this.operating_days) ? this.operating_days : [],
        time_interval: this.time_interval || '1시간',
        day_time_settings: this.day_time_settings || {},
        timetable_name: this.timetable_name || null,
        updated_at: new Date().toISOString(),
      };
      
      // classroom_ids가 있으면 추가 (컬럼이 존재하는 경우에만)
      if (Array.isArray(this.classroom_ids) && this.classroom_ids.length >= 0) {
        settingsData.classroom_ids = this.classroom_ids;
      }
      
      // building_names가 있으면 추가
      if (this.building_names) {
        settingsData.building_names = this.building_names;
      }
      
      // building_classrooms가 있으면 추가
      if (this.building_classrooms) {
        settingsData.building_classrooms = this.building_classrooms;
      }
      
      // building_classrooms가 있으면 추가
      if (this.building_classrooms) {
        settingsData.building_classrooms = this.building_classrooms;
      }
      
      // 기존 설정이 있는지 확인
      const existing = await TimetableSettings.findByAcademyId(this.academy_id);
      
      if (existing && existing.id) {
        // 업데이트 시 classroom_ids 컬럼이 없을 수 있으므로 조건부로 추가
        const updateData = { ...settingsData };
        
        // classroom_ids가 있으면 추가 시도
        if (Array.isArray(this.classroom_ids)) {
          updateData.classroom_ids = this.classroom_ids;
        }
        
        // building_names가 있으면 추가
        if (this.building_names) {
          updateData.building_names = this.building_names;
        }
        
        // building_classrooms가 있으면 추가
        if (this.building_classrooms) {
          updateData.building_classrooms = this.building_classrooms;
        }
        
        const { data: updateResult, error: updateError } = await supabase
          .from('timetable_settings')
          .update(updateData)
          .eq('id', existing.id)
          .select();
        
        if (updateError) {
          // classroom_ids 컬럼이 없는 경우 에러 처리
          if (updateError.code === 'PGRST204' && updateError.message?.includes('classroom_ids')) {
            console.warn('⚠️ classroom_ids 컬럼이 없습니다. 컬럼 없이 저장합니다.');
            // classroom_ids 없이 다시 시도
            delete updateData.classroom_ids;
            const { data: retryResult, error: retryError } = await supabase
              .from('timetable_settings')
              .update(updateData)
              .eq('id', existing.id)
              .select();
            
            if (retryError) {
              console.error('시간표 설정 업데이트 에러:', retryError);
              throw new Error(`시간표 설정 업데이트 실패: ${retryError.message}`);
            }
            
            if (retryResult && retryResult.length > 0) {
              Object.assign(this, new TimetableSettings(retryResult[0]));
            }
          } else {
            console.error('시간표 설정 업데이트 에러:', updateError);
            throw new Error(`시간표 설정 업데이트 실패: ${updateError.message}`);
          }
        } else {
          if (updateResult && updateResult.length > 0) {
            Object.assign(this, new TimetableSettings(updateResult[0]));
          }
        }
      } else {
        // 생성
        const insertData = {
          ...settingsData,
          created_at: new Date().toISOString(),
        };
        
        // classroom_ids가 있으면 추가 시도
        if (Array.isArray(this.classroom_ids)) {
          insertData.classroom_ids = this.classroom_ids;
        }
        
        // building_names가 있으면 추가
        if (this.building_names) {
          insertData.building_names = this.building_names;
        }
        
        // building_classrooms가 있으면 추가
        if (this.building_classrooms) {
          insertData.building_classrooms = this.building_classrooms;
        }
        
        const { data: insertResult, error: insertError } = await supabase
          .from('timetable_settings')
          .insert(insertData)
          .select();
        
        if (insertError) {
          // classroom_ids 컬럼이 없는 경우 에러 처리
          if (insertError.code === 'PGRST204' && insertError.message?.includes('classroom_ids')) {
            console.warn('⚠️ classroom_ids 컬럼이 없습니다. 컬럼 없이 저장합니다.');
            // classroom_ids 없이 다시 시도
            delete insertData.classroom_ids;
            const { data: retryResult, error: retryError } = await supabase
              .from('timetable_settings')
              .insert(insertData)
              .select();
            
            if (retryError) {
              console.error('시간표 설정 생성 에러:', retryError);
              throw new Error(`시간표 설정 생성 실패: ${retryError.message}`);
            }
            
            if (retryResult && retryResult.length > 0) {
              Object.assign(this, new TimetableSettings(retryResult[0]));
            }
          } else {
            console.error('시간표 설정 생성 에러:', insertError);
            throw new Error(`시간표 설정 생성 실패: ${insertError.message}`);
          }
        } else {
          if (insertResult && insertResult.length > 0) {
            Object.assign(this, new TimetableSettings(insertResult[0]));
          }
        }
      }
      
      return this;
    } catch (error) {
      console.error('시간표 설정 저장 실패:', error);
      throw error;
    }
  }
}

