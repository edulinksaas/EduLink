import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { authApi, ApiError } from '../utils/supabase/api';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [schoolCode, setSchoolCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!schoolCode.trim() || !password.trim()) {
      setError('학원 코드와 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    
    try {
      await authApi.login(schoolCode.trim(), password);
      onLogin();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || '로그인에 실패했습니다.');
      } else {
        setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎓</div>
          <h1 className="text-2xl text-gray-800 mb-2">학원 관리 시스템</h1>
          <p className="text-sm text-gray-500">간편하게 우리학원과 학원을 관리하세요</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* School Code Input */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">학원 코드</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🏫</span>
              <input
                type="text"
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
                placeholder="학원 코드를 입력하세요"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label className="block text-sm text-gray-700 mb-2">비밀번호</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔑</span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* Footer Links */}
        <div className="text-center space-y-2">
          <button className="text-sm text-purple-600 hover:text-purple-700 transition-colors">
            처음이신가요? 학원코드받기
          </button>
          <div className="text-xs text-gray-400">
            <button className="hover:text-gray-600 transition-colors">학원 등록안내</button>
            <span className="mx-1">|</span>
            <button className="hover:text-gray-600 transition-colors">관용약관</button>
          </div>
        </div>
      </div>
    </div>
  );
}
