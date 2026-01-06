import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { classApi, subjectApi, classroomApi, getAcademyId, ApiError } from '../utils/supabase/api';

interface ClassRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects?: string[];
  levels?: string[];
  classTypes?: string[];
  rooms?: { id: string; name: string; zone: string }[];
  teachers?: { id: string; name: string; workDays: string[] }[];
  classInterval?: number;
  operatingHours?: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
  preSelectedTeacher?: { id: string; name: string; workDays: string[]; subjects: string[] } | null;
  onClassCreated?: () => void; // 수업 생성 후 콜백
}

export function ClassRegisterModal({ 
  isOpen, 
  onClose,
  subjects = ['한국어 문법', '한국어 회화', 'TOPIK 대비', '비즈니스 한국어'],
  levels = ['초급', '중급', '고급', '심화'],
  classTypes = ['그룹 수업', '개인 수업', '온라인 수업', '특별 수업'],
  rooms = [
    { id: '1', name: '101호', zone: 'A구역' },
    { id: '2', name: '102호', zone: 'A구역' },
    { id: '3', name: '201호', zone: 'B구역' }
  ],
  teachers = [
    { id: '1', name: '김민수', workDays: ['월', '화', '수', '목', '금'] },
    { id: '2', name: '이지은', workDays: ['월', '수', '금'] },
    { id: '3', name: '박서준', workDays: ['화', '목', '토'] }
  ],
  classInterval = 50,
  operatingHours = {
    monday: { open: '09:00', close: '18:00', isOpen: true },
    tuesday: { open: '09:00', close: '18:00', isOpen: true },
    wednesday: { open: '09:00', close: '18:00', isOpen: true },
    thursday: { open: '09:00', close: '18:00', isOpen: true },
    friday: { open: '09:00', close: '18:00', isOpen: true },
    saturday: { open: '09:00', close: '18:00', isOpen: true },
    sunday: { open: '09:00', close: '18:00', isOpen: false }
  },
  preSelectedTeacher = null,
  onClassCreated
}: ClassRegisterModalProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedClassType, setSelectedClassType] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [className, setClassName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [startHour, setStartHour] = useState('');
  const [startMinute, setStartMinute] = useState('');
  const [endHour, setEndHour] = useState('');
  const [endMinute, setEndMinute] = useState('');

  const days = ['월', '화', '수', '목', '금', '토', '일'];

  // 선생님이 미리 선택된 경우, 초기화
  useEffect(() => {
    if (preSelectedTeacher) {
      setSelectedTeacher(preSelectedTeacher.id);
    }
  }, [preSelectedTeacher]);

  // 요일 토글
  const toggleDay = (day: string) => {
    // 선생님이 미리 선택된 경우, 해당 선생님의 근무 요일만 선택 가능
    if (preSelectedTeacher && !preSelectedTeacher.workDays.includes(day)) {
      return;
    }
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // 요일+과목+수준으로 강의명 자동 생성
  useEffect(() => {
    if (selectedDays.length > 0 && selectedSubject && selectedLevel) {
      const dayStr = selectedDays.join(',');
      setClassName(`${dayStr} ${selectedSubject} ${selectedLevel}`);
    }
  }, [selectedDays, selectedSubject, selectedLevel]);

  // 시작 시간 변경 시 종료 시간 자동 계산
  useEffect(() => {
    if (startHour && startMinute) {
      const hours = parseInt(startHour);
      const minutes = parseInt(startMinute);
      const startMinutes = hours * 60 + minutes;
      const endMinutes = startMinutes + classInterval;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      setEndHour(endHours.toString().padStart(2, '0'));
      setEndMinute(endMins.toString().padStart(2, '0'));
    }
  }, [startHour, startMinute, classInterval]);

  // 해당 요일에 출근하는 선생님 필터링
  const availableTeachers = teachers.filter(teacher => 
    selectedDays.every(day => teacher.workDays.includes(day))
  );

  // 선택한 요일에 맞는 운영 시간 가져오기
  const getOperatingHoursForSelectedDays = () => {
    if (selectedDays.length === 0) {
      // 요일이 선택되지 않았으면 월요일 기본값 사용
      return operatingHours.monday;
    }
    
    // 요일 매핑
    const dayMapping: { [key: string]: keyof typeof operatingHours } = {
      '월': 'monday',
      '화': 'tuesday',
      '수': 'wednesday',
      '목': 'thursday',
      '금': 'friday',
      '토': 'saturday',
      '일': 'sunday'
    };
    
    // 선택한 첫 번째 요일의 운영 시간 사용
    const firstDay = selectedDays[0];
    const dayKey = dayMapping[firstDay];
    if (dayKey && operatingHours[dayKey]?.isOpen) {
      return operatingHours[dayKey];
    }
    
    // 선택한 요일이 운영하지 않으면 월요일 기본값 사용
    return operatingHours.monday;
  };

  // 현재 선택된 요일의 운영 시간
  const currentOperatingHours = getOperatingHoursForSelectedDays();
  const [opStartHour, opStartMin] = currentOperatingHours.open.split(':').map(Number);
  const [opEndHour, opEndMin] = currentOperatingHours.close.split(':').map(Number);
  
  // 운영 시간 내 시간 옵션 생성
  const getAvailableHours = () => {
    const hours = [];
    for (let i = opStartHour; i <= opEndHour; i++) {
      hours.push(i.toString().padStart(2, '0'));
    }
    return hours;
  };

  // 운영 시간 내 분 옵션 생성 (선택한 시간에 따라)
  const getAvailableMinutes = (selectedHour: string, isEndTime = false) => {
    const hour = parseInt(selectedHour);
    const minutes = ['00', '10', '20', '30', '40', '50'];
    
    if (!selectedHour) return minutes;
    
    // 시작 시간의 경우
    if (!isEndTime) {
      if (hour === opStartHour) {
        return minutes.filter(min => parseInt(min) >= opStartMin);
      }
      if (hour === opEndHour) {
        return minutes.filter(min => parseInt(min) < opEndMin);
      }
    } else {
      // 종료 시간의 경우
      if (hour === opEndHour) {
        return minutes.filter(min => parseInt(min) <= opEndMin);
      }
    }
    
    return minutes;
  };

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      const academyId = getAcademyId();
      if (!academyId) {
        alert('학원 ID가 없습니다. 다시 로그인해주세요.');
        return;
      }

      // 필수 필드 확인
      if (!selectedDays.length || !selectedTeacher || !selectedSubject || !selectedLevel || !selectedRoom || !className) {
        alert('모든 필수 항목을 입력해주세요.');
        return;
      }

      if (!startHour || !startMinute || !endHour || !endMinute) {
        alert('시작 시간과 종료 시간을 모두 선택해주세요.');
        return;
      }

      // 과목 ID 찾기
      const subjectsResponse = await subjectApi.getAll();
      const subjectsData = Array.isArray(subjectsResponse) ? subjectsResponse : (subjectsResponse.subjects || []);
      const subject = subjectsData.find((s: any) => (s.name || s.subject_name) === selectedSubject);
      if (!subject || !subject.id) {
        alert('선택한 과목을 찾을 수 없습니다.');
        return;
      }

      // 강의실 ID 찾기
      let classroomId = selectedRoom;
      
      // 임시 ID인 경우 (temp-로 시작) 이름으로 찾기
      if (selectedRoom.startsWith('temp-')) {
        const roomName = selectedRoom.replace(/^temp-[^-]+-/, ''); // temp-zone-name 형식에서 name 추출
        const classroomsResponse = await classroomApi.getAll();
        const classroomsData = Array.isArray(classroomsResponse) ? classroomsResponse : (classroomsResponse.classrooms || []);
        let classroom = classroomsData.find((c: any) => c.name === roomName);
        
        // DB에 없으면 생성
        if (!classroom) {
          try {
            const created = await classroomApi.create({ 
              name: roomName,
              capacity: 20 // 기본값
            });
            if (created.classroom?.id) {
              classroomId = created.classroom.id;
            } else {
              alert('강의실을 생성할 수 없습니다.');
              return;
            }
          } catch (createErr) {
            console.error('강의실 생성 실패:', createErr);
            alert('강의실을 생성할 수 없습니다.');
            return;
          }
        } else {
          classroomId = classroom.id;
        }
      } else if (!selectedRoom.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        // UUID 형식이 아니면 이름으로 찾기
        const classroomsResponse = await classroomApi.getAll();
        const classroomsData = Array.isArray(classroomsResponse) ? classroomsResponse : (classroomsResponse.classrooms || []);
        const classroom = classroomsData.find((c: any) => c.name === selectedRoom || c.id === selectedRoom);
        if (!classroom || !classroom.id) {
          alert('선택한 강의실을 찾을 수 없습니다.');
          return;
        }
        classroomId = classroom.id;
      }

      // 시간 형식 변환 (HH:mm)
      const startTime = `${startHour}:${startMinute}`;
      const endTime = `${endHour}:${endMinute}`;

      // 요일을 영어로 변환
      const dayMapping: { [key: string]: string } = {
        '월': 'monday',
        '화': 'tuesday',
        '수': 'wednesday',
        '목': 'thursday',
        '금': 'friday',
        '토': 'saturday',
        '일': 'sunday'
      };
      const schedule = selectedDays.map(day => dayMapping[day] || day).join(',');

      // 수업 생성
      await classApi.create({
        subject_id: subject.id,
        teacher_id: selectedTeacher,
        classroom_id: classroomId,
        name: className,
        level: selectedLevel,
        start_time: startTime,
        end_time: endTime,
        max_students: capacity ? parseInt(capacity) : null,
        schedule: schedule
      });

      alert('수업이 등록되었습니다.');
      
      // 폼 초기화
      setSelectedDays([]);
      setSelectedTeacher('');
      setSelectedSubject('');
      setSelectedLevel('');
      setSelectedClassType('');
      setSelectedRoom('');
      setClassName('');
      setStartHour('');
      setStartMinute('');
      setEndHour('');
      setEndMinute('');
      setCapacity('');
      
      // 수업 생성 후 콜백 호출 (부모 컴포넌트에 알림)
      if (onClassCreated) {
        onClassCreated();
      }
      
      onClose();
    } catch (err) {
      console.error('수업 등록 실패:', err);
      if (err instanceof ApiError) {
        alert(`수업 등록에 실패했습니다: ${err.message}`);
      } else {
        alert('수업 등록에 실패했습니다.');
      }
    }
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
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg text-gray-800">수업 등록하기</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4">
          {/* 요일 (중복 선택 가능) */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">
              요일 <span className="text-red-500">*</span>
              {preSelectedTeacher && (
                <span className="text-xs text-blue-600 ml-2">
                  ({preSelectedTeacher.name}의 근무 요일만 선택 가능)
                </span>
              )}
            </label>
            <div className="grid grid-cols-7 gap-2">
              {days.map((day) => {
                const isDisabled = preSelectedTeacher ? !preSelectedTeacher.workDays.includes(day) : false;
                return (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    disabled={isDisabled}
                    className={`px-3 py-2 rounded border transition-colors ${
                      selectedDays.includes(day)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : isDisabled
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            {selectedDays.length > 0 && (
              <p className="text-xs text-blue-600 mt-2">
                선택된 요일: {selectedDays.join(', ')}
              </p>
            )}
          </div>

          {/* 선생님 (해당 요일 출근자 선택) */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">
              선생님 <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {preSelectedTeacher ? (
                <button
                  className="px-3 py-2 rounded border text-sm bg-blue-500 text-white border-blue-500"
                >
                  {preSelectedTeacher.name}
                </button>
              ) : availableTeachers.length > 0 ? (
                availableTeachers.map((teacher) => (
                  <button
                    key={teacher.id}
                    onClick={() => setSelectedTeacher(teacher.id)}
                    className={`px-3 py-2 rounded border text-sm transition-colors ${
                      selectedTeacher === teacher.id
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {teacher.name}
                  </button>
                ))
              ) : (
                <div className="w-full p-3 bg-gray-50 rounded border border-gray-200 text-sm text-gray-500 text-center">
                  {selectedDays.length === 0 
                    ? '먼저 요일을 선택해주세요' 
                    : '선택한 요일에 출근하는 선생님이 없습니다'}
                </div>
              )}
            </div>
          </div>

          {/* 과목 */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">
              과목 <span className="text-red-500">*</span>
              {preSelectedTeacher && (
                <span className="text-xs text-blue-600 ml-2">
                  ({preSelectedTeacher.name}의 담당 과목만 표시)
                </span>
              )}
            </label>
            <div className="flex flex-wrap gap-2">
              {(preSelectedTeacher ? preSelectedTeacher.subjects : subjects).map((subject) => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={`px-3 py-2 rounded border text-sm transition-colors ${
                    selectedSubject === subject
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>

          {/* 수준 */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">
              수준 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-3 py-2 rounded border text-sm transition-colors ${
                    selectedLevel === level
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* 수업 유형 */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">
              수업 유형 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {classTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedClassType(type)}
                  className={`px-3 py-2 rounded border text-sm transition-colors ${
                    selectedClassType === type
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 강의실 */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">
              강의실 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {/* 구역별로 그룹화 */}
              {Array.from(new Set(rooms.map(room => room.zone))).map(zone => (
                <div key={zone}>
                  <div className="text-xs text-gray-500 mb-2">{zone}</div>
                  <div className="flex flex-wrap gap-2">
                    {rooms.filter(room => room.zone === zone).map(room => (
                      <button
                        key={room.id}
                        onClick={() => setSelectedRoom(room.id)}
                        className={`px-3 py-2 rounded border text-sm transition-colors ${
                          selectedRoom === room.id
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {room.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 강의명 (자동 생성/수정 가능) */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">
              강의명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="요일, 과목, 수준을 선택하면 자동 생성됩니다"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              자동 생성된 이름을 수정할 수 있습니다
            </p>
          </div>

          {/* 시작 시간 */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">
              시작 시간 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">시</option>
                {getAvailableHours().map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}시
                  </option>
                ))}
              </select>
              <select
                value={startMinute}
                onChange={(e) => setStartMinute(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">분</option>
                {getAvailableMinutes(startHour).map((min) => (
                  <option key={min} value={min}>
                    {min}분
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 종료 시간 (자동 계산/수정 가능) */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">
              종료 시간 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">시</option>
                {getAvailableHours().map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}시
                  </option>
                ))}
              </select>
              <select
                value={endMinute}
                onChange={(e) => setEndMinute(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">분</option>
                {getAvailableMinutes(endHour, true).map((min) => (
                  <option key={min} value={min}>
                    {min}분
                  </option>
                ))}
              </select>
            </div>
            {startHour && startMinute && endHour && endMinute && (
              <p className="text-xs text-blue-600 mt-1">
                수업 시간: {classInterval}분 기준으로 자동 계산됨 (수정 가능)
              </p>
            )}
          </div>

          {/* 정원 */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">
              정원 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="정원을 입력해주세요"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedDays.length || !selectedTeacher || !selectedSubject || !selectedLevel || !selectedRoom || !className || !startHour || !startMinute || !endHour || !endMinute}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded hover:from-blue-600 hover:to-purple-700 transition-colors disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
          >
            저장
          </button>
        </div>
      </div>
    </>
  );
}
