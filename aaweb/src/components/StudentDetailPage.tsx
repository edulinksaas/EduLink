import { ChevronDown, ChevronUp, Phone, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { EditStudentInfoModal } from './EditStudentInfoModal';
import { studentApi, ApiError } from '../utils/supabase/api';

interface StudentDetailPageProps {
  studentId: number | null;
  onBack: () => void;
}

export function StudentDetailPage({ studentId, onBack }: StudentDetailPageProps) {
  const [isStudentInfoExpanded, setIsStudentInfoExpanded] = useState(true);
  const [isGuardianInfoExpanded, setIsGuardianInfoExpanded] = useState(true);
  const [showEditStudentInfoModal, setShowEditStudentInfoModal] = useState(false);
  const [currentYear, setCurrentYear] = useState(2025);
  const [currentMonth, setCurrentMonth] = useState(4); // 5월 (0-indexed)
  const [attendanceData, setAttendanceData] = useState<{ [key: number]: string }>({});
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API에서 학생 데이터 가져오기
  useEffect(() => {
    const fetchStudent = async () => {
      if (!studentId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        // studentApi.getById 사용
        const student = await studentApi.getById(studentId);
        setStudentData(student);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message || '학생 정보를 불러오는데 실패했습니다.');
        } else {
          setError('학생 정보를 불러오는데 실패했습니다.');
        }
        console.error('Failed to fetch student:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudent();
  }, [studentId]);

  const months = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  // 달력 데이터 생성
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case 'present':
        return '😊';
      case 'absent':
        return '❌';
      case 'carryover':
        return '🔄';
      case 'late':
        return '⏰';
      case 'early':
        return '🏃';
      case 'sick':
        return '😷';
      case 'excused':
        return '📝';
      default:
        return '';
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleStatusChange = (status: string) => {
    if (selectedDay !== null) {
      setAttendanceData({
        ...attendanceData,
        [selectedDay]: status
      });
      setSelectedDay(null);
      setShowStatusMenu(false);
    }
  };

  const handleDeleteStatus = () => {
    if (selectedDay !== null) {
      const newData = { ...attendanceData };
      delete newData[selectedDay];
      setAttendanceData(newData);
      setSelectedDay(null);
      setShowStatusMenu(false);
    }
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setShowStatusMenu(true);
  };

  // 통계 계산
  const calculateStats = () => {
    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      early: 0,
      sick: 0,
      excused: 0,
      carryover: 0,
    };

    Object.values(attendanceData).forEach((status) => {
      if (status === 'present') stats.present++;
      else if (status === 'absent') stats.absent++;
      else if (status === 'late') stats.late++;
      else if (status === 'early') stats.early++;
      else if (status === 'sick') stats.sick++;
      else if (status === 'excused') stats.excused++;
      else if (status === 'carryover') stats.carryover++;
    });

    return stats;
  };

  const stats = calculateStats();
  const studentName = studentData?.name || studentData?.student_name || '학생';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">학생 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (error || !studentData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-red-600">{error || '학생 정보를 찾을 수 없습니다.'}</p>
            <button
              onClick={onBack}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
                🐻
              </div>
              <h1 className="text-2xl text-gray-800">{studentName}</h1>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-500 mb-1">전체 출석률</div>
              <div className="text-2xl text-blue-600">100%</div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="px-3 py-1.5 bg-green-100 text-green-700 rounded">
              개월수
            </div>
            <div className="text-gray-600">
              <span className="text-gray-500">남은 회차</span>
              <span className="ml-2">남은 회차/등록 회차</span>
            </div>
            <div className="text-gray-600">
              <span className="text-gray-500">마지막 출석일</span>
              <span className="ml-2">2025.12.28</span>
            </div>
          </div>
        </div>

        {/* Class Section with Attendance Calendar */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-gray-800">반 이름</h2>
            <div className="text-sm text-blue-500">입금일,담당 선생님</div>
          </div>

          {/* Attendance Calendar */}
          <div className="border-t border-gray-200 pt-4">
            {/* Month Selector */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrevMonth}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-gray-700">{currentYear}년 {months[currentMonth]}</span>
                <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors">
                  오늘
                </button>
              </div>
              <button
                onClick={handleNextMonth}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-4 text-xs mb-4">
              <div className="flex items-center gap-1">
                <span className="text-blue-500">출석</span>
                <span className="text-gray-800">{stats.present}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-red-500">결석</span>
                <span className="text-gray-800">{stats.absent}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">지각</span>
                <span className="text-gray-800">{stats.late}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-orange-500">조퇴</span>
                <span className="text-gray-800">{stats.early}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-purple-500">병결</span>
                <span className="text-gray-800">{stats.sick}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-500">공결</span>
                <span className="text-gray-800">{stats.excused}</span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                  <div
                    key={day}
                    className={`text-center text-xs py-1 ${
                      index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-500'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells before first day */}
                {Array.from({ length: firstDay }).map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square" />
                ))}

                {/* Days */}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const dayOfWeek = (firstDay + index) % 7;
                  const attendance = attendanceData[day];
                  const today = new Date();
                  const isToday = 
                    day === today.getDate() && 
                    currentMonth === today.getMonth() && 
                    currentYear === today.getFullYear();

                  return (
                    <div
                      key={day}
                      className={`aspect-square flex flex-col items-center justify-center rounded border ${
                        isToday
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      } transition-colors cursor-pointer`}
                      onClick={() => handleDayClick(day)}
                    >
                      <span
                        className={`text-xs ${
                          dayOfWeek === 0
                            ? 'text-red-500'
                            : dayOfWeek === 6
                            ? 'text-blue-500'
                            : 'text-gray-700'
                        }`}
                      >
                        {day}
                      </span>
                      {attendance && (
                        <span className="text-lg">{getAttendanceIcon(attendance)}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-3 text-xs flex-wrap mt-4">
              <div className="flex items-center gap-1">
                <span>😊</span>
                <span className="text-gray-600">출석</span>
              </div>
              <div className="flex items-center gap-1">
                <span>❌</span>
                <span className="text-gray-600">결석</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🔄</span>
                <span className="text-gray-600">연장</span>
              </div>
              <div className="flex items-center gap-1">
                <span>⏰</span>
                <span className="text-gray-600">지각</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🏃</span>
                <span className="text-gray-600">조퇴</span>
              </div>
              <div className="flex items-center gap-1">
                <span>😷</span>
                <span className="text-gray-600">병결</span>
              </div>
              <div className="flex items-center gap-1">
                <span>📝</span>
                <span className="text-gray-600">공결</span>
              </div>
            </div>
          </div>
        </div>

        {/* Student Info Section */}
        <div className="bg-white rounded-lg border border-gray-200 mb-4">
          <button
            onClick={() => setIsStudentInfoExpanded(!isStudentInfoExpanded)}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-lg text-gray-800">학생 정보</h2>
            {isStudentInfoExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {isStudentInfoExpanded && (
            <div className="px-6 pb-6">
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">학년</span>
                  <span className="text-gray-800">{studentData.grade || '-'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">생년월일</span>
                  <span className="text-gray-800">{studentData.birth_date || '-'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">주소</span>
                  <span className="text-gray-800">{studentData.address || '-'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">이메일</span>
                  <span className="text-gray-800">{studentData.email || '-'}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">학생 연락처</span>
                  <span className="text-blue-600">{studentData.phone || studentData.student_phone || '010-2497-3237'}</span>
                </div>
              </div>
              <button
                onClick={() => setShowEditStudentInfoModal(true)}
                className="w-full py-2 text-blue-500 border border-blue-500 rounded hover:bg-blue-50 transition-colors"
              >
                수정하기
              </button>
            </div>
          )}
        </div>

        {/* Guardian Info Section */}
        <div className="bg-white rounded-lg border border-gray-200 mb-4">
          <button
            onClick={() => setIsGuardianInfoExpanded(!isGuardianInfoExpanded)}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-lg text-gray-800">보호자 정보</h2>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-red-500" />
              {isGuardianInfoExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>
          </button>

          {isGuardianInfoExpanded && (
            <div className="px-6 pb-6 space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">학부모 이름</span>
                <span className="text-gray-800">{studentData.parent_name || '***'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">학부모 연락처</span>
                <span className="text-blue-600">{studentData.parent_contact || studentData.parent_phone || '010-2497-3237'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">이메일</span>
                <span className="text-gray-800">{studentData.parent_email || '-'}</span>
              </div>
              <div className="px-3 py-2 bg-blue-50 text-blue-600 text-sm rounded">
                쓰임새
                <div className="text-xs text-gray-500 mt-1">
                  메모 혹은든 보호 개별이 없습니다.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-gray-800">추가 정보 기록</h2>
            <button className="px-4 py-1.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors">
              + 추가정보 추가
            </button>
          </div>
          <p className="text-gray-500 text-sm">
            아직 등록된 추가 정보가 없습니다.
          </p>
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="mt-6 w-full py-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          목록으로 돌아가기
        </button>
      </div>

      {/* Edit Student Info Modal */}
      {showEditStudentInfoModal && (
        <EditStudentInfoModal
          onClose={() => setShowEditStudentInfoModal(false)}
          studentName={studentName}
        />
      )}

      {/* Status Selection Modal */}
      {showStatusMenu && selectedDay !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-lg max-w-xs w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-gray-800">{currentMonth + 1}월 {selectedDay}일 출석 상태</h3>
              <button
                onClick={() => {
                  setShowStatusMenu(false);
                  setSelectedDay(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => handleStatusChange('present')}
                className="flex items-center gap-2 p-3 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <span className="text-2xl">😊</span>
                <span className="text-sm text-gray-700">출석</span>
              </button>
              <button
                onClick={() => handleStatusChange('absent')}
                className="flex items-center gap-2 p-3 border border-gray-200 rounded hover:bg-red-50 hover:border-red-300 transition-colors"
              >
                <span className="text-2xl">❌</span>
                <span className="text-sm text-gray-700">결석</span>
              </button>
              <button
                onClick={() => handleStatusChange('carryover')}
                className="flex items-center gap-2 p-3 border border-gray-200 rounded hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <span className="text-2xl">🔄</span>
                <span className="text-sm text-gray-700">이월</span>
              </button>
              <button
                onClick={() => handleStatusChange('late')}
                className="flex items-center gap-2 p-3 border border-gray-200 rounded hover:bg-yellow-50 hover:border-yellow-300 transition-colors"
              >
                <span className="text-2xl">⏰</span>
                <span className="text-sm text-gray-700">지각</span>
              </button>
              <button
                onClick={() => handleStatusChange('early')}
                className="flex items-center gap-2 p-3 border border-gray-200 rounded hover:bg-orange-50 hover:border-orange-300 transition-colors"
              >
                <span className="text-2xl">🏃</span>
                <span className="text-sm text-gray-700">조퇴</span>
              </button>
              <button
                onClick={() => handleStatusChange('sick')}
                className="flex items-center gap-2 p-3 border border-gray-200 rounded hover:bg-purple-50 hover:border-purple-300 transition-colors"
              >
                <span className="text-2xl">😷</span>
                <span className="text-sm text-gray-700">병결</span>
              </button>
              <button
                onClick={() => handleStatusChange('excused')}
                className="flex items-center gap-2 p-3 border border-gray-200 rounded hover:bg-green-50 hover:border-green-300 transition-colors"
              >
                <span className="text-2xl">📝</span>
                <span className="text-sm text-gray-700">공결</span>
              </button>
              {attendanceData[selectedDay] && (
                <button
                  onClick={handleDeleteStatus}
                  className="flex items-center justify-center p-3 border border-red-200 rounded hover:bg-red-50 hover:border-red-300 transition-colors"
                >
                  <span className="text-sm text-red-600">내용 삭제</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
