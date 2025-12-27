import { supabase } from '../config/supabase.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '인증이 필요합니다. 로그인해주세요.' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: '인증 토큰이 없습니다.' });
    }
    
    if (!supabase) {
      return res.status(500).json({ error: '인증 서비스가 초기화되지 않았습니다.' });
    }
    
    // Supabase 세션 토큰 검증
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !authUser) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다. 다시 로그인해주세요.' });
    }
    
    // 사용자 정보를 Supabase users 테이블에서 조회
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, academy_id, academy_code, role, email, name')
      .eq('email', authUser.email)
      .single();
    
    if (userError || !userData) {
      return res.status(401).json({ error: '사용자 정보를 찾을 수 없습니다.' });
    }
    
    // 요청 객체에 사용자 정보 추가
    req.user = {
      userId: userData.id,
      academyId: userData.academy_id,
      academyCode: userData.academy_code,
      role: userData.role,
      email: userData.email,
      name: userData.name,
      supabaseUserId: authUser.id
    };
    
    next();
  } catch (error) {
    console.error('인증 미들웨어 에러:', error);
    res.status(401).json({ error: '인증 처리 중 오류가 발생했습니다.' });
  }
};

