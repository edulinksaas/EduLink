import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Academy } from '../models/Academy.js';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

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

    // 디버깅: 받은 데이터 확인
    console.log('📝 회원가입 요청 데이터:', {
      academy_code,
      academy_name,
      name,
      email,
      phone: phone ? '***' : null
    });

    // 필수 필드 검증
    if (!academy_code || !password || !academy_name || !name) {
      return res.status(400).json({ 
        error: '학원 코드, 비밀번호, 학원 이름, 관리자 이름은 필수입니다.' 
      });
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      return res.status(400).json({ 
        error: '비밀번호는 최소 6자 이상이어야 합니다.' 
      });
    }

    // 학원 코드 정규화 (대소문자 구분 없이)
    const normalizedAcademyCode = academy_code.trim().toUpperCase();
    
    console.log('📝 회원가입 요청 - 원본 학원 코드:', academy_code);
    console.log('📝 회원가입 요청 - 정규화된 학원 코드:', normalizedAcademyCode);

    // 학원 코드 중복 확인 (users 테이블) - 정규화된 코드로 확인
    const existingUser = await User.findByAcademyCode(normalizedAcademyCode);
    if (existingUser) {
      console.log('❌ 이미 사용 중인 학원 코드:', normalizedAcademyCode);
      return res.status(400).json({ 
        error: '이미 사용 중인 학원 코드입니다.' 
      });
    }

    // 학원 코드가 academies 테이블에 이미 있는지 확인 - 정규화된 코드로 확인
    const existingAcademy = await Academy.findByCode(normalizedAcademyCode);
    if (existingAcademy) {
      console.log('❌ 이미 등록된 학원 코드:', normalizedAcademyCode);
      return res.status(400).json({ 
        error: '이미 등록된 학원 코드입니다. 다른 코드를 사용해주세요.' 
      });
    }
    
    const academyData = {
      id: crypto.randomUUID(),
      name: academy_name.trim(),
      code: normalizedAcademyCode,
      address: null,
      floor: null,
      logo_url: null,
    };

    // 디버깅: 저장할 학원 데이터 확인
    console.log('📝 저장할 학원 데이터:', {
      name: academyData.name,
      code: academyData.code,
      '관리자 이름 (name 파라미터)': name.trim()
    });

    const academy = new Academy(academyData);
    await academy.save();

    console.log('✅ 학원 생성 완료:', academy.id, academy.name);
    console.log('✅ 저장된 학원명 확인:', academy.name, '(관리자 이름:', name.trim(), ')');

    // 학원이 실제로 저장되었는지 확인
    if (!academy.id) {
      throw new Error('학원 생성 후 ID를 가져올 수 없습니다.');
    }

    // 데이터베이스에 실제로 저장되었는지 확인
    const savedAcademy = await Academy.findById(academy.id);
    if (!savedAcademy) {
      console.error('❌ 학원이 데이터베이스에 저장되지 않았습니다!');
      throw new Error('학원 저장에 실패했습니다. 다시 시도해주세요.');
    }
    console.log('✅ 데이터베이스 저장 확인 완료:', savedAcademy.id, savedAcademy.name);

    // Foreign key constraint 문제를 피하기 위해 약간의 지연 추가
    await new Promise(resolve => setTimeout(resolve, 500));

    // 비밀번호 해싱
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 사용자 생성 (학원 코드를 대문자로 정규화)
    const userData = {
      academy_code: normalizedAcademyCode,
      password_hash,
      academy_id: academy.id,
      name: name.trim(),
      role: 'admin',
    };

    // email과 phone은 값이 있을 때만 포함 (null이면 아예 제외)
    if (email && email.trim() !== '') {
      userData.email = email.trim();
    }
    if (phone && phone.trim() !== '') {
      userData.phone = phone.trim();
    }

    const user = new User(userData);
    await user.save();

    console.log('✅ 사용자 생성 완료:', user.id, user.academy_code);

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

    console.log('🔍 로그인 시도:', { academy_code: academy_code?.trim() });

    // 필수 필드 검증
    if (!academy_code || !password) {
      return res.status(400).json({ 
        error: '학원 코드와 비밀번호를 입력해주세요.' 
      });
    }

    // 학원 코드 정규화 (대소문자 구분 없이)
    const normalizedAcademyCode = academy_code.trim().toUpperCase();

    // 사용자 조회 (대소문자 구분 없이)
    const user = await User.findByAcademyCode(normalizedAcademyCode);
    
    if (!user) {
      console.log('❌ 사용자를 찾을 수 없습니다. 입력한 학원 코드:', normalizedAcademyCode);
      // 모든 사용자 조회하여 디버깅
      const { supabase } = await import('../config/supabase.js');
      if (supabase) {
        const { data: allUsers } = await supabase
          .from('users')
          .select('academy_code');
        console.log('📋 데이터베이스에 있는 모든 학원 코드:', allUsers?.map(u => u.academy_code));
      }
      return res.status(401).json({ 
        error: '학원 코드 또는 비밀번호가 올바르지 않습니다.' 
      });
    }

    console.log('✅ 사용자 찾음:', user.academy_code);
    console.log('🔐 비밀번호 검증 시작...');
    console.log('   입력된 비밀번호 길이:', password?.length || 0);
    console.log('   저장된 해시 존재 여부:', !!user.password_hash);

    // 비밀번호 검증
    const isPasswordValid = await user.verifyPassword(password);
    console.log('🔐 비밀번호 검증 결과:', isPasswordValid ? '✅ 성공' : '❌ 실패');
    
    if (!isPasswordValid) {
      console.log('❌ 비밀번호가 일치하지 않습니다.');
      return res.status(401).json({ 
        error: '학원 코드 또는 비밀번호가 올바르지 않습니다.' 
      });
    }

    // 학원 정보 조회
    console.log('🔍 학원 정보 조회 시도 - academy_id:', user.academy_id);
    let academy = await Academy.findById(user.academy_id);
    
    // 학원을 찾지 못하면 학원 코드로 조회 시도
    if (!academy) {
      console.log('⚠️ academy_id로 학원을 찾지 못함. 학원 코드로 조회 시도:', normalizedAcademyCode);
      academy = await Academy.findByCode(normalizedAcademyCode);
    }
    
    // 학원이 없으면 학원 코드로 새 학원 생성
    if (!academy) {
      console.log('⚠️ 학원이 없습니다. 학원 코드로 새 학원 생성 시도:', normalizedAcademyCode);
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
            
            if (updateError) {
              console.error('❌ 사용자 academy_id 업데이트 실패:', updateError);
            } else {
              user.academy_id = academy.id;
              console.log('✅ 사용자의 academy_id 업데이트 완료:', academy.id);
            }
          }
        }
        
        console.log('✅ 새 학원 생성 완료:', academy.id, academy.name);
      } catch (createError) {
        console.error('❌ 학원 생성 실패:', createError);
        // 학원 생성 실패해도 로그인은 허용 (임시)
        academy = {
          id: user.academy_id || null,
          name: `학원 ${normalizedAcademyCode}`,
          code: normalizedAcademyCode
        };
        console.warn('⚠️ 학원 생성 실패했지만 로그인은 계속 진행합니다.');
      }
    }
    
    if (!academy) {
      console.error('❌ 학원 정보를 찾을 수 없습니다!');
      console.error('   user.academy_id:', user.academy_id);
      console.error('   academy_code:', normalizedAcademyCode);
      // 학원이 없어도 로그인은 허용 (임시)
      academy = {
        id: user.academy_id || null,
        name: `학원 ${normalizedAcademyCode}`,
        code: normalizedAcademyCode
      };
      console.warn('⚠️ 학원 정보가 없지만 로그인은 계속 진행합니다.');
    } else {
      console.log('✅ 학원 정보 찾음:', academy.id, academy.name);
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

    console.log('✅ 로그인 성공:', user.academy_code);

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

    console.log('🔐 비밀번호 재설정 요청:', { academy_code: academy_code?.trim() });

    // 필수 필드 검증
    if (!academy_code || !new_password) {
      return res.status(400).json({ 
        error: '학원 코드와 새 비밀번호를 입력해주세요.' 
      });
    }

    // 비밀번호 길이 검증
    if (new_password.length < 6) {
      return res.status(400).json({ 
        error: '비밀번호는 최소 6자 이상이어야 합니다.' 
      });
    }

    // 학원 코드 정규화
    const normalizedAcademyCode = academy_code.trim().toUpperCase();

    // 사용자 조회
    const user = await User.findByAcademyCode(normalizedAcademyCode);
    
    if (!user) {
      console.log('❌ 사용자를 찾을 수 없습니다:', normalizedAcademyCode);
      return res.status(404).json({ 
        error: '학원 코드를 찾을 수 없습니다.' 
      });
    }

    console.log('✅ 사용자 찾음:', user.academy_code);

    // 새 비밀번호 해싱
    const saltRounds = 10;
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
      console.error('❌ 비밀번호 업데이트 실패:', updateError);
      return res.status(500).json({ 
        error: '비밀번호 재설정에 실패했습니다.' 
      });
    }

    console.log('✅ 비밀번호 재설정 성공:', user.academy_code);

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

    // 비밀번호 길이 검증
    if (new_password.length < 6) {
      return res.status(400).json({ 
        error: '비밀번호는 최소 6자 이상이어야 합니다.' 
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
      console.log('❌ 현재 비밀번호가 일치하지 않습니다.');
      return res.status(401).json({ 
        error: '현재 비밀번호가 올바르지 않습니다.' 
      });
    }

    // 새 비밀번호 해싱
    const saltRounds = 10;
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
      console.error('❌ 비밀번호 업데이트 실패:', updateError);
      return res.status(500).json({ 
        error: '비밀번호 변경에 실패했습니다.' 
      });
    }

    console.log('✅ 비밀번호 변경 성공:', user.academy_code);

    res.json({
      message: '비밀번호가 성공적으로 변경되었습니다.'
    });
  } catch (error) {
    console.error('비밀번호 변경 에러:', error);
    next(error);
  }
};

