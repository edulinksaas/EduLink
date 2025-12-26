import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '인증이 필요합니다. 로그인해주세요.' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: '인증 토큰이 없습니다.' });
    }
    
    // JWT 토큰 검증
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded; // { userId, academyId, academyCode, role }
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ error: '토큰이 만료되었습니다. 다시 로그인해주세요.' });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
      } else {
        return res.status(401).json({ error: '토큰 검증 실패' });
      }
    }
  } catch (error) {
    console.error('인증 미들웨어 에러:', error);
    res.status(401).json({ error: '인증 처리 중 오류가 발생했습니다.' });
  }
};

