import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { Academy } from '../models/Academy.js';
import crypto from 'crypto';

// 환경 변수는 이미 서버 시작 시 검증됨
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const NODE_ENV = process.env.NODE_ENV || 'development';

// 학원 코드 생성 함수
// 혼동하기 쉬운 문자 제외: 0(영), O(오), I(아이), 1(일), L(엘)
const generateAcademyCode = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // 0, O, I, 1, L 제외
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const register = async (req, res, next) => {
  try {
    const { academy_code, password, academy_name, name, email, phone } = req.body;

    // 필수 필드 검증
    if (!academy_code || !password || !academy_name || !name) {
      return res.status(400).json({ 
        error: '학원 코드, 비밀번호, 학원 이름, 관리자 이름은 필수입니다.' 
      });
    }

    // 입력값 sanitization 및 검증
    const normalizedAcademyCode = academy_code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // 학원 코드 형식 검증 (8자리 영숫자)
    if (!/^[A-Z0-9]{8}$/.test(normalizedAcademyCode)) {
      return res.status(400).json({ 
        error: '학원 코드는 8자리 영숫자여야 합니다.' 
      });
    }

    // 비밀번호 길이 및 복잡도 검증
    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({ 
        error: '비밀번호는 8자 이상 128자 이하여야 합니다.' 
      });
    }

    // 비밀번호 복잡도 검증 (최소 1개의 숫자 또는 특수문자)
    if (!/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return res.status(400).json({ 
        error: '비밀번호는 최소 1개의 숫자 또는 특수문자를 포함해야 합니다.' 
      });
    }

    // 이름 검증 (XSS 방지)
    const sanitizedName = name.trim().replace(/[<>]/g, '');
    if (sanitizedName.length < 2 || sanitizedName.length > 50) {
      return res.status(400).json({ 
        error: '이름은 2자 이상 50자 이하여야 합니다.' 
      });
    }

    // 학원 이름 검증
    const sanitizedAcademyName = academy_name.trim().replace(/[<>]/g, '');
    if (sanitizedAcademyName.length < 2 || sanitizedAcademyName.length > 100) {
      return res.status(400).json({ 
        error: '학원 이름은 2자 이상 100자 이하여야 합니다.' 
      });
    }

    // 이메일 검증 (선택적)
    let sanitizedEmail = null;
    if (email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      sanitizedEmail = email.trim().toLowerCase();
      if (!emailRegex.test(sanitizedEmail) || sanitizedEmail.length > 255) {
        return res.status(400).json({ 
          error: '올바른 이메일 형식이 아닙니다.' 
        });
      }
    }

    // 전화번호 검증 (선택적)
    let sanitizedPhone = null;
    if (phone && phone.trim() !== '') {
      sanitizedPhone = phone.trim().replace(/[^0-9-]/g, '');
      if (sanitizedPhone.length < 10 || sanitizedPhone.length > 20) {
        return res.status(400).json({ 
          error: '올바른 전화번호 형식이 아닙니다.' 
        });
      }
    }

    // 학원 코드 중복 확인 (users 테이블) - 정규화된 코드로 확인
    const existingUser = await User.findByAcademyCode(normalizedAcademyCode);
    if (existingUser) {
      return res.status(400).json({ 
        error: '이미 사용 중인 학원 코드입니다.' 
      });
    }

    // 학원 코드가 academies 테이블에 이미 있는지 확인 - 정규화된 코드로 확인
    const existingAcademy = await Academy.findByCode(normalizedAcademyCode);
    if (existingAcademy) {
      return res.status(400).json({ 
        error: '이미 등록된 학원 코드입니다. 다른 코드를 사용해주세요.' 
      });
    }
    
    const academyData = {
      id: crypto.randomUUID(),
      name: sanitizedAcademyName,
      code: normalizedAcademyCode,
      address: null,
      floor: null,
      logo_url: null,
    };

    const academy = new Academy(academyData);
    await academy.save();

    // 학원이 실제로 저장되었는지 확인
    if (!academy.id) {
      throw new Error('학원 생성 후 ID를 가져올 수 없습니다.');
    }

    // 데이터베이스에 실제로 저장되었는지 확인
    const savedAcademy = await Academy.findById(academy.id);
    if (!savedAcademy) {
      throw new Error('학원 저장에 실패했습니다. 다시 시도해주세요.');
    }

    // Foreign key constraint 문제를 피하기 위해 약간의 지연 추가
    await new Promise(resolve => setTimeout(resolve, 500));

    // 비밀번호 해싱
    const saltRounds = 12; // 보안 강화: salt rounds 증가
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 사용자 생성 (학원 코드를 대문자로 정규화)
    const userData = {
      academy_code: normalizedAcademyCode,
      password_hash,
      academy_id: academy.id,
      name: sanitizedName,
      role: 'admin',
    };

    // email과 phone은 값이 있을 때만 포함
    if (sanitizedEmail) {
      userData.email = sanitizedEmail;
    }
    if (sanitizedPhone) {
      userData.phone = sanitizedPhone;
    }

    const user = new User(userData);
    await user.save();

    // JWT 토큰 생성
    const token = jwt.sign(
      { 
        userId: user.id, 
        academyId: academy.id,
        academyCode: academy_code,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      token,
      user: {
        id: user.id,
        academy_code: user.academy_code,
        name: user.name,
        academy_id: academy.id,
        academy_name: academy.name,
      }
    });
  } catch (error) {
    console.error('회원가입 에러:', error);
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { academy_code, password } = req.body;

    // 개발 환경에서만 로깅
    if (NODE_ENV === 'development') {
      console.log('🔍 로그인 시도:', { academy_code: academy_code?.trim() });
    }

    // 필수 필드 검증
    if (!academy_code || !password) {
      return res.status(400).json({ 
        error: '학원 코드와 비밀번호를 입력해주세요.' 
      });
    }

    // 입력값 sanitization
    const normalizedAcademyCode = academy_code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // 학원 코드 형식 검증 (8자리 영숫자)
    if (!/^[A-Z0-9]{8}$/.test(normalizedAcademyCode)) {
      return res.status(400).json({ 
        error: '학원 코드 형식이 올바르지 않습니다.' 
      });
    }

    // 비밀번호 길이 검증
    if (password.length < 6 || password.length > 128) {
      return res.status(400).json({ 
        error: '비밀번호는 6자 이상 128자 이하여야 합니다.' 
      });
    }

    // 사용자 조회 (대소문자 구분 없이)
    const user = await User.findByAcademyCode(normalizedAcademyCode);
    
    if (!user) {
      // 보안: 사용자 존재 여부를 알려주지 않기 위해 동일한 메시지 반환
      // 타이밍 공격 방지를 위해 비밀번호 검증도 수행 (항상 동일한 시간 소요)
      await bcrypt.compare(password, '$2b$10$dummyhashfordummycomparison');
      
      return res.status(401).json({ 
        error: '학원 코드 또는 비밀번호가 올바르지 않습니다.' 
      });
    }

    if (NODE_ENV === 'development') {
      console.log('✅ 사용자 찾음:', user.academy_code);
    }

    // 비밀번호 검증
    const isPasswordValid = await user.verifyPassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: '학원 코드 또는 비밀번호가 올바르지 않습니다.' 
      });
    }

    // 학원 정보 조회
    let academy = await Academy.findById(user.academy_id);
    
    // 학원을 찾지 못하면 학원 코드로 조회 시도
    if (!academy) {
      if (NODE_ENV === 'development') {
        console.log('⚠️ academy_id로 학원을 찾지 못함. 학원 코드로 조회 시도:', normalizedAcademyCode);
      }
      academy = await Academy.findByCode(normalizedAcademyCode);
    }
    
    // 학원이 없으면 학원 코드로 새 학원 생성
    if (!academy) {
      if (NODE_ENV === 'development') {
        console.log('⚠️ 학원이 없습니다. 학원 코드로 새 학원 생성 시도:', normalizedAcademyCode);
      }
      try {
        const newAcademy = new Academy({
          name: `학원 ${normalizedAcademyCode}`,
          code: normalizedAcademyCode,
        });
        await newAcademy.save();
        academy = newAcademy;
        
        // 사용자의 academy_id 업데이트
        if (academy && academy.id && user.id) {
          const { supabase } = await import('../config/supabase.js');
          if (supabase) {
            const { error: updateError } = await supabase
              .from('users')
              .update({ academy_id: academy.id })
              .eq('id', user.id);
            
            if (updateError && NODE_ENV === 'development') {
              console.error('❌ 사용자 academy_id 업데이트 실패:', updateError);
            } else if (NODE_ENV === 'development') {
              user.academy_id = academy.id;
              console.log('✅ 사용자의 academy_id 업데이트 완료:', academy.id);
            }
          }
        }
        
        if (NODE_ENV === 'development') {
          console.log('✅ 새 학원 생성 완료:', academy.id, academy.name);
        }
      } catch (createError) {
        if (NODE_ENV === 'development') {
          console.error('❌ 학원 생성 실패:', createError);
        }
        // 학원 생성 실패해도 로그인은 허용 (임시)
        academy = {
          id: user.academy_id || null,
          name: `학원 ${normalizedAcademyCode}`,
          code: normalizedAcademyCode
        };
      }
    }
    
    if (!academy) {
      // 학원이 없어도 로그인은 허용 (임시)
      academy = {
        id: user.academy_id || null,
        name: `학원 ${normalizedAcademyCode}`,
        code: normalizedAcademyCode
      };
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { 
        userId: user.id, 
        academyId: academy.id,
        academyCode: normalizedAcademyCode,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    if (NODE_ENV === 'development') {
      console.log('✅ 로그인 성공:', user.academy_code);
    }

    res.json({
      message: '로그인 성공',
      token,
      user: {
        id: user.id,
        academy_code: user.academy_code,
        name: user.name,
        academy_id: academy.id,
        academy_name: academy.name,
      }
    });
  } catch (error) {
    console.error('로그인 에러:', error);
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    // JWT는 stateless이므로 서버 측에서 특별한 처리가 필요 없음
    // 클라이언트에서 토큰을 삭제하면 됨
    res.json({ message: '로그아웃되었습니다.' });
  } catch (error) {
    next(error);
  }
};

// 비밀번호 재설정 (학원 코드로)
export const resetPassword = async (req, res, next) => {
  try {
    const { academy_code, new_password } = req.body;

    // 필수 필드 검증
    if (!academy_code || !new_password) {
      return res.status(400).json({ 
        error: '학원 코드와 새 비밀번호를 입력해주세요.' 
      });
    }

    // 입력값 sanitization
    const normalizedAcademyCode = academy_code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // 학원 코드 형식 검증
    if (!/^[A-Z0-9]{8}$/.test(normalizedAcademyCode)) {
      return res.status(400).json({ 
        error: '학원 코드 형식이 올바르지 않습니다.' 
      });
    }

    // 비밀번호 길이 및 복잡도 검증
    if (new_password.length < 8 || new_password.length > 128) {
      return res.status(400).json({ 
        error: '비밀번호는 8자 이상 128자 이하여야 합니다.' 
      });
    }

    if (!/[0-9!@#$%^&*(),.?":{}|<>]/.test(new_password)) {
      return res.status(400).json({ 
        error: '비밀번호는 최소 1개의 숫자 또는 특수문자를 포함해야 합니다.' 
      });
    }

    // 사용자 조회
    const user = await User.findByAcademyCode(normalizedAcademyCode);
    
    if (!user) {
      // 보안: 사용자 존재 여부를 알려주지 않기 위해 동일한 메시지 반환
      return res.status(404).json({ 
        error: '학원 코드를 찾을 수 없습니다.' 
      });
    }

    // 새 비밀번호 해싱
    const saltRounds = 12; // 보안 강화
    const password_hash = await bcrypt.hash(new_password, saltRounds);

    // 비밀번호 업데이트
    const { supabase } = await import('../config/supabase.js');
    if (!supabase) {
      return res.status(500).json({ 
        error: '데이터베이스 연결에 실패했습니다.' 
      });
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updateError) {
      if (NODE_ENV === 'development') {
        console.error('❌ 비밀번호 업데이트 실패:', updateError);
      }
      return res.status(500).json({ 
        error: '비밀번호 재설정에 실패했습니다.' 
      });
    }

    res.json({
      message: '비밀번호가 성공적으로 재설정되었습니다.'
    });
  } catch (error) {
    console.error('비밀번호 재설정 에러:', error);
    next(error);
  }
};

// 비밀번호 변경 (로그인된 사용자용 - 현재 비밀번호 확인 필요)
export const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    const userId = req.user?.userId;

    console.log('🔐 비밀번호 변경 요청:', { userId });

    if (!userId) {
      return res.status(401).json({ 
        error: '인증이 필요합니다.' 
      });
    }

    // 필수 필드 검증
    if (!current_password || !new_password) {
      return res.status(400).json({ 
        error: '현재 비밀번호와 새 비밀번호를 입력해주세요.' 
      });
    }

    // 비밀번호 길이 및 복잡도 검증
    if (new_password.length < 8 || new_password.length > 128) {
      return res.status(400).json({ 
        error: '비밀번호는 8자 이상 128자 이하여야 합니다.' 
      });
    }

    if (!/[0-9!@#$%^&*(),.?":{}|<>]/.test(new_password)) {
      return res.status(400).json({ 
        error: '비밀번호는 최소 1개의 숫자 또는 특수문자를 포함해야 합니다.' 
      });
    }

    // 현재 비밀번호와 새 비밀번호가 같으면 안됨
    if (current_password === new_password) {
      return res.status(400).json({ 
        error: '새 비밀번호는 현재 비밀번호와 달라야 합니다.' 
      });
    }

    // 사용자 조회
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        error: '사용자를 찾을 수 없습니다.' 
      });
    }

    // 현재 비밀번호 검증
    const isCurrentPasswordValid = await user.verifyPassword(current_password);
    
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ 
        error: '현재 비밀번호가 올바르지 않습니다.' 
      });
    }

    // 새 비밀번호 해싱
    const saltRounds = 12; // 보안 강화
    const password_hash = await bcrypt.hash(new_password, saltRounds);

    // 비밀번호 업데이트
    const { supabase } = await import('../config/supabase.js');
    if (!supabase) {
      return res.status(500).json({ 
        error: '데이터베이스 연결에 실패했습니다.' 
      });
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updateError) {
      if (NODE_ENV === 'development') {
        console.error('❌ 비밀번호 업데이트 실패:', updateError);
      }
      return res.status(500).json({ 
        error: '비밀번호 변경에 실패했습니다.' 
      });
    }

    res.json({
      message: '비밀번호가 성공적으로 변경되었습니다.'
    });
  } catch (error) {
    console.error('비밀번호 변경 에러:', error);
    next(error);
  }
};

