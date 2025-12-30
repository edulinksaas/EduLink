import crypto from 'crypto';
import { Enrollment } from '../models/Enrollment.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '..', '.env') });

// Service Role Key로 직접 클라이언트 생성 (RLS 우회)
const hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
console.log('🔑 Service Role Key 확인:', hasServiceRoleKey ? '✅ 있음' : '❌ 없음');
console.log('🔑 SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ 있음' : '❌ 없음');

const adminSupabase = hasServiceRoleKey && process.env.SUPABASE_URL
  ? createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    )
  : null;

if (!hasServiceRoleKey) {
  console.warn('⚠️ Service Role Key가 없습니다. RLS 정책 문제가 발생할 수 있습니다.');
}

export const getEnrollments = async (req, res, next) => {
  try {
    const { class_id, student_id } = req.query;
    
    const enrollments = await Enrollment.findAll(class_id, student_id);
    res.json({ enrollments, total: enrollments.length });
  } catch (error) {
    next(error);
  }
};

export const getEnrollmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const enrollment = await Enrollment.findById(id);
    
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    res.json({ enrollment });
  } catch (error) {
    next(error);
  }
};

export const createEnrollment = async (req, res, next) => {
  console.log('🚀 createEnrollment 함수 호출됨');
  console.log('📥 요청 본문:', JSON.stringify(req.body, null, 2));
  
  try {
    const { academy_id, class_id, student_id, status } = req.body;
    
    console.log('📋 파싱된 데이터:', { academy_id, class_id, student_id, status });
    
    if (!class_id || !student_id) {
      console.warn('⚠️ 필수 필드 누락: class_id 또는 student_id');
      return res.status(400).json({ error: 'class_id and student_id are required' });
    }
    
    if (!academy_id) {
      console.warn('⚠️ 필수 필드 누락: academy_id');
      return res.status(400).json({ error: 'academy_id is required' });
    }
    
    if (!adminSupabase) {
      console.error('❌ adminSupabase가 초기화되지 않았습니다.');
      return res.status(500).json({ error: '서버 설정 오류' });
    }
    
    console.log('✅ 모든 필수 필드 확인 완료, 직접 insert 시작');
    
    // 직접 Supabase에 insert (모델 우회)
    const enrollmentId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const insertData = {
      id: enrollmentId,
      academy_id,
      class_id,
      student_id,
      status: status || 'active',
      enrolled_at: now,
      created_at: now,
      updated_at: now,
    };
    
    console.log('📝 직접 insert 시도:', JSON.stringify(insertData, null, 2));
    console.log('🔑 사용하는 Supabase 클라이언트:', hasServiceRoleKey ? 'Service Role Key (RLS 우회)' : '일반 Key (RLS 적용)');
    
    // Service Role Key를 사용하여 RLS 우회
    const { error: insertError } = await adminSupabase
      .from('enrollments')
      .insert(insertData);
    
    if (insertError) {
      console.error('❌ 직접 insert 에러:', insertError);
      throw new Error(`Enrollment 생성 실패: ${insertError.message || insertError.details || insertError.hint}`);
    }
    
    console.log('✅ 직접 insert 성공! ID:', enrollmentId);
    
    // Enrollment 객체 생성하여 반환 (select 없이 insertData 사용)
    const enrollment = new Enrollment(insertData);
    
    res.status(201).json({ enrollment });
  } catch (error) {
    console.error('❌ Enrollment 생성 에러 발생!');
    console.error('에러 타입:', error.constructor.name);
    console.error('에러 메시지:', error.message);
    console.error('에러 스택:', error.stack);
    
    res.status(500).json({ 
      error: error.message || 'Enrollment 생성에 실패했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const updateEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const enrollment = await Enrollment.findById(id);
    
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    await enrollment.update(req.body);
    res.json({ enrollment });
  } catch (error) {
    next(error);
  }
};

export const deleteEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const enrollment = await Enrollment.findById(id);
    
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    await enrollment.delete();
    res.json({ message: 'Enrollment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

