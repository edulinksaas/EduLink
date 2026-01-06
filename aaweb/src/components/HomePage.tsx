import { Banknote, Users, GraduationCap, Calendar, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { studentApi, teacherApi, paymentApi, classApi, subjectApi, classroomApi, teacherApi as teacherApiForName, timetableSettingsApi, getAcademyId } from '../utils/supabase/api';

interface HomePageProps {
  onNavigate: (page: 'todayStatus' | 'allStudents' | 'allTeachers') => void;
  onRegisterClick: () => void;
}

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

export function HomePage({ onNavigate, onRegisterClick }: HomePageProps) {
  const [stats, setStats] = useState({
    todayRevenue: 0,
    totalStudents: 0,
    totalTeachers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  
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
        console.log('[HomePage] GET /api/classrooms 응답 body:', JSON.stringify(classroomsResponse, null, 2));
        console.log('[API RESP]', settingsResponse);
        
        const classroomsData = Array.isArray(classroomsResponse) 
          ? classroomsResponse 
          : ((classroomsResponse as any).classrooms || []);
        
        const settingsData = settingsResponse.settings || null;
        
        setClassroomsRaw(classroomsData);
        setTimetableSettings(settingsData);
        
        console.log('[HomePage] academyId', academyId);
        console.log('[HomePage] settings.zones typeof', typeof settingsData?.zones, settingsData?.zones);
        console.log('[HomePage] classroomsRaw', classroomsData);
      } catch (err) {
        console.error('[HomePage] classrooms/settings 로드 실패:', err);
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
    console.log('[HomePage] classroomsView', merged);
    console.log('[HomePage] [ZONES MATCH COUNT]', merged.filter(c => c.zone).length, '/', merged.length);
  }, [classroomsRaw, timetableSettings]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 학생, 선생님 수 및 일 매출 가져오기
        const [students, teachers, revenueData, classesData] = await Promise.all([
          studentApi.getAll().catch(() => []),
          teacherApi.getAll().catch(() => []),
          paymentApi.getDailyRevenue().catch(() => ({ revenue: 0 })),
          classApi.getAll().catch(() => []),
        ]);
        
        setStats({
          todayRevenue: typeof revenueData.revenue === 'number' ? revenueData.revenue : (revenueData.revenue ? parseInt(revenueData.revenue, 10) : 0),
          totalStudents: Array.isArray(students) ? students.length : 0,
          totalTeachers: Array.isArray(teachers) ? teachers.length : 0,
        });

        // 오늘의 수업 일정 가져오기
        const classes = Array.isArray(classesData) ? classesData : [];
        const today = new Date();
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const todayDayName = dayNames[today.getDay()];
        
        // 오늘 요일에 해당하는 수업 필터링
        const todayClasses = classes.filter((cls: any) => {
          if (!cls.schedule) return false;
          const scheduleDays = cls.schedule.split(',');
          return scheduleDays.includes(todayDayName);
        });

        // 추가 정보 가져오기 (과목, 강의실, 선생님 이름)
        // classroomsView 사용 (zone 정보 포함)
        const scheduleWithDetails = await Promise.all(
          todayClasses.map(async (cls: any) => {
            try {
              const [subject, teacher] = await Promise.all([
                cls.subject_id ? subjectApi.getById(cls.subject_id).catch(() => null) : Promise.resolve(null),
                cls.teacher_id ? teacherApiForName.getById(parseInt(cls.teacher_id)).catch(() => null) : Promise.resolve(null),
              ]);

              // classroomsView에서 강의실 찾기 (zone 정보 포함)
              let classroomName = '강의실 없음';
              let classroomZone = null;
              if (cls.classroom_id) {
                const classroom = classroomsView.find(c => 
                  c.id === cls.classroom_id || c.id?.toString() === cls.classroom_id?.toString()
                );
                if (classroom?.name) {
                  classroomName = classroom.name;
                  classroomZone = classroom.zone;
                } else {
                  // fallback: API 직접 호출
                  try {
                    const classroomApiData = await classroomApi.getById(cls.classroom_id);
                    if (classroomApiData?.name) {
                      classroomName = classroomApiData.name;
                    }
                  } catch (err) {
                    console.error('강의실 정보 로드 실패:', err);
                  }
                }
              }

              return {
                ...cls,
                subjectName: subject?.name || subject?.subject_name || '과목 없음',
                classroomName: classroomName,
                classroomZone: classroomZone, // zone 정보 추가
                teacherName: teacher?.name || teacher?.teacher_name || '선생님 없음',
              };
            } catch (err) {
              console.error('수업 상세 정보 로드 실패:', err);
              return {
                ...cls,
                subjectName: '과목 없음',
                classroomName: '강의실 없음',
                teacherName: '선생님 없음',
              };
            }
          })
        );

        // 시간순으로 정렬
        scheduleWithDetails.sort((a: any, b: any) => {
          const timeA = a.start_time || '00:00';
          const timeB = b.start_time || '00:00';
          return timeA.localeCompare(timeB);
        });

        setTodaySchedule(scheduleWithDetails);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      icon: <Banknote className="w-8 h-8 text-blue-500" />,
      value: `₩${stats.todayRevenue.toLocaleString()}`,
      label: '금일 현황',
      onClick: () => onNavigate('todayStatus'),
    },
    {
      icon: <Users className="w-8 h-8 text-green-500" />,
      value: stats.totalStudents.toString(),
      unit: '명',
      label: '전체 학생',
      onClick: () => onNavigate('allStudents'),
    },
    {
      icon: <GraduationCap className="w-8 h-8 text-purple-500" />,
      value: stats.totalTeachers.toString(),
      unit: '명',
      label: '전체 선생님',
      onClick: () => onNavigate('allTeachers'),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">에듀링크에 오신 것을 환영합니다</h1>
        <p className="text-gray-600">학원 관리를 간편하게 시작하세요</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            onClick={stat.onClick}
            className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">{stat.label}</div>
              {stat.icon}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-800">{stat.value}</span>
              {stat.unit && <span className="text-lg text-gray-600">{stat.unit}</span>}
            </div>
            <div className="mt-4">
              <span className="text-sm text-blue-500 hover:text-blue-600 cursor-pointer">
                자세히 보기 →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">빠른 작업</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => onRegisterClick()}
            className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
          >
            <div className="p-2 bg-blue-500 rounded-lg">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-800">등록하기</div>
              <div className="text-sm text-gray-600">학생, 선생님, 수업 등록</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('allStudents')}
            className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
          >
            <div className="p-2 bg-green-500 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-800">학생 관리</div>
              <div className="text-sm text-gray-600">전체 학생 목록 보기</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('allTeachers')}
            className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left"
          >
            <div className="p-2 bg-purple-500 rounded-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-800">선생님 관리</div>
              <div className="text-sm text-gray-600">전체 선생님 목록 보기</div>
            </div>
          </button>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            오늘의 일정
          </h2>
          <button
            onClick={() => onNavigate('todayStatus')}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            전체 보기 →
          </button>
        </div>
        {todaySchedule.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">시간</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">강의명</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">선생님</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">강의실</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {todaySchedule.map((cls: any, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cls.start_time ? `${cls.start_time.substring(0, 5)} - ${cls.end_time?.substring(0, 5) || ''}` : '시간 없음'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cls.name} ({cls.subjectName || '과목 없음'})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cls.teacherName || '선생님 없음'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cls.classroomName || '강의실 없음'}
                      {cls.classroomZone && <span className="text-gray-400 ml-1">({cls.classroomZone})</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            오늘의 일정이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}

