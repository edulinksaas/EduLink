import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { subjectApi } from '../utils/supabase/api';

interface TeacherRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  operatingHours?: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
  subjects?: { name: string; color: string }[];
}

export function TeacherRegisterModal({ isOpen, onClose, operatingHours, subjects: propSubjects }: TeacherRegisterModalProps) {
  const [teacherName, setTeacherName] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<{ name: string; color: string }[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);

  // API에서 과목 목록 가져오기
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!isOpen) return;
      
      // props로 전달된 과목이 있으면 우선 사용
      if (propSubjects && propSubjects.length > 0) {
        setSubjects(propSubjects);
        return;
      }

      setIsLoadingSubjects(true);
      try {
        const response = await subjectApi.getAll();
        const subjectsData = Array.isArray(response) ? response : (response.subjects || []);
        
        // API 응답을 { name, color } 형식으로 변환
        const formattedSubjects = subjectsData.map((subject: any) => ({
          name: subject.name || subject.subject_name || '',
          color: subject.color || '#3b82f6'
        })).filter((s: any) => s.name); // 이름이 있는 것만 필터링
        
        setSubjects(formattedSubjects);
      } catch (err) {
        console.error('과목 목록 로드 실패:', err);
        // 에러 발생 시 기본값 사용
        setSubjects([
          { name: '한국어 기초', color: '#3b82f6' },
          { name: '한국어 중급', color: '#10b981' },
          { name: '한국어 고급', color: '#8b5cf6' }
        ]);
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [isOpen, propSubjects]);

  if (!isOpen) return null;

  // 운영 시간 설정에서 운영 중인 요일만 가져오기
  type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  const dayMapping: { [key: string]: DayKey } = {
    '월': 'monday',
    '화': 'tuesday',
    '수': 'wednesday',
    '목': 'thursday',
    '금': 'friday',
    '토': 'saturday',
    '일': 'sunday'
  };

  const availableDays = operatingHours 
    ? Object.entries(dayMapping)
        .filter(([_, key]) => operatingHours[key]?.isOpen)
        .map(([day, _]) => day)
    : ['월', '화', '수', '목', '금', '토'];

  const availableSubjects = subjects.length > 0 ? subjects : [
    { name: '한국어 기초', color: '#3b82f6' },
    { name: '한국어 중급', color: '#10b981' },
    { name: '한국어 고급', color: '#8b5cf6' }
  ];

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const handleSubmit = () => {
    // 등록 로직
    console.log({
      teacherName,
      selectedDays,
      selectedSubjects
    });
    // 초기화
    setTeacherName('');
    setSelectedDays([]);
    setSelectedSubjects([]);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[59]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-[60] w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg text-gray-800">선생님 등록</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* 이름 */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="선생님 이름을 입력하세요"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 출근 요일 */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              출근 요일
            </label>
            <div className="flex flex-wrap gap-2">
              {availableDays.map((day) => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-4 py-2 rounded border transition-colors ${
                    selectedDays.includes(day)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* 과목 */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              과목
            </label>
            {isLoadingSubjects ? (
              <div className="text-sm text-gray-500">과목 목록을 불러오는 중...</div>
            ) : availableSubjects.length === 0 ? (
              <div className="text-sm text-gray-500">등록된 과목이 없습니다. 설정 페이지에서 과목을 먼저 등록해주세요.</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableSubjects.map((subject) => (
                  <button
                    key={subject.name}
                    onClick={() => toggleSubject(subject.name)}
                    className={`px-4 py-2 rounded border transition-colors ${
                      selectedSubjects.includes(subject.name)
                        ? 'text-white border-opacity-0'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    style={{
                      backgroundColor: selectedSubjects.includes(subject.name) ? subject.color : undefined,
                      borderColor: selectedSubjects.includes(subject.name) ? subject.color : undefined
                    }}
                  >
                    {subject.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!teacherName.trim()}
            className="flex-1 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            저장
          </button>
        </div>
      </div>
    </>
  );
}
