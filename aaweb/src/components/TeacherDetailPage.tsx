import { Edit, Pencil } from 'lucide-react';
import { useState, useEffect } from 'react';
import { StudentRegisterModal } from './StudentRegisterModal';
import { TeacherRegisterModal } from './TeacherRegisterModal';
import { ClassRegisterModal } from './ClassRegisterModal';
import { ClassStudentListModal } from './ClassStudentListModal';
import { teacherApi, classApi, subjectApi, classroomApi, ApiError, timetableSettingsApi, getAcademyId } from '../utils/supabase/api';

// zones 정규화 유틸 함수
function normalizeZones(zones: any): { name: string; rooms: string[] }[] {
  if (!zones) return [];
  if (typeof zones === 'string') {
    try {
      return JSON.parse(zones);
    } catch {
      return [];
    }
  }
  return Array.isArray(zones) ? zones : [];
}

// 문자열 정규화 함수
const norm = (v: any): string => String(v ?? '').trim().replace(/\s+/g, '').replace(/호$/, '');

// merge 함수 (zones -> classroom.zone)
function applyZonesToClassrooms(classrooms: any[], zones: { name: string; rooms: string[] }[]): any[] {
  const roomToZone = new Map<string, string>();
  
  // zones의 rooms를 정규화하여 맵에 추가
  (zones || []).forEach(z => {
    (z.rooms || []).forEach(r => {
      const normalizedRoom = norm(r);
      if (normalizedRoom) {
        roomToZone.set(normalizedRoom, z.name);
      }
    });
  });
  
  // classrooms의 모든 가능한 키를 정규화하여 매칭
  return (classrooms || []).map(c => {
    // classroom의 모든 가능한 키 후보
    const keysForClassroom = [
      c.id,
      c.name,
      c.room_name,
      c.roomNumber,
      c.room_number
    ].map(norm).filter(Boolean);
    
    // 매칭되는 zone 찾기
    let matchedZone: string | null = null;
    for (const key of keysForClassroom) {
      if (roomToZone.has(key)) {
        matchedZone = roomToZone.get(key)!;
        break;
      }
    }
    
    return {
      ...c,
      zone: matchedZone
    };
  });
}

interface TeacherDetailPageProps {
  teacherId: number | null;
  onBack: () => void;
  subjects?: string[];
  levels?: string[];
  classTypes?: string[];
  rooms?: { id: string; name: string; zone: string }[];
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
  teachers?: { id: string; name: string; workDays: string[] }[];
  onClassCreated?: () => void;
}

export function TeacherDetailPage({ 
  teacherId, 
  onBack,
  subjects: propSubjects = [],
  levels: propLevels = [],
  classTypes: propClassTypes = [],
  rooms: propRooms = [],
  classInterval: propClassInterval = 50,
  operatingHours: propOperatingHours,
  teachers: propTeachers = [],
  onClassCreated
}: TeacherDetailPageProps) {
  const [selectedWeekDays] = useState(['월', '화', '수', '목', '금']);
  const [isStudentRegisterModalOpen, setIsStudentRegisterModalOpen] = useState(false);
  const [isTeacherRegisterModalOpen, setIsTeacherRegisterModalOpen] = useState(false);
  const [isClassRegisterModalOpen, setIsClassRegisterModalOpen] = useState(false);
  const [isClassStudentListModalOpen, setIsClassStudentListModalOpen] = useState(false);
  const [selectedClassInfo, setSelectedClassInfo] = useState<{
    title: string;
    time: string;
    room: string;
    teacher: string;
    level: string;
  } | null>(null);
  const [scheduleType, setScheduleType] = useState<'평일' | '주말'>('평일');
  const [teacherData, setTeacherData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // academyId를 state로 관리하여 변경 감지
  const [academyId, setAcademyId] = useState<string | null>(getAcademyId());
  
  // 3-state 분리: classroomsRaw, timetableSettings, classroomsView
  const [classroomsRaw, setClassroomsRaw] = useState<any[]>([]);
  const [timetableSettings, setTimetableSettings] = useState<any>(null);
  const [classroomsView, setClassroomsView] = useState<any[]>([]);
  
  // academyId 변경 감지 (localStorage 변경 시)
  useEffect(() => {
    const checkAcademyId = () => {
      const currentAcademyId = getAcademyId();
      if (currentAcademyId !== academyId) {
        setAcademyId(currentAcademyId);
        // academyId 변경 시 timetableSettings 초기화 (로그인/로그아웃 시)
        setTimetableSettings(null);
        setClassroomsRaw([]);
        setClassroomsView([]);
      }
    };
    
    // 주기적으로 academyId 체크 (로그인/로그아웃 감지)
    const interval = setInterval(checkAcademyId, 500);
    
    return () => clearInterval(interval);
  }, [academyId]);

  // 화면 진입 시마다 classrooms와 timetable-settings 직접 fetch
  // academyId가 변경될 때마다 재조회 (로그인/로그아웃 시 academyId 변경됨)
  useEffect(() => {
    // academyId가 없으면 초기화 (로그아웃 시)
    if (!academyId) {
      setClassroomsRaw([]);
      setTimetableSettings(null);
      setClassroomsView([]);
      return;
    }
    
    console.log('[HOME LOAD]', academyId, timetableSettings);
    
    const fetchClassroomsAndSettings = async () => {
      try {
        // 2개 GET 호출 (화면 진입 시마다 직접 fetch)
        const [classroomsResponse, settingsResponse] = await Promise.all([
          classroomApi.getAll().catch(() => []),
          timetableSettingsApi.get().catch(() => ({ settings: null })),
        ]);
        
        // 응답 body 로그 출력
        console.log('[TeacherDetailPage] GET /api/classrooms 응답 body:', JSON.stringify(classroomsResponse, null, 2));
        console.log('[API RESP]', settingsResponse);
        
        const classroomsData = Array.isArray(classroomsResponse) 
          ? classroomsResponse 
          : ((classroomsResponse as any).classrooms || []);
        
        const settingsData = settingsResponse.settings || null;
        
        setClassroomsRaw(classroomsData);
        setTimetableSettings(settingsData);
        
        console.log('[TeacherDetailPage] academyId', academyId);
        console.log('[TeacherDetailPage] settings.zones typeof', typeof settingsData?.zones, settingsData?.zones);
        console.log('[TeacherDetailPage] classroomsRaw', classroomsData);
      } catch (err) {
        console.error('[TeacherDetailPage] classrooms/settings 로드 실패:', err);
        // 에러 발생 시 초기화
        setClassroomsRaw([]);
        setTimetableSettings(null);
        setClassroomsView([]);
      }
    };
    
    fetchClassroomsAndSettings();
  }, [academyId]); // academyId를 dependency에 포함하여 변경 시마다 재조회

  // merge는 useEffect 1곳에서만 수행 (덮어쓰기 방지)
  useEffect(() => {
    const zones = normalizeZones(timetableSettings?.zones);
    const merged = applyZonesToClassrooms(classroomsRaw, zones);
    setClassroomsView(merged);
    console.log('[TeacherDetailPage] classroomsView', merged);
    console.log('[TeacherDetailPage] [ZONES MATCH COUNT]', merged.filter(c => c.zone).length, '/', merged.length);
  }, [classroomsRaw, timetableSettings]);

  // API에서 선생님 데이터 가져오기
  useEffect(() => {
    const fetchTeacher = async () => {
      if (!teacherId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        // teacherApi.getById 사용
        const teacher = await teacherApi.getById(teacherId);
        setTeacherData(teacher);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message || '선생님 정보를 불러오는데 실패했습니다.');
        } else {
          setError('선생님 정보를 불러오는데 실패했습니다.');
        }
        console.error('Failed to fetch teacher:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacher();
  }, [teacherId]);

  const weekDays = ['월', '화', '수', '목', '금'];
  const weekendDays = ['토', '일'];
  const [subjects, setSubjects] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<Record<string, any[]>>({});
  const [weekendSchedule, setWeekendSchedule] = useState<Record<string, any[]>>({});

  // API에서 선생님의 과목 및 시간표 데이터 가져오기
  useEffect(() => {
    const fetchTeacherSchedule = async () => {
      if (!teacherData || !teacherId) return;
      
      try {
        // 모든 수업 가져오기
        const allClasses = await classApi.getAll();
        const classes = Array.isArray(allClasses) ? allClasses : [];
        
        // 해당 선생님의 수업만 필터링
        const teacherClasses = classes.filter((cls: any) => 
          cls.teacher_id === teacherId.toString() || cls.teacher_id === teacherId
        );

        // 선생님의 담당 과목 추출
        const teacherSubjectIds = new Set(teacherClasses.map((cls: any) => cls.subject_id).filter(Boolean));
        const subjectsList: string[] = [];
        for (const subjectId of teacherSubjectIds) {
          try {
            const subject = await subjectApi.getById(subjectId);
            if (subject?.name || subject?.subject_name) {
              subjectsList.push(subject.name || subject.subject_name);
            }
          } catch (err) {
            console.error('과목 정보 로드 실패:', err);
          }
        }
        setSubjects(subjectsList);

        // 시간표 데이터 구성
        const scheduleData: Record<string, any[]> = {};
        const weekendScheduleData: Record<string, any[]> = {};
        
        // 요일 매핑 (영어 -> 한글)
        const dayMapping: { [key: string]: string } = {
          'monday': '월',
          'tuesday': '화',
          'wednesday': '수',
          'thursday': '목',
          'friday': '금',
          'saturday': '토',
          'sunday': '일'
        };

        // 각 수업을 시간표 형식으로 변환
        for (const cls of teacherClasses) {
          if (!cls.schedule) continue;
          
          const scheduleDays = cls.schedule.split(',');
          
          // 강의실 정보 가져오기 (classroomsView 사용)
          let classroomName = '강의실 없음';
          let classroomZone = null;
          try {
            if (cls.classroom_id) {
              // classroomsView에서 찾기 (zone 정보 포함)
              const classroom = classroomsView.find(c => c.id === cls.classroom_id || c.id?.toString() === cls.classroom_id?.toString());
              if (classroom?.name) {
                classroomName = classroom.name;
                classroomZone = classroom.zone;
              } else {
                // fallback: API 직접 호출
                const classroomApiData = await classroomApi.getById(cls.classroom_id);
                if (classroomApiData?.name) {
                  classroomName = classroomApiData.name;
                }
              }
            }
          } catch (err) {
            console.error('강의실 정보 로드 실패:', err);
          }

          // 과목 정보 가져오기
          let subjectName = '과목 없음';
          let subjectColor = 'bg-gray-100 text-gray-700 border-gray-300';
          try {
            if (cls.subject_id) {
              const subject = await subjectApi.getById(cls.subject_id);
              if (subject?.name || subject?.subject_name) {
                subjectName = subject.name || subject.subject_name;
                if (subject.color) {
                  subjectColor = `bg-[${subject.color}]20 text-[${subject.color}] border-[${subject.color}]`;
                }
              }
            }
          } catch (err) {
            console.error('과목 정보 로드 실패:', err);
          }

          const classItem = {
            title: cls.name || '수업명 없음',
            time: cls.start_time || '00:00',
            room: classroomName,
            roomZone: classroomZone, // zone 정보 추가
            teacher: teacherName,
            level: cls.level || '수준 없음',
            color: subjectColor,
            subjectName: subjectName,
            classId: cls.id
          };

          // 각 요일에 수업 추가
          for (const day of scheduleDays) {
            const dayName = dayMapping[day.trim()] || day.trim();
            if (weekDays.includes(dayName)) {
              if (!scheduleData[dayName]) {
                scheduleData[dayName] = [];
              }
              scheduleData[dayName].push(classItem);
            } else if (weekendDays.includes(dayName)) {
              if (!weekendScheduleData[dayName]) {
                weekendScheduleData[dayName] = [];
              }
              weekendScheduleData[dayName].push(classItem);
            }
          }
        }

        // 시간순으로 정렬
        Object.keys(scheduleData).forEach(day => {
          scheduleData[day].sort((a, b) => a.time.localeCompare(b.time));
        });
        Object.keys(weekendScheduleData).forEach(day => {
          weekendScheduleData[day].sort((a, b) => a.time.localeCompare(b.time));
        });

        setSchedule(scheduleData);
        setWeekendSchedule(weekendScheduleData);
      } catch (err) {
        console.error('Failed to fetch teacher schedule:', err);
        setSubjects([]);
        setSchedule({});
        setWeekendSchedule({});
      }
    };

    fetchTeacherSchedule();
  }, [teacherData, teacherId]);

  const teacherName = teacherData?.name || teacherData?.teacher_name || '선생님';

  const subjectColors: { [key: string]: string } = {
    '풀레이': 'bg-blue-100 text-blue-700 border-blue-300',
    '농구': 'bg-orange-100 text-orange-700 border-orange-300',
    '세종 대왕': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    '배드민턴': 'bg-green-100 text-green-700 border-green-300',
    '발레': 'bg-pink-100 text-pink-700 border-pink-300',
    '자연에 축구': 'bg-purple-100 text-purple-700 border-purple-300'
  };

  const timeSlots = [
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  const weekendTimeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">선생님 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (error || !teacherData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-red-600">{error || '선생님 정보를 찾을 수 없습니다.'}</p>
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
          <div className="text-sm text-gray-600 mb-1">선생님 이름</div>
          <h1 className="text-2xl text-gray-800 mb-2">{teacherName}</h1>
          <p className="text-sm text-red-500">연락처: {teacherData.phone || teacherData.teacher_phone || '010 9158 7124'}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-2">월 신규 등록 인원</div>
            <div className="text-2xl text-gray-800">0명</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-2">수업 수</div>
            <div className="text-2xl text-gray-800">0개반</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-2">학생 수</div>
            <div className="text-2xl text-gray-800">0명</div>
          </div>
        </div>

        {/* Work Days */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
          <h2 className="text-lg text-gray-800 mb-4">근무 요일</h2>
          <div className="flex gap-2">
            {weekDays.map((day) => (
              <button
                key={day}
                className={`w-12 h-12 rounded-full ${
                  selectedWeekDays.includes(day)
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Subjects */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
          <h2 className="text-lg text-gray-800 mb-4">담당 과목</h2>
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <span
                key={subject}
                className={`px-4 py-2 rounded-full text-sm border ${subjectColors[subject]}`}
              >
                {subject}
              </span>
            ))}
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg text-gray-800">시간표</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setScheduleType('평일')}
                  className={`px-4 py-1 rounded text-sm transition-colors ${
                    scheduleType === '평일'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  평일
                </button>
                <button
                  onClick={() => setScheduleType('주말')}
                  className={`px-4 py-1 rounded text-sm transition-colors ${
                    scheduleType === '주말'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  주말
                </button>
              </div>
            </div>
            <button
              onClick={() => setIsClassRegisterModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
            >
              수업 등록하기
            </button>
          </div>

          {/* Schedule Table */}
          {scheduleType === '평일' ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 min-w-[80px]">
                      시간
                    </th>
                    {weekDays.map((day) => (
                      <th
                        key={day}
                        className="border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 min-w-[140px]"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((time) => (
                    <tr key={time}>
                      <td className="border border-gray-200 p-3 text-sm text-gray-600 text-center bg-gray-50">
                        {time}
                      </td>
                      {weekDays.map((day) => {
                        const daySchedule = schedule[day as keyof typeof schedule] || [];
                        const classAtTime = daySchedule.find((item) => item.time === time);

                        return (
                          <td key={day} className="border border-gray-200 p-2">
                            {classAtTime && (
                              <div
                                className={`${classAtTime.color} border rounded p-2 text-xs relative cursor-pointer hover:shadow-md transition-shadow`}
                              >
                                <div className="flex items-start justify-between mb-1">
                                  <div className="flex-1">
                                    <div className="text-gray-800 mb-1">
                                      {classAtTime.title}
                                    </div>
                                    <div className="text-gray-600">{classAtTime.level}</div>
                                    <div className="text-gray-600">
                                      {classAtTime.room}
                                      {classAtTime.roomZone && <span className="text-gray-400 ml-1">({classAtTime.roomZone})</span>}
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      className="w-5 h-5 flex items-center justify-center bg-white rounded hover:bg-gray-100"
                                      onClick={() => {
                                        setSelectedClassInfo({
                                          title: classAtTime.title,
                                          time: time,
                                          room: classAtTime.room,
                                          teacher: teacherName,
                                          level: classAtTime.level
                                        });
                                        setIsClassStudentListModalOpen(true);
                                      }}
                                    >
                                      <Pencil className="w-3 h-3 text-gray-600" />
                                    </button>
                                    <button className="w-5 h-5 flex items-center justify-center bg-white rounded hover:bg-gray-100">
                                      <Edit className="w-3 h-3 text-gray-600" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 min-w-[80px]">
                      시간
                    </th>
                    {weekendDays.map((day) => (
                      <th
                        key={day}
                        className="border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 min-w-[140px]"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {weekendTimeSlots.map((time) => (
                    <tr key={time}>
                      <td className="border border-gray-200 p-3 text-sm text-gray-600 text-center bg-gray-50">
                        {time}
                      </td>
                      {weekendDays.map((day) => {
                        const daySchedule = weekendSchedule[day as keyof typeof weekendSchedule] || [];
                        const classAtTime = daySchedule.find((item) => item.time === time);

                        return (
                          <td key={day} className="border border-gray-200 p-2">
                            {classAtTime && (
                              <div
                                className={`${classAtTime.color} border rounded p-2 text-xs relative cursor-pointer hover:shadow-md transition-shadow`}
                              >
                                <div className="flex items-start justify-between mb-1">
                                  <div className="flex-1">
                                    <div className="text-gray-800 mb-1">
                                      {classAtTime.title}
                                    </div>
                                    <div className="text-gray-600">{classAtTime.level}</div>
                                    <div className="text-gray-600">
                                      {classAtTime.room}
                                      {classAtTime.roomZone && <span className="text-gray-400 ml-1">({classAtTime.roomZone})</span>}
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      className="w-5 h-5 flex items-center justify-center bg-white rounded hover:bg-gray-100"
                                      onClick={() => {
                                        setSelectedClassInfo({
                                          title: classAtTime.title,
                                          time: time,
                                          room: classAtTime.room,
                                          teacher: teacherName,
                                          level: classAtTime.level
                                        });
                                        setIsClassStudentListModalOpen(true);
                                      }}
                                    >
                                      <Pencil className="w-3 h-3 text-gray-600" />
                                    </button>
                                    <button className="w-5 h-5 flex items-center justify-center bg-white rounded hover:bg-gray-100">
                                      <Edit className="w-3 h-3 text-gray-600" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-full py-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          목록으로 돌아가기
        </button>

        {/* Modals */}
        <StudentRegisterModal
          isOpen={isStudentRegisterModalOpen}
          onClose={() => setIsStudentRegisterModalOpen(false)}
        />
        <TeacherRegisterModal
          isOpen={isTeacherRegisterModalOpen}
          onClose={() => setIsTeacherRegisterModalOpen(false)}
        />
        <ClassRegisterModal
          isOpen={isClassRegisterModalOpen}
          onClose={() => setIsClassRegisterModalOpen(false)}
          preSelectedTeacher={{
            id: teacherId?.toString() || '1',
            name: teacherName,
            workDays: selectedWeekDays,
            subjects: subjects
          }}
          subjects={propSubjects.length > 0 ? propSubjects : subjects}
          levels={propLevels}
          classTypes={propClassTypes}
          rooms={propRooms}
          classInterval={propClassInterval}
          operatingHours={propOperatingHours || {
            monday: { open: '09:00', close: '22:00', isOpen: true },
            tuesday: { open: '09:00', close: '22:00', isOpen: true },
            wednesday: { open: '09:00', close: '22:00', isOpen: true },
            thursday: { open: '09:00', close: '22:00', isOpen: true },
            friday: { open: '09:00', close: '22:00', isOpen: true },
            saturday: { open: '10:00', close: '18:00', isOpen: true },
            sunday: { open: '10:00', close: '18:00', isOpen: false }
          }}
          teachers={propTeachers}
          onClassCreated={() => {
            // 수업 생성 후 시간표 새로고침을 위해 컴포넌트 재마운트 트리거
            // teacherData를 다시 설정하여 useEffect 재실행
            if (teacherData) {
              setTeacherData({ ...teacherData });
            }
            // 부모 컴포넌트에 알림
            if (onClassCreated) {
              onClassCreated();
            }
          }}
        />
        <ClassStudentListModal
          isOpen={isClassStudentListModalOpen}
          onClose={() => setIsClassStudentListModalOpen(false)}
          classInfo={selectedClassInfo}
        />
      </div>
    </div>
  );
}
