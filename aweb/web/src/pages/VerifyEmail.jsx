import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../config/supabase';
import api from '../services/api';
import './Login.css';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('verifying'); // verifying, success, error, expired
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [academyName, setAcademyName] = useState('');
  const [academyCode, setAcademyCode] = useState('');

  useEffect(() => {
    // Supabase Auth 이메일 인증 처리 (URL hash fragment)
    if (supabase) {
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Supabase Auth로 이메일 인증 완료
          try {
            // 백엔드에 이메일 인증 완료 알림
            const response = await api.get(`/auth/verify-email?token=${session.access_token}&type=supabase`);
            if (response.data.success) {
              setStatus('success');
              setMessage('이메일 인증이 완료되었습니다! 이제 로그인하실 수 있습니다.');
              setEmail(response.data.email || session.user.email || '');
              setAcademyName(response.data.academy_name || '');
              setAcademyCode(response.data.user?.academy_code || '');
              setTimeout(() => {
                navigate('/login');
              }, 3000);
            }
          } catch (error) {
            console.error('이메일 인증 처리 오류:', error);
            setStatus('error');
            setMessage('이메일 인증 처리 중 오류가 발생했습니다.');
          }
        }
      });

      // 현재 세션 확인
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && session.user.email_confirmed_at) {
          // 이미 인증된 세션이 있는 경우
          setStatus('success');
          setMessage('이미 인증된 이메일입니다. 로그인하실 수 있습니다.');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      });
    }

    // 기존 방식: 커스텀 토큰으로 인증
    if (token) {
      verifyEmail(token);
    } else if (!supabase) {
      setStatus('error');
      setMessage('인증 토큰이 없습니다.');
    }
  }, [token, navigate]);

  const verifyEmail = async (verificationToken) => {
    try {
      setLoading(true);
      const response = await api.get(`/auth/verify-email?token=${verificationToken}`);
      
      if (response.data.success) {
        setStatus('success');
        setMessage('이메일 인증이 완료되었습니다! 이제 로그인하실 수 있습니다.');
        setEmail(response.data.email || '');
        setAcademyName(response.data.academy_name || '');
        setAcademyCode(response.data.user?.academy_code || '');
        
        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      console.error('이메일 인증 오류:', error);
      
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.error || '인증에 실패했습니다.';
        
        if (errorMessage.includes('만료')) {
          setStatus('expired');
          setMessage('인증 링크가 만료되었습니다. 새로운 인증 이메일을 요청해주세요.');
        } else if (errorMessage.includes('이미 인증')) {
          setStatus('success');
          setMessage('이미 인증된 이메일입니다. 로그인하실 수 있습니다.');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(errorMessage);
        }
      } else {
        setStatus('error');
        setMessage('이메일 인증 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setMessage('이메일 주소를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/resend-verification', { email });
      setMessage('인증 이메일이 재발송되었습니다. 이메일을 확인해주세요.');
      setStatus('verifying');
    } catch (error) {
      console.error('이메일 재발송 오류:', error);
      setMessage('이메일 재발송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>학원 관리 시스템</h1>
          <p>이메일 인증</p>
        </div>

        <div className="auth-form">
          {loading && status === 'verifying' && (
            <div className="verifying-message">
              <div className="verifying-content">
                <div className="spinner"></div>
                <div className="verifying-text">
                  <h3>이메일 인증 처리 중</h3>
                  <p>잠시만 기다려주세요...</p>
                </div>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="success-message">
              <div className="success-header">
                <div className="success-icon">✓</div>
                <div className="success-text">
                  <h2>이메일 인증 완료</h2>
                  <p className="success-subtitle">회원가입이 성공적으로 완료되었습니다</p>
                </div>
              </div>
              
              <div className="success-content">
                <div className="success-info-box">
                  <div className="info-item">
                    <span className="info-label">📧 이메일</span>
                    <span className="info-value">{email || '확인됨'}</span>
                  </div>
                  {academyName && (
                    <div className="info-item">
                      <span className="info-label">🏫 학원명</span>
                      <span className="info-value">{academyName}</span>
                    </div>
                  )}
                  {academyCode && (
                    <div className="info-item">
                      <span className="info-label">🔑 학원 코드</span>
                      <span className="info-value academy-code-display">{academyCode}</span>
                    </div>
                  )}
                  <div className="info-item">
                    <span className="info-label">✅ 상태</span>
                    <span className="info-value success-badge">인증 완료</span>
                  </div>
                </div>
                
                <div className="success-message-text">
                  <p>{message}</p>
                  {academyCode && (
                    <div className="academy-code-notice">
                      <strong>💡 안내:</strong> 로그인 시 학원 코드(<strong>{academyCode}</strong>)가 필요합니다.
                    </div>
                  )}
                </div>
                
                <div className="success-actions">
                  <Link to="/login" className="btn-primary btn-success">
                    🚀 로그인하러 가기
                  </Link>
                  <p className="auto-redirect-text">
                    ⏱️ 잠시 후 자동으로 로그인 페이지로 이동합니다...
                  </p>
                </div>
              </div>
            </div>
          )}

          {status === 'expired' && (
            <div className="error-message">
              {/* 섹션 1: 만료 안내 헤더 */}
              <div className="expired-header-section">
                <div className="error-icon">⚠️</div>
                <div className="error-text">
                  <h2>인증 링크 만료</h2>
                  <p className="error-subtitle">인증 링크의 유효기간이 만료되었습니다</p>
                </div>
              </div>
              
              {/* 섹션 2: 만료 설명 메시지 */}
              <div className="expired-message-section">
                <p>{message}</p>
              </div>
              
              {/* 섹션 3: 재발송 섹션 */}
              <div className="resend-section">
                <h3>인증 이메일 재발송</h3>
                <input
                  type="email"
                  placeholder="이메일 주소를 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="email-input"
                />
                <button
                  onClick={handleResendEmail}
                  className="btn-primary btn-resend"
                  disabled={loading}
                >
                  {loading ? '발송 중...' : '인증 이메일 재발송'}
                </button>
              </div>
              
              {/* 섹션 4: 로그인 페이지로 돌아가기 */}
              <div className="error-actions">
                <Link to="/login" className="link-back">
                  로그인 페이지로 돌아가기 →
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="error-message">
              <div className="error-header">
                <div className="error-icon">❌</div>
                <div className="error-text">
                  <h2>인증 실패</h2>
                  <p className="error-subtitle">이메일 인증 처리 중 문제가 발생했습니다</p>
                </div>
              </div>
              
              <div className="error-content">
                <p>{message}</p>
                
                <div className="resend-section">
                  <h3>인증 이메일 재발송</h3>
                  <input
                    type="email"
                    placeholder="이메일 주소를 입력하세요"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="email-input"
                  />
                  <button
                    onClick={handleResendEmail}
                    className="btn-primary btn-resend"
                    disabled={loading}
                  >
                    {loading ? '발송 중...' : '인증 이메일 재발송'}
                  </button>
                </div>
                
                <div className="error-actions">
                  <Link to="/login" className="link-back">
                    로그인 페이지로 돌아가기 →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .verifying-message {
          text-align: left;
          padding: 50px 40px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
        }
        .verifying-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 24px;
        }
        .spinner {
          border: 5px solid #e2e8f0;
          border-top: 5px solid #6366f1;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          animation: spin 1s linear infinite;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }
        .verifying-text {
          width: 100%;
          text-align: center;
        }
        .verifying-text h3 {
          margin: 0 0 10px 0;
          color: #0f172a;
          font-size: 22px;
          font-weight: 700;
        }
        .verifying-text p {
          margin: 0;
          color: #64748b;
          font-size: 15px;
          font-weight: 500;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .success-message {
          text-align: left;
          padding: 50px 40px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
        }
        .success-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 20px;
          margin-bottom: 35px;
          padding-bottom: 30px;
          border-bottom: 3px solid #10b981;
        }
        .success-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 42px;
          font-weight: bold;
          flex-shrink: 0;
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
          animation: successPulse 2s ease-in-out infinite;
        }
        @keyframes successPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .success-text {
          width: 100%;
          text-align: center;
        }
        .success-text h2 {
          margin: 0 0 10px 0;
          color: #0f172a;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .success-subtitle {
          margin: 0;
          color: #64748b;
          font-size: 15px;
          font-weight: 500;
        }
        .success-content {
          text-align: center;
        }
        .success-info-box {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 30px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }
        .info-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .info-item:last-child {
          border-bottom: none;
        }
        .info-label {
          font-weight: 700;
          color: #475569;
          font-size: 15px;
          margin-bottom: 8px;
        }
        .info-value {
          color: #0f172a;
          font-weight: 600;
          font-size: 15px;
        }
        .academy-code-display {
          font-family: 'Courier New', monospace;
          font-size: 18px;
          font-weight: 700;
          color: #6366f1;
          letter-spacing: 2px;
          background: #eef2ff;
          padding: 8px 16px;
          border-radius: 8px;
        }
        .success-badge {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 8px 20px;
          border-radius: 24px;
          font-size: 13px;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }
        .success-message-text {
          margin-bottom: 30px;
          padding: 20px;
          background: #f0fdf4;
          border-left: 4px solid #10b981;
          border-radius: 8px;
          text-align: center;
        }
        .success-message-text p {
          color: #166534;
          font-size: 16px;
          line-height: 1.8;
          margin: 0 0 12px 0;
          font-weight: 500;
        }
        .academy-code-notice {
          margin-top: 12px;
          padding: 12px;
          background: #fff7ed;
          border-left: 4px solid #f59e0b;
          border-radius: 6px;
          font-size: 14px;
          color: #92400e;
          text-align: center;
        }
        .academy-code-notice strong {
          color: #78350f;
        }
        .success-actions {
          text-align: center;
          margin-top: 30px;
        }
        .btn-success {
          display: inline-block;
          padding: 16px 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 16px;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
          border: none;
          cursor: pointer;
        }
        .btn-success:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.5);
          background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
        }
        .auto-redirect-text {
          margin-top: 20px;
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }
        .error-message {
          text-align: left;
          padding: 50px 40px;
          background: linear-gradient(135deg, #ffffff 0%, #fef2f2 100%);
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
          border: 1px solid #fecaca;
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        .expired-header-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 20px;
          padding-bottom: 30px;
          border-bottom: 3px solid #ef4444;
        }
        .error-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 20px;
          margin-bottom: 30px;
          padding-bottom: 30px;
          border-bottom: 3px solid #ef4444;
        }
        .error-icon {
          font-size: 70px;
          filter: drop-shadow(0 4px 8px rgba(239, 68, 68, 0.2));
        }
        .error-text {
          width: 100%;
          text-align: center;
        }
        .error-text h2 {
          margin: 0 0 10px 0;
          color: #991b1b;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .error-subtitle {
          margin: 0;
          color: #7f1d1d;
          font-size: 15px;
          font-weight: 500;
        }
        .expired-message-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
        }
        .expired-message-section p {
          color: #991b1b;
          font-size: 16px;
          line-height: 1.8;
          margin: 0;
          font-weight: 500;
          padding: 16px;
          background: #fef2f2;
          border-left: 4px solid #ef4444;
          border-radius: 8px;
          text-align: center;
          width: 100%;
        }
        .error-content {
          text-align: center;
        }
        .error-content p {
          color: #991b1b;
          font-size: 16px;
          line-height: 1.8;
          margin-bottom: 30px;
          font-weight: 500;
          padding: 16px;
          background: #fef2f2;
          border-left: 4px solid #ef4444;
          border-radius: 8px;
          text-align: center;
        }
        .resend-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          text-align: center;
          width: 100%;
        }
        .resend-section h3 {
          margin: 0 0 18px 0;
          color: #0f172a;
          font-size: 18px;
          font-weight: 700;
          text-align: center;
        }
        .email-input {
          width: 100%;
          padding: 14px 18px;
          margin-bottom: 16px;
          border: 2px solid #cbd5e1;
          border-radius: 10px;
          font-size: 15px;
          transition: all 0.2s;
          background: #ffffff;
        }
        .email-input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
          background: #fafafa;
        }
        .btn-resend {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        .btn-resend:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.5);
          background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
        }
        .btn-resend:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .error-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
        }
        .link-back {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #6366f1;
          text-decoration: none;
          font-weight: 600;
          font-size: 15px;
          transition: all 0.2s;
          padding: 10px 16px;
          border-radius: 8px;
          background: #eef2ff;
        }
        .link-back:hover {
          color: #4f46e5;
          background: #e0e7ff;
        }
      `}</style>
    </div>
  );
};

export default VerifyEmail;

