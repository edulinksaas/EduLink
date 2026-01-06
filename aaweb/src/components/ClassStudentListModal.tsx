import { X, Phone, User, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Student {
  id: number;
  name: string;
  phone: string;
  status: 'active' | 'inactive';
}

interface ClassStudentListModalProps {
  isOpen: boolean;
  onClose: () => void;
  classInfo: {
    title: string;
    time: string;
    room: string;
    teacher: string;
    level: string;
  } | null;
  onSaveAttendance?: (data: { date: string; attendanceData: { studentId: number; studentName: string; status: string }[] }) => void;
  onStudentClick?: (studentId: number) => void;
}

export function ClassStudentListModal({ isOpen, onClose, classInfo, onSaveAttendance, onStudentClick }: ClassStudentListModalProps) {
  const [attendanceStatus, setAttendanceStatus] = useState<{ [key: number]: string }>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (isOpen && classInfo) {
      // TODO: API에서 수업의 학생 목록 가져오기
      setStudents([]);
    }
  }, [isOpen, classInfo]);

  if (!isOpen || !classInfo) return null;

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

  const getAttendanceLabel = (status: string) => {
    switch (status) {
      case 'present':
        return '출석';
      case 'absent':
        return '결석';
      case 'carryover':
        return '이월';
      case 'late':
        return '지각';
      case 'early':
        return '조퇴';
      case 'sick':
        return '병결';
      case 'excused':
        return '공결';
      default:
        return '미체크';
    }
  };

  const handleAttendanceChange = (studentId: number, status: string) => {
    setAttendanceStatus({
      ...attendanceStatus,
      [studentId]: status
    });
  };

  const handleSaveAttendance = () => {
    if (onSaveAttendance) {
      const attendanceData = students.map(student => ({
        studentId: student.id,
        studentName: student.name,
        status: attendanceStatus[student.id] || 'absent'
      }));
      onSaveAttendance({ date: selectedDate, attendanceData });
    }
    onClose();
  };

  // 모든 학생의 출석 체크 여부 확인
  const allStudentsChecked = students.every(student => attendanceStatus[student.id]);

  // 선택된 날짜의 요일 계산
  const getDayOfWeek = (dateString: string) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  // 날짜를 포맷팅 (YYYY-MM-DD -> YYYY.MM.DD)
  const formatDate = (dateString: string) => {
    return dateString.replace(/-/g, '.');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl text-gray-800 mb-2">{classInfo.title}</h2>
            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              <span>🕐 {classInfo.time}</span>
              <span>📍 {classInfo.room}</span>
              <span>👨‍🏫 {classInfo.teacher}</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{classInfo.level}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Student Count */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              총 <span className="text-blue-600">{students.length}명</span>의 학생이 등록되어 있습니다.
            </div>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors" title="날짜 선택">
                <Calendar className="w-4 h-4 text-gray-600" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="absolute opacity-0 w-0 h-0"
                />
              </label>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-white border border-gray-300 rounded text-sm text-gray-700">
                  {formatDate(selectedDate)}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                  {getDayOfWeek(selectedDate)}요일
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {students.map((student) => (
              <div
                key={student.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Student Info */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <button 
                          onClick={() => onStudentClick?.(student.id)}
                          className="text-gray-800 hover:text-blue-600 hover:underline transition-colors"
                        >
                          {student.name}
                        </button>
                        <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                          student.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {student.status === 'active' ? '수강중' : '수강 종료'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span>{student.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Buttons */}
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleAttendanceChange(student.id, 'present')}
                      className={`p-2 rounded border transition-all ${
                        attendanceStatus[student.id] === 'present'
                          ? 'bg-blue-100 border-blue-300 shadow-sm'
                          : 'border-gray-200 hover:bg-blue-50'
                      }`}
                      title="출석"
                    >
                      <span className="text-lg">😊</span>
                    </button>
                    <button
                      onClick={() => handleAttendanceChange(student.id, 'absent')}
                      className={`p-2 rounded border transition-all ${
                        attendanceStatus[student.id] === 'absent'
                          ? 'bg-red-100 border-red-300 shadow-sm'
                          : 'border-gray-200 hover:bg-red-50'
                      }`}
                      title="결석"
                    >
                      <span className="text-lg">❌</span>
                    </button>
                    <button
                      onClick={() => handleAttendanceChange(student.id, 'carryover')}
                      className={`p-2 rounded border transition-all ${
                        attendanceStatus[student.id] === 'carryover'
                          ? 'bg-gray-100 border-gray-300 shadow-sm'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      title="이월"
                    >
                      <span className="text-lg">🔄</span>
                    </button>
                    <button
                      onClick={() => handleAttendanceChange(student.id, 'late')}
                      className={`p-2 rounded border transition-all ${
                        attendanceStatus[student.id] === 'late'
                          ? 'bg-yellow-100 border-yellow-300 shadow-sm'
                          : 'border-gray-200 hover:bg-yellow-50'
                      }`}
                      title="지각"
                    >
                      <span className="text-lg">⏰</span>
                    </button>
                    <button
                      onClick={() => handleAttendanceChange(student.id, 'early')}
                      className={`p-2 rounded border transition-all ${
                        attendanceStatus[student.id] === 'early'
                          ? 'bg-orange-100 border-orange-300 shadow-sm'
                          : 'border-gray-200 hover:bg-orange-50'
                      }`}
                      title="조퇴"
                    >
                      <span className="text-lg">🏃</span>
                    </button>
                    <button
                      onClick={() => handleAttendanceChange(student.id, 'sick')}
                      className={`p-2 rounded border transition-all ${
                        attendanceStatus[student.id] === 'sick'
                          ? 'bg-purple-100 border-purple-300 shadow-sm'
                          : 'border-gray-200 hover:bg-purple-50'
                      }`}
                      title="병결"
                    >
                      <span className="text-lg">😷</span>
                    </button>
                    <button
                      onClick={() => handleAttendanceChange(student.id, 'excused')}
                      className={`p-2 rounded border transition-all ${
                        attendanceStatus[student.id] === 'excused'
                          ? 'bg-green-100 border-green-300 shadow-sm'
                          : 'border-gray-200 hover:bg-green-50'
                      }`}
                      title="공결"
                    >
                      <span className="text-lg">📝</span>
                    </button>
                  </div>
                </div>

                {/* Current Status Display */}
                {attendanceStatus[student.id] && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <span>현재 상태:</span>
                      <span className="flex items-center gap-1">
                        <span>{getAttendanceIcon(attendanceStatus[student.id])}</span>
                        <span className="text-gray-800">{getAttendanceLabel(attendanceStatus[student.id])}</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {students.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>등록된 학생이 없습니다.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={allStudentsChecked ? handleSaveAttendance : undefined}
            className={`w-full px-4 py-2 rounded transition-colors ${
              allStudentsChecked
                ? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            전송하기
          </button>
        </div>
      </div>
    </div>
  );
}
