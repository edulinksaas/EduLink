import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Login.css';

const Login = () => {
  const [academyCode, setAcademyCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverStatus, setServerStatus] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  // 서버 연결 상태 확인
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
        const healthURL = baseURL.replace('/api', '/health');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(healthURL, { 
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          if (data.supabase === 'disconnected') {
            setServerStatus('supabase-error');
            setError(`⚠️ 서버는 실행 중이지만 Supabase 연결이 안 되어 있습니다.\n\n${data.supabaseError || 'Supabase 설정을 확인해주세요.'}\n\nserver/.env 파일에 SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 설정해주세요.`);
          } else {
            setServerStatus('connected');
          }
        } else {
          setServerStatus('error');
        }
      } catch (err) {
        console.warn('서버 연결 확인 실패:', err);
        setServerStatus('disconnected');
      }
    };

    checkServerStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!academyCode || !password) {
      setError('학원 코드와 비밀번호를 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
      console.log('📝 로그인 폼 제출:', { academyCode: academyCode.trim() });
      const result = await login(academyCode.trim(), password);
      
      if (result.success) {
        console.log('✅ 로그인 성공, 대시보드로 이동');
        navigate('/');
      } else {
        console.error('❌ 로그인 실패:', result.error);
        setError(result.error || '로그인에 실패했습니다.');
      }
    } catch (err) {
      console.error('❌ 로그인 처리 중 예외 발생:', err);
      setError('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">🎓</div>
          <h1>학원 관리 시스템</h1>
          <p>안전하게 로그인하여 학원을 관리하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {serverStatus === 'disconnected' && (
            <div className="error-message server-warning">
              <span className="error-icon">🔴</span>
              <div>
                <strong>백엔드 서버에 연결할 수 없습니다.</strong>
                <br />
                터미널에서 다음 명령어로 서버를 실행해주세요:
                <br />
                <code>cd saas/server && npm run dev</code>
                <br /><br />
                서버 실행 후에도 문제가 계속되면:
                <br />
                1. <code>server/.env</code> 파일에 Supabase 설정이 있는지 확인
                <br />
                2. 브라우저에서 <code>http://localhost:3000/health</code> 접속 확인
              </div>
            </div>
          )}
          
          {serverStatus === 'supabase-error' && (
            <div className="error-message server-warning">
              <span className="error-icon">⚠️</span>
              <div style={{ whiteSpace: 'pre-line' }}>
                {error}
              </div>
            </div>
          )}
          
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <div style={{ whiteSpace: 'pre-line' }}>{error}</div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="academyCode">학원 코드</label>
            <div className="input-wrapper">
              <span className="input-icon">🏫</span>
              <input
                type="text"
                id="academyCode"
                value={academyCode}
                onChange={(e) => setAcademyCode(e.target.value)}
                placeholder="학원 코드를 입력하세요"
                required
                autoFocus
                disabled={loading}
                className={error && !academyCode ? 'input-error' : ''}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                disabled={loading}
                className={error && !password ? 'input-error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                tabIndex={-1}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                로그인 중...
              </>
            ) : (
              '로그인'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            <Link to="/reset-password" className="auth-link">비밀번호를 잊으셨나요?</Link>
          </p>
          <p style={{ marginTop: '12px' }}>
            계정이 없으신가요?{' '}
            <Link to="/register" className="auth-link">회원가입</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

