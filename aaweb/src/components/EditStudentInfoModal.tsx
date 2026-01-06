import { X } from 'lucide-react';
import { useState } from 'react';

interface EditStudentInfoModalProps {
  onClose: () => void;
  studentName: string;
}

export function EditStudentInfoModal({ onClose, studentName }: EditStudentInfoModalProps) {
  const [formData, setFormData] = useState({
    grade: '',
    birthDate: '',
    birthDateInput: '', // 주민번호 앞자리 입력값
    address: '',
    email: '',
    phone: '010-2497-3237'
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 주민번호 앞자리를 생년월일로 변환
  const handleBirthDateInput = (value: string) => {
    // 숫자만 입력 가능, 최대 6자리
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    
    setFormData(prev => ({
      ...prev,
      birthDateInput: numericValue
    }));

    // 6자리가 입력되면 생년월일로 변환
    if (numericValue.length === 6) {
      const yy = numericValue.slice(0, 2);
      const mm = numericValue.slice(2, 4);
      const dd = numericValue.slice(4, 6);
      
      // 년도 처리: 00-25는 2000년대, 26-99는 1900년대
      const year = parseInt(yy) <= 25 ? `20${yy}` : `19${yy}`;
      
      const birthDate = `${year}년 ${mm}월 ${dd}일`;
      
      setFormData(prev => ({
        ...prev,
        birthDate
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        birthDate: ''
      }));
    }
  };

  const handleSubmit = () => {
    // 여기에서 실제 저장 로직을 처리
    console.log('학생 정보 저장:', formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl text-gray-800">{studentName} 정보 수정</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* 학년 */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                학년
              </label>
              <input
                type="text"
                value={formData.grade}
                onChange={(e) => handleChange('grade', e.target.value)}
                placeholder="예: 초등 2학년"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 생년월일 */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                생년월일
              </label>
              <input
                type="text"
                value={formData.birthDateInput}
                onChange={(e) => handleBirthDateInput(e.target.value)}
                placeholder="주민번호 앞자리 6자리 입력"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">예: 990101 입력 시 1999년 01월 01일</p>
              {formData.birthDate && (
                <div className="mt-2 px-3 py-2 bg-blue-50 text-blue-700 rounded text-sm">
                  ✓ {formData.birthDate}
                </div>
              )}
            </div>

            {/* 주소 */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                주소
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="주소를 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 이메일 */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 연락처 */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                연락 연락처
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="010-0000-0000"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

