import crypto from 'crypto';
import { Subject } from '../models/Subject.js';

export const getSubjects = async (req, res, next) => {
  try {
    const { academy_id } = req.query;
    
    if (!academy_id) {
      return res.status(400).json({ error: 'academy_id is required' });
    }
    
    const subjects = await Subject.findAll(academy_id);
    res.json({ subjects, total: subjects.length });
  } catch (error) {
    next(error);
  }
};

export const getSubjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findById(id);
    
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    res.json({ subject });
  } catch (error) {
    next(error);
  }
};

export const createSubject = async (req, res, next) => {
  try {
    const { academy_id, name, color, description } = req.body;
    
    if (!academy_id || !name) {
      return res.status(400).json({ error: 'academy_id and name are required' });
    }
    
    const subject = new Subject({
      id: crypto.randomUUID(),
      academy_id,
      name: name.trim(),
      color: color || '#3D62E4',
      description: description || null
    });
    
    console.log('📝 과목 생성 시도:', { id: subject.id, academy_id, name: subject.name, color: subject.color });
    await subject.save();
    console.log('✅ 과목 생성 완료:', subject.id, subject.name);
    
    // 생성 후 DB에 실제로 저장되었는지 확인
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
      const supabaseKey = supabaseServiceKey || supabaseAnonKey;
      
      if (supabaseUrl && supabaseKey) {
        const adminSupabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false }
        });
        
        // 약간의 지연 후 조회 (Supabase 동기화 대기)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: verifyData, error: verifyError } = await adminSupabase
          .from('subjects')
          .select('id, name')
          .eq('id', subject.id)
          .maybeSingle(); // maybeSingle()은 없으면 null 반환, 에러 없음
        
        if (verifyError) {
          console.warn('⚠️ 생성 후 검증 실패:', verifyError.message);
        } else if (verifyData) {
          console.log('✅ DB 저장 확인됨:', verifyData.id, verifyData.name);
        } else {
          console.warn('⚠️ 생성 후 검증: 과목을 찾을 수 없습니다. ID:', subject.id);
          // 한 번 더 시도
          await new Promise(resolve => setTimeout(resolve, 500));
          const { data: retryData } = await adminSupabase
            .from('subjects')
            .select('id, name')
            .eq('id', subject.id)
            .maybeSingle();
          if (retryData) {
            console.log('✅ DB 저장 확인됨 (재시도):', retryData.id, retryData.name);
          } else {
            console.error('❌ DB 저장 확인 실패: 과목이 DB에 저장되지 않았습니다.');
          }
        }
      }
    } catch (verifyErr) {
      console.warn('⚠️ 생성 후 검증 중 에러:', verifyErr.message);
    }
    
    res.status(201).json({ subject });
  } catch (error) {
    console.error('❌ 과목 생성 실패:', error);
    next(error);
  }
};

export const updateSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findById(id);
    
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    await subject.update(req.body);
    res.json({ subject });
  } catch (error) {
    next(error);
  }
};

export const deleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('🗑️ 과목 삭제 요청 - ID:', id);
    
    if (!id) {
      console.error('❌ 과목 ID가 제공되지 않았습니다.');
      return res.status(400).json({ error: 'Subject ID is required' });
    }
    
    // Service Role Key를 사용하여 직접 삭제 시도
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
      const supabaseKey = supabaseServiceKey || supabaseAnonKey;
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
        return res.status(500).json({ error: 'Server configuration error' });
      }
      
      // Service Role Key 우선 사용 (RLS 우회)
      const adminSupabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false
        }
      });
      
      // 먼저 삭제하려는 과목이 존재하는지 확인
      const { data: existingSubject, error: checkError } = await adminSupabase
        .from('subjects')
        .select('id, name, academy_id')
        .eq('id', id)
        .maybeSingle();
      
      if (checkError) {
        console.error('❌ 과목 조회 에러:', checkError);
        console.error('에러 코드:', checkError.code);
        console.error('에러 메시지:', checkError.message);
      } else if (existingSubject) {
        console.log('✅ 삭제할 과목 찾음:', existingSubject.name, existingSubject.id, 'academy_id:', existingSubject.academy_id);
      } else {
        console.warn('⚠️ 삭제할 과목을 찾을 수 없습니다. ID:', id);
        // 디버깅을 위해 모든 과목 조회
        const { data: allSubjects, error: listError } = await adminSupabase
          .from('subjects')
          .select('id, name, academy_id');
        
        if (listError) {
          console.error('❌ 과목 목록 조회 에러:', listError);
        } else {
          console.log(`📋 DB에 저장된 전체 과목 개수: ${allSubjects?.length || 0}`);
          if (allSubjects && allSubjects.length > 0) {
            console.log('📋 저장된 과목 목록:', allSubjects.map(s => ({ id: s.id, name: s.name, academy_id: s.academy_id })));
          } else {
            console.warn('⚠️ DB에 저장된 과목이 없습니다. 기존 과목들은 DB에 저장되지 않았을 수 있습니다.');
          }
        }
        return res.status(404).json({ error: 'Subject not found' });
      }
      
      // 삭제 시도
      const { data: deletedData, error: deleteError } = await adminSupabase
        .from('subjects')
        .delete()
        .eq('id', id)
        .select();
      
      if (deleteError) {
        console.error('❌ 과목 삭제 에러:', deleteError);
        console.error('에러 코드:', deleteError.code);
        console.error('에러 메시지:', deleteError.message);
        return res.status(500).json({ error: deleteError.message || 'Failed to delete subject' });
      }
      
      // 삭제 결과 확인
      if (!deletedData || deletedData.length === 0) {
        console.warn('⚠️ 삭제된 과목이 없습니다. ID:', id);
        console.warn('⚠️ 이는 과목이 DB에 존재하지 않거나 이미 삭제되었음을 의미합니다.');
        return res.status(404).json({ error: 'Subject not found' });
      }
      
      console.log('✅ 과목 삭제 성공:', id, deletedData[0].name);
      res.json({ message: 'Subject deleted successfully', deleted: deletedData[0] });
    } catch (error) {
      console.error('❌ 과목 삭제 실패:', error);
      throw error;
    }
  } catch (error) {
    console.error('❌ 과목 삭제 에러:', error);
    next(error);
  }
};

