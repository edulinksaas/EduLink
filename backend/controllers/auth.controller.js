import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { Academy } from '../models/Academy.js';
import { verifyRecaptcha } from '../utils/recaptcha.js';
import { sendVerificationEmail } from '../utils/emailService.js';
import { supabase } from '../config/supabase.js';

// JWT 설정
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? null : 'dev-secret-key-change-in-production-please-set-jwt-secret-in-env-file');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// JWT_SECRET 검증
if (!JWT_SECRET || JWT_SECRET === 'your-secret-key-change-in-production') {
  const errorMsg = process.env.NODE_ENV === 'production' 
    ? '❌ JWT_SECRET이 설정되지 않았거나 기본값입니다. 프로덕션 환경에서는 반드시 강력한 시크릿 키를 설정해야 합니다!'
    : '⚠️ JWT_SECRET이 설정되지 않았습니다. .env 파일에 JWT_SECRET을 설정해주세요.\n   개발 환경에서는 임시 키를 사용합니다.';
  
  console.warn(`\n${errorMsg}\n`);
  
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET이 설정되지 않았습니다.');
  }
}

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
    const { password, academy_name, name, email, phone, recaptchaToken } = req.body;

    // CAPTCHA 검증
    const clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const captchaResult = await verifyRecaptcha(recaptchaToken, clientIp);
    
    if (!captchaResult.success) {
      return res.status(400).json({ 
        error: '봇 방지 검증에 실패했습니다. 다시 시도해주세요.' 
      });
    }

    // 필수 필드 검증 (학원 코드는 서버에서 생성하므로 제외)
    if (!password || !academy_name || !name || !email || !phone) {
      return res.status(400).json({ 
        error: '비밀번호, 학원 이름, 관리자 이름, 이메일, 연락처는 필수입니다.' 
      });
    }
    
    // 이메일 형식 검증 (필수)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitizedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({ 
        error: '올바른 이메일 형식이 아닙니다.' 
      });
    }

    // 이메일 중복 체크
    const existingUserByEmail = await User.findByEmail(sanitizedEmail);
    if (existingUserByEmail) {
      return res.status(400).json({ 
        error: '이미 사용 중인 이메일입니다. 다른 이메일을 사용하거나 로그인해주세요.' 
      });
    }
    
    // 전화번호 형식 검증 (필수)
    if (!phone || phone.trim() === '') {
      return res.status(400).json({ 
        error: '연락처는 필수입니다.' 
      });
    }
    // 한국 전화번호 형식: 010-1234-5678 또는 01012345678
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    const cleanedPhone = phone.trim().replace(/[-\s]/g, '');
    if (!phoneRegex.test(cleanedPhone)) {
      return res.status(400).json({ 
        error: '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)' 
      });
    }
    
    // 학원 코드는 서버에서 생성
    let academy_code = generateAcademyCode();
    let normalizedAcademyCode = academy_code;
    
    // 중복되지 않는 코드 생성 (최대 10번 시도)
    let attempts = 0;
    while (attempts < 10) {
      const existingUser = await User.findByAcademyCode(normalizedAcademyCode);
      const existingAcademy = await Academy.findByCode(normalizedAcademyCode);
      
      if (!existingUser && !existingAcademy) {
        break; // 중복되지 않는 코드 찾음
      }
      
      academy_code = generateAcademyCode();
      normalizedAcademyCode = academy_code;
      attempts++;
    }
    
    if (attempts >= 10) {
      return res.status(500).json({ 
        error: '학원 코드 생성에 실패했습니다. 잠시 후 다시 시도해주세요.' 
      });
    }

    // 비밀번호 정책 검증 (최소 8자, 영문자와 숫자 포함)
    if (password.length < 8) {
      return res.status(400).json({ 
        error: '비밀번호는 최소 8자 이상이어야 합니다.' 
      });
    }
    
    // 비밀번호 복잡도 검증: 영문자(대소문자 구분 없음)와 숫자 포함
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!hasLetter || !hasNumber) {
      return res.status(400).json({ 
        error: '비밀번호는 영문자와 숫자를 포함해야 합니다.' 
      });
    }

    // 로그에서 민감한 정보 제거
    
    const academyData = {
      id: crypto.randomUUID(),
      name: academy_name.trim(),
      code: normalizedAcademyCode,
      address: null,
      floor: null,
      logo_url: null,
    };

    const academy = new Academy(academyData);
    await academy.save();

    // 학원이 실제로 저장되었는지 확인
    if (!academy.id) {
      return res.status(500).json({ 
        error: '회원가입 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
      });
    }
    await new Promise(resolve => setTimeout(resolve, 500));

    // Supabase Auth로 회원가입 (이메일 인증 자동 발송)
    let supabaseUserId = null;
    let emailVerified = false;
    
    if (supabase) {
      try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        
        // Supabase Auth Admin API로 사용자 생성 및 이메일 발송
        // 참고: createUser는 이메일을 자동 발송하지 않으므로,
        // 사용자 생성 후 이메일 인증 링크를 생성하고 수동으로 발송하거나
        // 프론트엔드에서 signUp을 먼저 호출하는 것이 좋습니다.
        
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: sanitizedEmail,
          password: password,
          email_confirm: false, // 이메일 인증 필요
          user_metadata: {
            academy_name: academy_name.trim(),
            name: name.trim(),
            phone: phone.trim(),
            academy_code: normalizedAcademyCode,
          }
        });

        if (authError) {
          console.error('Supabase Auth 회원가입 실패:', authError);
          console.log('⚠️ Supabase Auth 사용자 생성 실패, 기존 방식으로 진행합니다.');
          // Supabase Auth 실패 시 기존 방식으로 폴백
        } else if (authData.user) {
          supabaseUserId = authData.user.id;
          emailVerified = authData.user.email_confirmed_at !== null;
          console.log('✅ Supabase Auth 사용자 생성 성공 (이메일 발송은 기존 SMTP 서비스 사용)');
        }
      } catch (supabaseError) {
        console.error('Supabase Auth 오류:', supabaseError);
        // Supabase Auth 실패 시 기존 방식으로 폴백
      }
    }

    // 비밀번호 해싱 (백엔드 users 테이블용)
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 이메일 인증 토큰 생성 (Supabase Auth 사용 시에도 백업용)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date();
    verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24); // 24시간 후 만료

    // 사용자 생성 (학원 코드를 대문자로 정규화)
    const userData = {
      academy_code: normalizedAcademyCode,
      password_hash,
      academy_id: academy.id,
      name: name.trim(),
      email: sanitizedEmail,
      phone: phone.trim(),
      email_verified: emailVerified, // Supabase Auth에서 확인된 경우 true
      verification_token: verificationToken,
      verification_token_expires_at: verificationTokenExpires.toISOString(),
      role: 'admin',
      supabase_user_id: supabaseUserId, // Supabase Auth 사용자 ID 저장
    };

    const user = new User(userData);
    await user.save();
    
    // 이메일 발송을 비동기로 처리 (응답을 기다리지 않음)
    // 백그라운드에서 이메일 발송을 시도하되, 실패해도 회원가입은 성공으로 처리
    console.log('\n📧 이메일 발송을 백그라운드에서 시작...');
    console.log(`   수신자: ${sanitizedEmail}`);
    console.log(`   학원명: ${academy_name}`);
    
    // 비동기로 이메일 발송 (await 없이 Promise로 처리)
    sendVerificationEmail(
      sanitizedEmail,
      verificationToken,
      academy_name,
      normalizedAcademyCode
    ).then((emailSent) => {
      if (emailSent) {
        console.log('✅ 이메일 발송 완료');
      } else {
        console.warn('⚠️ 이메일 발송 실패했지만 사용자는 생성되었습니다.');
      }
    }).catch((emailError) => {
      console.error('\n❌ 이메일 발송 중 예외 발생 (백그라운드):');
      console.error('   에러:', emailError.message);
      console.error('   스택:', emailError.stack);
      // 이메일 발송 실패해도 회원가입은 성공으로 처리
    });
    
    // 개발 환경에서 인증 링크를 콘솔에 명확히 출력
    if (process.env.NODE_ENV !== 'production') {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
      console.log('\n' + '='.repeat(70));
      console.log('📧 이메일 인증 링크 (기존 SMTP 서비스 사용)');
      console.log('='.repeat(70));
      console.log(`수신자: ${sanitizedEmail}`);
      console.log(`학원명: ${academy_name}`);
      console.log(`인증 링크: ${verificationLink}`);
      console.log(`토큰: ${verificationToken}`);
      if (supabaseUserId) {
        console.log(`Supabase Auth 사용자 ID: ${supabaseUserId}`);
      }
      console.log('='.repeat(70) + '\n');
    }

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
      success: true,
      message: supabaseUserId 
        ? '회원가입이 완료되었습니다. 이메일 인증 링크가 발송되었습니다.' 
        : '회원가입이 완료되었습니다. 이메일 인증을 완료해주세요.',
      requiresEmailVerification: !emailVerified,
      verificationToken: process.env.NODE_ENV === 'development' ? verificationToken : undefined, // 개발 환경에서만 반환
      token: token, // JWT 토큰 (이메일 인증 전에도 발급하되, 로그인 시 검증)
      academy_code: normalizedAcademyCode, // 생성된 학원 코드 반환
      user: {
        id: user.id,
        academy_code: user.academy_code,
        name: user.name,
        academy_id: academy.id,
        academy_name: academy.name,
        email: user.email,
        email_verified: emailVerified,
        role: user.role,
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
      // 구체적인 정보 노출 최소화: 존재 여부를 알려주지 않음
      return res.status(401).json({ 
        error: '학원 코드 또는 비밀번호가 올바르지 않습니다.' 
      });
    }

    // 비밀번호 검증
    const isPasswordValid = await user.verifyPassword(password);
    
    if (!isPasswordValid) {
      // 구체적인 정보 노출 최소화: 어떤 필드가 잘못되었는지 알려주지 않음
      return res.status(401).json({ 
        error: '학원 코드 또는 비밀번호가 올바르지 않습니다.' 
      });
    }
    
    // 이메일 인증 확인
    if (!user.email_verified) {
      return res.status(403).json({ 
        error: '이메일 인증이 필요합니다. 이메일을 확인해주세요.',
        requiresEmailVerification: true,
        email: user.email
      });
    }

    // 학원 정보 조회
    let academy = await Academy.findById(user.academy_id);
    
    // 학원을 찾지 못하면 학원 코드로 조회 시도
    if (!academy) {
      academy = await Academy.findByCode(normalizedAcademyCode);
    }
    
    // 학원이 없으면 학원 코드로 새 학원 생성
    if (!academy) {
      try {
        const newAcademy = new Academy({
          name: user.name || `학원 ${normalizedAcademyCode}`,
          code: normalizedAcademyCode,
        });
        await newAcademy.save();
        academy = newAcademy;
        
        // 사용자의 academy_id 업데이트
        if (academy && academy.id && user.id) {
          const { supabase } = await import('../config/supabase.js');
          if (supabase) {
            await supabase
              .from('users')
              .update({ academy_id: academy.id })
              .eq('id', user.id);
            user.academy_id = academy.id;
          }
        }
      } catch (createError) {
        // 학원 생성 실패해도 로그인은 허용 (임시)
        academy = {
          id: user.academy_id || null,
          name: user.name || '학원',
          code: normalizedAcademyCode
        };
      }
    }
    
    if (!academy) {
      // 학원이 없어도 로그인은 허용 (임시)
      academy = {
        id: user.academy_id || null,
        name: user.name || '학원',
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

    // 비밀번호 정책 검증 (최소 8자, 영문자와 숫자 포함)
    if (new_password.length < 8) {
      return res.status(400).json({ 
        error: '비밀번호는 최소 8자 이상이어야 합니다.' 
      });
    }
    
    // 비밀번호 복잡도 검증: 영문자(대소문자 구분 없음)와 숫자 포함
    const hasLetter = /[a-zA-Z]/.test(new_password);
    const hasNumber = /[0-9]/.test(new_password);
    
    if (!hasLetter || !hasNumber) {
      return res.status(400).json({ 
        error: '비밀번호는 영문자와 숫자를 포함해야 합니다.' 
      });
    }

    // 학원 코드 정규화
    const normalizedAcademyCode = academy_code.trim().toUpperCase();

    // 사용자 조회
    const user = await User.findByAcademyCode(normalizedAcademyCode);
    
    if (!user) {
      // 구체적인 정보 노출 최소화: 존재 여부를 알려주지 않음
      return res.status(404).json({ 
        error: '요청을 처리할 수 없습니다.' 
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
// 이메일 인증 확인
export const verifyEmail = async (req, res, next) => {
  try {
    const { token, type } = req.query;

    if (!token) {
      return res.status(400).json({ 
        error: '인증 토큰이 필요합니다.' 
      });
    }

    if (!supabase) {
      return res.status(500).json({ 
        error: '데이터베이스 연결에 실패했습니다.' 
      });
    }

    // Supabase Auth 이메일 인증 토큰인 경우
    if (type === 'supabase' || token.length > 64) {
      // Supabase Auth의 verifyOtp를 사용하여 이메일 인증 확인
      // 주의: 이는 프론트엔드에서 처리하는 것이 더 적합하지만, 백엔드에서도 처리 가능
      try {
        // Supabase Auth의 이메일 인증은 보통 URL hash fragment로 처리되므로
        // 여기서는 사용자 이메일을 확인하여 인증 상태 업데이트
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
        
        if (!authError && authUser && authUser.email_confirmed_at) {
          // Supabase Auth에서 이메일이 인증된 경우, users 테이블 업데이트
          const { data: userData, error: findError } = await supabase
            .from('users')
            .select('*')
            .eq('email', authUser.email)
            .single();

          if (!findError && userData) {
            const { error: updateError } = await supabase
              .from('users')
              .update({ 
                email_verified: true,
                verification_token: null,
                verification_token_expires_at: null,
                updated_at: new Date().toISOString()
              })
              .eq('id', userData.id);

            if (!updateError) {
              const academy = await Academy.findById(userData.academy_id);
              return res.json({
                success: true,
                message: '이메일 인증이 완료되었습니다.',
                email: userData.email,
                academy_name: academy ? academy.name : null,
                user: {
                  id: userData.id,
                  email_verified: true,
                  academy_code: userData.academy_code,
                  academy_id: userData.academy_id
                }
              });
            }
          }
        }
      } catch (supabaseError) {
        console.error('Supabase Auth 인증 처리 오류:', supabaseError);
        // Supabase Auth 실패 시 기존 방식으로 폴백
      }
    }

    // 기존 방식: 커스텀 토큰으로 사용자 찾기
    const { data: users, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('verification_token', token)
      .single();

    if (findError || !users) {
      return res.status(400).json({ 
        error: '유효하지 않거나 만료된 인증 토큰입니다.' 
      });
    }

    const user = new User(users);

    // 토큰 만료 확인
    if (user.verification_token_expires_at) {
      const expiresAt = new Date(user.verification_token_expires_at);
      if (expiresAt < new Date()) {
        return res.status(400).json({ 
          error: '인증 토큰이 만료되었습니다. 다시 요청해주세요.' 
        });
      }
    }

    // 이미 인증된 경우
    if (user.email_verified) {
      return res.status(400).json({ 
        error: '이미 인증된 이메일입니다.' 
      });
    }

    // 이메일 인증 완료 처리
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        email_verified: true,
        verification_token: null,
        verification_token_expires_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('이메일 인증 업데이트 실패:', updateError);
      return res.status(500).json({ 
        error: '이메일 인증 처리 중 오류가 발생했습니다.' 
      });
    }

    // 학원 정보 조회
    const academy = await Academy.findById(user.academy_id);

    res.json({
      success: true,
      message: '이메일 인증이 완료되었습니다.',
      email: user.email,
      academy_name: academy ? academy.name : null,
      user: {
        id: user.id,
        email_verified: true,
        academy_code: user.academy_code,
        academy_id: user.academy_id
      }
    });
  } catch (error) {
    console.error('이메일 인증 에러:', error);
    next(error);
  }
};

// 이메일 인증 재발송
export const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: '이메일 주소를 입력해주세요.' 
      });
    }

    // 이메일로 사용자 찾기
    const { supabase } = await import('../config/supabase.js');
    if (!supabase) {
      return res.status(500).json({ 
        error: '데이터베이스 연결에 실패했습니다.' 
      });
    }

    const { data: users, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.trim())
      .single();

    if (findError || !users) {
      // 보안을 위해 존재 여부를 알려주지 않음
      return res.json({
        message: '이메일이 등록되어 있다면 인증 링크가 전송되었습니다.'
      });
    }

    const user = new User(users);

    // 이미 인증된 경우
    if (user.email_verified) {
      return res.status(400).json({ 
        error: '이미 인증된 이메일입니다.' 
      });
    }

    // 새 인증 토큰 생성
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date();
    verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);

    // 토큰 업데이트
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        verification_token: verificationToken,
        verification_token_expires_at: verificationTokenExpires.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('인증 토큰 업데이트 실패:', updateError);
      return res.status(500).json({ 
        error: '인증 이메일 재발송 중 오류가 발생했습니다.' 
      });
    }

    // 학원 정보 조회 (이메일 제목에 사용)
    const { Academy } = await import('../models/Academy.js');
    const academy = await Academy.findById(user.academy_id);
    const academyName = academy ? academy.name : '학원';

    // 이메일 인증 이메일 재발송
    try {
      const emailSent = await sendVerificationEmail(
        user.email,
        verificationToken,
        academyName
      );
      
      if (!emailSent && process.env.NODE_ENV === 'production') {
        console.warn('⚠️ 이메일 재발송 실패');
      }
    } catch (emailError) {
      console.error('이메일 재발송 중 오류:', emailError);
      // 이메일 발송 실패해도 성공으로 처리 (보안상)
    }

    res.json({
      message: '이메일이 등록되어 있다면 인증 링크가 전송되었습니다.',
      verificationToken: process.env.NODE_ENV === 'development' ? verificationToken : undefined // 개발 환경에서만 반환
    });
  } catch (error) {
    console.error('이메일 재발송 에러:', error);
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    const userId = req.user?.userId;

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

    // 비밀번호 정책 검증 (최소 8자, 복잡도 요구)
    if (new_password.length < 8) {
      return res.status(400).json({ 
        error: '비밀번호는 최소 8자 이상이어야 합니다.' 
      });
    }
    
    // 비밀번호 복잡도 검증: 영문자(대소문자 구분 없음)와 숫자 포함
    const hasLetter = /[a-zA-Z]/.test(new_password);
    const hasNumber = /[0-9]/.test(new_password);
    
    if (!hasLetter || !hasNumber) {
      return res.status(400).json({ 
        error: '비밀번호는 영문자와 숫자를 포함해야 합니다.' 
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
      // 구체적인 정보 노출 최소화
      return res.status(401).json({ 
        error: '인증에 실패했습니다.' 
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


    res.json({
      message: '비밀번호가 성공적으로 변경되었습니다.'
    });
  } catch (error) {
    console.error('비밀번호 변경 에러:', error);
    next(error);
  }
};

