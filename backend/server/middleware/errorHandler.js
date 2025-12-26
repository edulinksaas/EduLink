export const errorHandler = (err, req, res, next) => {
  const NODE_ENV = process.env.NODE_ENV || 'development';
  
  // 개발 환경에서만 상세한 에러 로깅
  if (NODE_ENV === 'development') {
    console.error('에러 발생:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip
    });
  } else {
    // 프로덕션에서는 간단한 로깅만
    console.error('에러 발생:', {
      message: err.message,
      url: req.url,
      method: req.method,
      ip: req.ip
    });
  }
  
  const statusCode = err.statusCode || 500;
  
  // 프로덕션에서는 민감한 정보를 숨김
  let message = err.message || 'Internal Server Error';
  
  // 데이터베이스 에러 등 민감한 정보 숨기기
  if (NODE_ENV === 'production' && statusCode === 500) {
    message = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }
  
  // CORS 에러는 특별 처리
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      error: {
        message: 'CORS 정책에 의해 요청이 차단되었습니다.'
      }
    });
  }
  
  res.status(statusCode).json({
    error: {
      message
      // 개발 환경에서만 스택 트레이스 제공
      ...(NODE_ENV === 'development' && { 
        stack: err.stack,
        details: err.details 
      })
    }
  });
};

