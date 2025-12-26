import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import './ResetPassword.css';

const ResetPassword = () => {
  const [academyCode, setAcademyCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    // 유효성 검증
    if (!academyCode || !newPassword || !confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    try {
      console.log('🔐 비밀번호 재설정 요청:', { academy_code: academyCode.trim() });
      const response = await authService.resetPassword(academyCode.trim(), newPassword);
      
      console.log('✅ 비밀번호 재설정 성공');
      setSuccess(true);
      
      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('❌ 비밀번호 재설정 실패:', err);
      const errorMessage = err.response?.data?.error || err.message || '비밀번호 재설정에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">🔐</div>
          <h1>비밀번호 재설정</h1>
          <p>학원 코드와 새 비밀번호를 입력해주세요</p>
        </div>

        {success ? (
          <div className="success-message">
            <span className="success-icon">✅</span>
            <div>
              <strong>비밀번호가 성공적으로 재설정되었습니다!</strong>
              <br />
              잠시 후 로그인 페이지로 이동합니다...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
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
              <label htmlFor="newPassword">새 비밀번호</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="새 비밀번호를 입력하세요 (최소 6자)"
                  required
                  disabled={loading}
                  minLength={6}
                  className={error && !newPassword ? 'input-error' : ''}
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

            <div className="form-group">
              <label htmlFor="confirmPassword">비밀번호 확인</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                  disabled={loading}
                  className={error && !confirmPassword ? 'input-error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  재설정 중...
                </>
              ) : (
                '비밀번호 재설정'
              )}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            비밀번호를 기억하시나요?{' '}
            <Link to="/login" className="auth-link">로그인</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
