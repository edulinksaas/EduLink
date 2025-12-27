import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { executeRecaptcha, loadRecaptcha } from '../utils/recaptcha';
import './Register.css';

// 학원 코드는 서버에서 생성되므로 클라이언트에서 생성하지 않음

const Register = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    academy_name: '',
    name: '',
    email: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedAcademyCode, setGeneratedAcademyCode] = useState(null);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // reCAPTCHA 로드
  useEffect(() => {
    loadRecaptcha()
      .then(() => {
        setRecaptchaLoaded(true);
      })
      .catch((err) => {
        console.warn('reCAPTCHA 로드 실패:', err);
        // 개발 환경에서는 계속 진행
        if (import.meta.env.DEV) {
          setRecaptchaLoaded(true);
        }
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 유효성 검증
    if (!formData.password || !formData.academy_name || !formData.name) {
      setError('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (formData.password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }
    
    // 비밀번호 복잡도 검증
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);
    const complexityCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;
    
    if (complexityCount < 3) {
      setError('비밀번호는 대문자, 소문자, 숫자, 특수문자 중 최소 3가지를 포함해야 합니다.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      // reCAPTCHA 토큰 생성
      const recaptchaToken = await executeRecaptcha('register');
      
      const registerData = {
        password: formData.password,
        academy_name: formData.academy_name.trim(),
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        recaptchaToken: recaptchaToken,
      };

      const result = await register(registerData);
      
      if (result && result.success) {
        // 서버에서 생성된 학원 코드 저장
        if (result.academy_code) {
          setGeneratedAcademyCode(result.academy_code);
        }
        setLoading(false);
      } else {
        // 에러 메시지가 객체인 경우 문자열로 변환
        let errorMsg = '회원가입에 실패했습니다.';
        if (result?.error) {
          if (typeof result.error === 'string') {
            errorMsg = result.error;
          } else if (result.error?.message) {
            errorMsg = result.error.message;
          } else {
            errorMsg = JSON.stringify(result.error);
          }
        }
        console.error('회원가입 실패:', errorMsg);
        setError(errorMsg);
        setLoading(false);
      }
    } catch (err) {
      console.error('회원가입 중 예외 발생:', err);
      const errorMsg = err.message || '회원가입 중 오류가 발생했습니다.';
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container register-container">
        <div className="auth-header">
          <h1>학원 관리 시스템</h1>
          <p>회원가입</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          {generatedAcademyCode && (
            <div className="form-group">
              <label>생성된 학원 코드</label>
              <div className="academy-code-display">
                <input
                  type="text"
                  value={generatedAcademyCode}
                  readOnly
                  disabled
                  style={{ textTransform: 'uppercase', fontWeight: 'bold' }}
                />
              </div>
              <small className="form-hint">
                회원가입이 완료되었습니다. 이 학원 코드를 안전하게 보관하세요.
              </small>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">
              비밀번호 <span className="required">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력하세요 (최소 8자, 복잡도 요구)"
              required
              disabled={loading}
            />
            <small className="form-hint">
              최소 8자 이상, 대문자/소문자/숫자/특수문자 중 3가지 이상 포함
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              비밀번호 확인 <span className="required">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="비밀번호를 다시 입력하세요"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="academy_name">
              관리자 이름 <span className="required">*</span>
            </label>
            <input
              type="text"
              id="academy_name"
              name="academy_name"
              value={formData.academy_name}
              onChange={handleChange}
              placeholder="관리자 이름을 입력하세요"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              이메일 <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="이메일을 입력하세요"
              required
              disabled={loading}
            />
            <small className="form-hint">
              이메일 인증이 필요합니다. 정확한 이메일 주소를 입력해주세요.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="phone">연락처 (선택사항)</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="연락처를 입력하세요"
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            이미 계정이 있으신가요?{' '}
            <Link to="/login">로그인</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

