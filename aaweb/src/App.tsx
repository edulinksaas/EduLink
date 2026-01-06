import { GraduationCap, Users, Plus, X, Settings, HelpCircle, LogOut, Banknote } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { TodayStatus } from './components/TodayStatus';
import { AllStudents } from './components/AllStudents';
import { AllTeachers } from './components/AllTeachers';
import { SettingsPage } from './components/SettingsPage';
import { StudentRegisterModal } from './components/StudentRegisterModal';
import { TeacherRegisterModal } from './components/TeacherRegisterModal';
import { ClassRegisterModal } from './components/ClassRegisterModal';
import { ClassStudentListModal } from './components/ClassStudentListModal';
import { Header } from './components/Header';
import { RegisterBottomSheet } from './components/RegisterBottomSheet';
import { StudentDetailPage } from './components/StudentDetailPage';
import { TeacherDetailPage } from './components/TeacherDetailPage';
import { LoginPage } from './components/LoginPage';
import { subjectApi, timetableSettingsApi, getAcademyId, teacherApi, authApi, removeToken, classroomApi } from './utils/supabase/api';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRegisterBottomSheetOpen, setIsRegisterBottomSheetOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'todayStatus' | 'allStudents' | 'allTeachers' | 'settings' | 'studentDetail' | 'teacherDetail'>('home');
  const [isStudentRegisterModalOpen, setIsStudentRegisterModalOpen] = useState(false);
  const [isTeacherRegisterModalOpen, setIsTeacherRegisterModalOpen] = useState(false);
  const [isClassRegisterModalOpen, setIsClassRegisterModalOpen] = useState(false);
  const [isClassStudentListModalOpen, setIsClassStudentListModalOpen] = useState(false);
  const [mainColor, setMainColor] = useState('#3b82f6'); // 기본 파란색
  const [zones, setZones] = useState<{ name: string; rooms: string[] }[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>('전체');
  const [selectedClassInfo, setSelectedClassInfo] = useState<{
    title: string;
    time: string;
    room: string;
    teacher: string;
    level: string;
    students: number;
  } | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  
  // 운영 시간 설정
  const [operatingHours, setOperatingHours] = useState({
    monday: { open: '09:00', close: '22:00', isOpen: true },
    tuesday: { open: '09:00', close: '22:00', isOpen: true },
    wednesday: { open: '09:00', close: '22:00', isOpen: true },
    thursday: { open: '09:00', close: '22:00', isOpen: true },
    friday: { open: '09:00', close: '22:00', isOpen: true },
    saturday: { open: '10:00', close: '18:00', isOpen: true },
    sunday: { open: '10:00', close: '18:00', isOpen: false }
  });

  // 수업 시간 간격 설정
  const [classInterval, setClassInterval] = useState(50); // 분 단위

  // 과목 설정
  const [subjects, setSubjects] = useState<{ name: string; color: string }[]>([]);
  
  // 선생님 목록
  const [teachers, setTeachers] = useState<{ id: string; name: string; workDays: string[] }[]>([]);
  
  // 강의실 목록
  const [classrooms, setClassrooms] = useState<{ id: string; name: string; zone: string }[]>([]);
  
  // 수업 난이도 및 수업 유형
  const [difficulties, setDifficulties] = useState<string[]>(['초급', '중급', '고급', '심화']);
  const [classTypes, setClassTypes] = useState<string[]>(['그룹 수업', '개인 수업', '온라인 수업', '특별 수업']);

  // 설정 데이터 로드 (로그인 완료 시 1회만 실행)
  const loadSettings = useCallback(async () => {
      if (!isLoggedIn) return;
      
      try {
        const academyId = getAcademyId();
        if (!academyId) return;

        // 과목 목록 로드
        try {
          const subjectsResponse = await subjectApi.getAll();
          const subjectsData = Array.isArray(subjectsResponse) ? subjectsResponse : (subjectsResponse.subjects || []);
          const formattedSubjects = subjectsData.map((subject: any) => ({
            name: subject.name || subject.subject_name || '',
            color: subject.color || '#3b82f6'
          })).filter((s: any) => s.name);
          setSubjects(formattedSubjects);
        } catch (err) {
          console.error('과목 목록 로드 실패:', err);
          // 에러가 발생해도 빈 배열로 설정하여 앱이 계속 작동하도록 함
          setSubjects([]);
        }

        // 선생님 목록 로드
        try {
          const teachersResponse = await teacherApi.getAll();
          const teachersData = Array.isArray(teachersResponse) ? teachersResponse : ((teachersResponse as any).teachers || []);
          const formattedTeachers = teachersData.map((teacher: any) => ({
            id: teacher.id?.toString() || '',
            name: teacher.name || teacher.teacher_name || '',
            workDays: teacher.work_days || teacher.workDays || []
          })).filter((t: any) => t.id && t.name);
          setTeachers(formattedTeachers);
        } catch (err) {
          console.error('선생님 목록 로드 실패:', err);
          // 에러가 발생해도 빈 배열로 설정하여 앱이 계속 작동하도록 함
          setTeachers([]);
        }

        // 운영 시간 설정 및 수업 관리 설정 로드
        let loadedZones: { name: string; rooms: string[] }[] = []; // zones 정보를 저장할 변수
        
        try {
          const timetableResponse = await timetableSettingsApi.get();
          
          // 3단계 로그 출력
          console.log('[TT RAW]', timetableResponse);
          console.log('[TT DATA]', timetableResponse?.data);
          console.log('[TT SETTINGS CANDIDATE]', timetableResponse?.data?.data ?? timetableResponse?.data ?? timetableResponse);
          
          // settings 파싱 함수 (응답 래핑 차이 제거)
          const settings = timetableResponse?.data?.data ?? timetableResponse?.data ?? timetableResponse?.settings ?? timetableResponse;
          
          // academyId 체크
          const academyId = getAcademyId();
          if (!academyId) {
            console.warn('[TT SKIP] no academyId');
            return;
          }
          
          // timetable-settings 응답 파싱 로직 단일화 (snake_case 우선, camelCase fallback)
          const dayTimeSettings = settings?.day_time_settings ?? settings?.dayTimeSettings ?? null;
          const timeInterval = settings?.time_interval ?? settings?.timeInterval ?? null;
          const classroomIds = settings?.classroom_ids ?? settings?.classroomIds ?? [];
          
          console.log('[TT FINAL day_time_settings]', dayTimeSettings);
          console.log('[TT FINAL time_interval]', timeInterval);
          console.log('[TT FINAL classroom_ids]', classroomIds);
          
          if (dayTimeSettings === null) {
            console.warn('[TT SKIP] no dayTimeSettings (null)', settings);
            // dayTimeSettings가 null이면 기본값으로 계속 진행
          }
          
          // 수업 난이도 및 수업 유형 로드
          if (settings) {
            if (settings.difficulties && Array.isArray(settings.difficulties)) {
              setDifficulties(settings.difficulties);
            } else {
              // 기본값 설정
              setDifficulties(['초급', '중급', '고급', '심화']);
            }
            if (settings.class_types && Array.isArray(settings.class_types)) {
              setClassTypes(settings.class_types);
            } else {
              // 기본값 설정
              setClassTypes(['그룹 수업', '개인 수업', '온라인 수업', '특별 수업']);
            }
            
            // zones 정보 로드
            if (settings.zones) {
              if (typeof settings.zones === 'string') {
                // JSON 문자열인 경우 파싱
                try {
                  loadedZones = JSON.parse(settings.zones);
                } catch (e) {
                  console.error('zones JSON 파싱 실패:', e);
                }
              } else if (Array.isArray(settings.zones)) {
                loadedZones = settings.zones;
              }
              
              if (loadedZones.length > 0) {
                setZones(loadedZones);
              } else {
                // zones가 없으면 기본값 사용
                const defaultZones = [
                  { name: '1층', rooms: ['101호', '102호', '103호'] },
                  { name: '2층', rooms: ['201호', '202호'] },
                  { name: '3층', rooms: ['301호'] },
                ];
                loadedZones = defaultZones;
                setZones(defaultZones);
              }
            } else {
              // zones가 없으면 기본값 사용
              const defaultZones = [
                { name: '1층', rooms: ['101호', '102호', '103호'] },
                { name: '2층', rooms: ['201호', '202호'] },
                { name: '3층', rooms: ['301호'] },
              ];
              loadedZones = defaultZones;
              setZones(defaultZones);
            }
          } else {
            // 설정이 없으면 기본값 사용
            setDifficulties(['초급', '중급', '고급', '심화']);
            setClassTypes(['그룹 수업', '개인 수업', '온라인 수업', '특별 수업']);
            const defaultZones = [
              { name: '1층', rooms: ['101호', '102호', '103호'] },
              { name: '2층', rooms: ['201호', '202호'] },
              { name: '3층', rooms: ['301호'] },
            ];
            loadedZones = defaultZones;
            setZones(defaultZones);
          }
          
          // dayTimeSettings 적용 (null이 아닌 경우에만)
          if (dayTimeSettings !== null) {
            const loadedHours: typeof operatingHours = {
              monday: { open: '09:00', close: '22:00', isOpen: false },
              tuesday: { open: '09:00', close: '22:00', isOpen: false },
              wednesday: { open: '09:00', close: '22:00', isOpen: false },
              thursday: { open: '09:00', close: '22:00', isOpen: false },
              friday: { open: '09:00', close: '22:00', isOpen: false },
              saturday: { open: '10:00', close: '18:00', isOpen: false },
              sunday: { open: '10:00', close: '18:00', isOpen: false }
            };
            
            Object.entries(dayTimeSettings).forEach(([day, time]: [string, any]) => {
              if (loadedHours[day as keyof typeof loadedHours]) {
                loadedHours[day as keyof typeof loadedHours] = {
                  open: time.start || loadedHours[day as keyof typeof loadedHours].open,
                  close: time.end || loadedHours[day as keyof typeof loadedHours].close,
                  isOpen: true
                };
              }
            });
            
            setOperatingHours(loadedHours);
            console.log('[TT APPLIED day_time_settings]', loadedHours);
          } else {
            console.warn('[TT SKIP] dayTimeSettings is null, using defaults');
          }

          // 수업 시간 간격 로드 (이미 위에서 파싱됨)
          if (timeInterval) {
            const intervalMatch = String(timeInterval).match(/(\d+)/);
            if (intervalMatch) {
              setClassInterval(parseInt(intervalMatch[1], 10));
            } else {
              console.warn('[TT SKIP] invalid timeInterval format, using default');
              setClassInterval(50);
            }
          } else {
            console.warn('[TT SKIP] timeInterval not found (null), using default');
            setClassInterval(50);
          }

          // 강의실 목록 로드 및 timetable_settings.zones와 merge
          // 홈 화면 강의실 구조는 timetable_settings를 기준으로 동기화됨
          try {
            // 1단계: DB의 classrooms 테이블에서 실제 강의실 데이터 조회
            const classroomsResponse = await classroomApi.getAll();
            const classroomsData = Array.isArray(classroomsResponse) 
              ? classroomsResponse 
              : ((classroomsResponse as any).classrooms || []);
            
            // 2단계: timetable_settings.zones 정보와 classrooms 데이터 merge
            // zones에 있는 강의실은 classrooms 테이블의 실제 ID를 사용
            const mergedClassrooms: { id: string; name: string; zone: string }[] = [];
            
            if (loadedZones && loadedZones.length > 0) {
              // zones를 기준으로 강의실 목록 생성
              loadedZones.forEach((zone: { name: string; rooms: string[] }) => {
                zone.rooms.forEach((roomName: string) => {
                  // DB의 classrooms에서 같은 이름의 강의실 찾기 (대소문자 무시)
                  const dbClassroom = classroomsData.find((c: any) => 
                    c.name && c.name.toLowerCase().trim() === roomName.toLowerCase().trim()
                  );
                  
                  if (dbClassroom && dbClassroom.id) {
                    // DB에 존재하는 강의실: 실제 ID 사용
                    mergedClassrooms.push({
                      id: dbClassroom.id.toString(),
                      name: roomName.trim(), // zones의 원본 이름 사용
                      zone: zone.name
                    });
                  } else {
                    // DB에 없는 강의실: 임시 ID 사용 (나중에 저장 시 생성됨)
                    mergedClassrooms.push({
                      id: `temp-${zone.name}-${roomName}`,
                      name: roomName.trim(),
                      zone: zone.name
                    });
                  }
                });
              });
            } else {
              // zones가 없으면 DB의 classrooms만 사용
              classroomsData.forEach((cls: any) => {
                if (cls.name && cls.id) {
                  mergedClassrooms.push({
                    id: cls.id.toString(),
                    name: cls.name,
                    zone: '' // zone 정보 없음
                  });
                }
              });
            }
            
            console.log(`✅ 강의실 목록 merge 완료: ${mergedClassrooms.length}개 (zones: ${loadedZones?.length || 0}개 구역, DB: ${classroomsData.length}개)`);
            setClassrooms(mergedClassrooms);
          } catch (err) {
            console.error('강의실 목록 로드 실패:', err);
            // 에러 발생 시 zones만 사용하여 기본 강의실 목록 생성
            if (loadedZones && loadedZones.length > 0) {
              const fallbackClassrooms: { id: string; name: string; zone: string }[] = [];
              loadedZones.forEach((zone: { name: string; rooms: string[] }) => {
                zone.rooms.forEach((roomName: string) => {
                  fallbackClassrooms.push({
                    id: `temp-${zone.name}-${roomName}`,
                    name: roomName.trim(),
                    zone: zone.name
                  });
                });
              });
              setClassrooms(fallbackClassrooms);
            } else {
              setClassrooms([]);
            }
          }
        } catch (err) {
          console.error('운영 시간 설정 로드 실패:', err);
        }
      } catch (err) {
        console.error('설정 데이터 로드 실패:', err);
      }
    }, [isLoggedIn]);

  // 로그인 완료 시 설정 데이터 로드 (1회만 실행)
  useEffect(() => {
    if (isLoggedIn) {
      loadSettings();
    }
  }, [isLoggedIn]); // loadSettings를 의존성에서 제거하여 무한 루프 방지

  // zones 변경 시 강의실 목록을 재구성 (timetable_settings.zones 기준)
  // 홈 화면 강의실 구조는 timetable_settings를 기준으로 동기화됨
  // 실제 DB의 classrooms 테이블과 merge하여 실제 ID를 사용
  useEffect(() => {
    if (!isLoggedIn || zones.length === 0) {
      setClassrooms([]);
      return;
    }
    
    // zones 변경 시 기존 classrooms의 ID를 유지하면서 업데이트
    // (loadSettings에서 이미 merge된 데이터가 있으므로, zones 변경 시에만 재구성)
    setClassrooms(prevClassrooms => {
      const formattedClassrooms: { id: string; name: string; zone: string }[] = [];
      zones.forEach(zone => {
        zone.rooms.forEach(roomName => {
          // 기존 classrooms에서 같은 이름과 zone의 강의실 찾기 (ID 유지)
          const existingClassroom = prevClassrooms.find(c => 
            c.name.toLowerCase().trim() === roomName.toLowerCase().trim() && 
            c.zone === zone.name
          );
          if (existingClassroom) {
            formattedClassrooms.push(existingClassroom);
          } else {
            // 기존에 없으면 임시 ID 사용
            formattedClassrooms.push({
              id: `temp-${zone.name}-${roomName}`,
              name: roomName.trim(),
              zone: zone.name
            });
          }
        });
      });
      return formattedClassrooms;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zones, isLoggedIn]); // classrooms는 의존성에서 제거하여 무한 루프 방지
  
  // 출석 데이터 저장 (실제로는 서버에 저장)
  const [attendanceData, setAttendanceData] = useState<{
    [studentId: number]: {
      date: string;
      status: string;
    }[]
  }>({});

  const handleSaveAttendance = (data: { 
    date: string; 
    attendanceData: { studentId: number; studentName: string; status: string }[] 
  }) => {
    const newAttendanceData = { ...attendanceData };
    
    data.attendanceData.forEach(item => {
      if (!newAttendanceData[item.studentId]) {
        newAttendanceData[item.studentId] = [];
      }
      
      // 같은 날짜의 기존 출석 기록이 있다면 업데이트, 없으면 추가
      const existingIndex = newAttendanceData[item.studentId].findIndex(
        record => record.date === data.date
      );
      
      if (existingIndex >= 0) {
        newAttendanceData[item.studentId][existingIndex].status = item.status;
      } else {
        newAttendanceData[item.studentId].push({
          date: data.date,
          status: item.status
        });
      }
    });
    
    setAttendanceData(newAttendanceData);
    console.log('출석 데이터 저장됨:', newAttendanceData);
  };

  const stats = [
    {
      icon: <Banknote className="w-8 h-8 text-blue-500" />,
      value: '₩8,830,000',
      unit: '',
      label: '금일 현황',
      link: '자세 보기 →'
    },
    {
      icon: <Users className="w-8 h-8 text-green-500" />,
      value: '125',
      unit: '명',
      label: '전체 학생',
      link: '자세히 보기 →'
    },
    {
      icon: <GraduationCap className="w-8 h-8 text-purple-500" />,
      value: '8',
      unit: '',
      label: '전체 선생님',
      link: '자세히 보기 →'
    }
  ];

  const days = ['월', '화', '수', '목', '금', '토', '일'];
  
  // 정각 라벨 생성 함수 (HH:00 형식만 생성)
  const makeHourLabels = (startHHmm: string, endHHmm: string): string[] => {
    const [sh, sm] = startHHmm.split(':').map(Number);
    const [eh, em] = endHHmm.split(':').map(Number);

    // 시작은 start 이후 첫 정각(00)으로 올림
    let h = sh;
    if (sm > 0) h += 1;

    const labels: string[] = [];
    while (true) {
      // h:00이 end를 넘으면 중단 (end가 22:00이면 22:00 포함)
      if (h > eh || (h === eh && 0 > em)) break;
      labels.push(String(h).padStart(2, '0') + ':00');
      h += 1;
    }
    return labels;
  };

  // 분 단위 차이 계산 함수
  const diffMinutes = (startHHmm: string, endHHmm: string): number => {
    const [sh, sm] = startHHmm.split(':').map(Number);
    const [eh, em] = endHHmm.split(':').map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  };

  // 시간 문자열을 분으로 변환
  const timeToMinutes = (timeHHmm: string): number => {
    const [h, m] = timeHHmm.split(':').map(Number);
    return h * 60 + m;
  };
  
  // timeSlots를 정각 라벨(HH:00)만 생성하도록 변경
  // operatingHours가 변경될 때마다 재계산됨 (classInterval과 무관)
  const timeSlots = useMemo(() => {
    // 선택된 요일에 해당하는 dayTimeSettings 가져오기
    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const currentDayKey = dayKeys[selectedDay - 1];
    const dayConfig = operatingHours[currentDayKey];
    
    // dayConfig가 null인 경우에만 early return
    if (dayConfig === null || dayConfig === undefined) {
      console.warn('[TT SKIP] dayConfig is null/undefined', { selectedDay, currentDayKey, operatingHours });
      return []; // 운영하지 않는 날은 빈 배열 반환
    }
    
    if (!dayConfig.isOpen) {
      console.warn('[TT SKIP] day not open', { selectedDay, currentDayKey, dayConfig });
      return []; // 운영하지 않는 날은 빈 배열 반환
    }
    
    const dayStart = dayConfig.open;
    const dayEnd = dayConfig.close;
    
    // 정각 라벨만 생성 (interval과 무관)
    const labels = makeHourLabels(dayStart, dayEnd);
    
    console.log('[TT HOUR LABELS]', { dayStart, dayEnd, timeSlots: labels });
    
    return labels;
  }, [operatingHours, selectedDay]);

  // 모든 강의실 목록 (zones에서 추출)
  const allRooms = zones.flatMap(zone => zone.rooms);
  
  // 강의실이 6개를 넘으면 전체 보기 버튼 숨김
  const showAllButton = allRooms.length <= 6;
  
  // 선택된 구역에 따라 표시할 강의실 필터링
  const displayRooms = selectedZone === '전체' 
    ? allRooms 
    : zones.find(zone => zone.name === selectedZone)?.rooms || [];
  
  // zones 최초 로딩 시 selectedZone 자동 설정 (1회만 실행)
  useEffect(() => {
    // zones가 로드되고, selectedZone이 '전체'이고, showAllButton이 false일 때만 실행
    if (zones.length > 0 && selectedZone === '전체' && !showAllButton) {
      setSelectedZone(zones[0].name);
    }
  }, [zones.length]); // zones.length만 의존성으로 하여 zones 최초 로딩 시 1회만 실행

  // 강의실별 시간표 데이터 (요일별로)
  const scheduleByDay: Record<number, any[]> = {
    1: [ // 월요일
      {
        room: '101호',
        time: '12:00',
        title: '발야흥',
        teacher: '김민지',
        level: '초급',
        students: 10,
        color: 'bg-pink-50 border-pink-200'
      },
      {
        room: '102호',
        time: '14:00',
        title: '농구 중급반',
        teacher: '이수진',
        level: '중급',
        students: 15,
        color: 'bg-green-50 border-green-200'
      }
    ],
    2: [ // 화요일
      {
        room: '103호',
        time: '10:00',
        title: '배드민턴 중급반',
        teacher: '최정훈',
        level: '중급',
        students: 12,
        color: 'bg-yellow-50 border-yellow-200'
      },
      {
        room: '201호',
        time: '15:00',
        title: '댄스 초급반',
        teacher: '강민수',
        level: '초급',
        students: 20,
        color: 'bg-orange-50 border-orange-200'
      }
    ],
    3: [ // 수요일
      {
        room: '101호',
        time: '11:00',
        title: '축구 초급반',
        teacher: '김민지',
        level: '초급',
        students: 18,
        color: 'bg-blue-50 border-blue-200'
      }
    ],
    4: [ // 목요일
      {
        room: '102호',
        time: '9:00',
        title: '농구 중급반',
        teacher: '이수진',
        level: '중급',
        students: 15,
        color: 'bg-green-50 border-green-200'
      }
    ],
    5: [ // 금요일
      {
        room: '201호',
        time: '13:00',
        title: '댄스 초급반',
        teacher: '강민수',
        level: '초급',
        students: 20,
        color: 'bg-orange-50 border-orange-200'
      }
    ],
    6: [ // 토요일
      {
        room: '101호',
        time: '10:00',
        title: '축구 초급반',
        teacher: '김민지',
        level: '초급',
        students: 18,
        color: 'bg-blue-50 border-blue-200'
      }
    ],
    7: [ // 일요일
      {
        room: '102호',
        time: '11:00',
        title: '농구 중급반',
        teacher: '이수진',
        level: '중급',
        students: 15,
        color: 'bg-green-50 border-green-200'
      }
    ]
  };

  // 로그인 체크
  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="bg-slate-700 text-white p-4 flex items-center justify-between">
          <h2 className="text-lg">메뉴</h2>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 hover:bg-slate-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Menu */}
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button 
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded text-gray-700"
                onClick={() => {
                  setCurrentPage('allStudents');
                  setIsSidebarOpen(false);
                }}
              >
                <Users className="w-5 h-5 text-green-600" />
                <span>전체 학생 페이지</span>
              </button>
            </li>
            <li>
              <button 
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded text-gray-700"
                onClick={() => {
                  setCurrentPage('allTeachers');
                  setIsSidebarOpen(false);
                }}
              >
                <GraduationCap className="w-5 h-5 text-yellow-600" />
                <span>전체 선생님 페이지</span>
              </button>
            </li>
            <li>
              <button
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded text-blue-500"
                onClick={() => {
                  setIsRegisterBottomSheetOpen(true);
                  setIsSidebarOpen(false);
                }}
              >
                <Plus className="w-5 h-5" />
                <span>등록</span>
              </button>
            </li>
            <li>
              <button 
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded text-gray-700"
                onClick={() => {
                  setCurrentPage('settings');
                  setIsSidebarOpen(false);
                }}
              >
                <Settings className="w-5 h-5 text-gray-500" />
                <span>설정</span>
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded text-gray-700">
                <HelpCircle className="w-5 h-5 text-gray-500" />
                <span>도움말</span>
              </button>
            </li>
            <li>
              <button 
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded text-gray-700"
                onClick={async () => {
                  try {
                    // 서버에 로그아웃 요청 (선택사항)
                    await authApi.logout();
                  } catch (err) {
                    // 로그아웃 API 호출 실패해도 클라이언트에서 로그아웃 처리
                    console.error('로그아웃 API 호출 실패:', err);
                  } finally {
                    // localStorage에서 토큰 및 academy_id 제거
                    removeToken();
                    // 로그인 상태 변경
                    setIsLoggedIn(false);
                    // 페이지를 홈으로 리셋
                    setCurrentPage('home');
                    // 사이드바 닫기
                    setIsSidebarOpen(false);
                  }
                }}
              >
                <LogOut className="w-5 h-5 text-gray-500" />
                <span>로그아웃</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Header */}
      <Header 
        onMenuClick={() => setIsSidebarOpen(true)}
        onSettingsClick={() => setCurrentPage('settings')}
        onHomeClick={() => setCurrentPage('home')}
        onLogout={async () => {
          try {
            // 서버에 로그아웃 요청 (선택사항)
            await authApi.logout();
          } catch (err) {
            // 로그아웃 API 호출 실패해도 클라이언트에서 로그아웃 처리
            console.error('로그아웃 API 호출 실패:', err);
          } finally {
            // localStorage에서 토큰 및 academy_id 제거
            removeToken();
            // 로그인 상태 변경
            setIsLoggedIn(false);
            // 페이지를 홈으로 리셋
            setCurrentPage('home');
          }
        }}
      />

      {/* Main Content */}
      <main className="p-4 pt-20">
        {currentPage === 'home' && (
          <>
            {/* Stats Section */}
            <section className="mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="text-center mb-2">
                      <div className="text-sm text-gray-600 mb-3">{stat.label}</div>
                    </div>
                    <div className="flex justify-center mb-3">
                      {stat.icon}
                    </div>
                    <div className="text-center mb-2">
                      <div className="text-gray-800 mb-1 h-[36px] flex items-center justify-center">
                        <span className="text-3xl">{stat.value}</span>
                        <span className="text-lg">{stat.unit}</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <a 
                        href="#" 
                        className="text-blue-500 text-sm hover:underline"
                        onClick={(e) => {
                          e.preventDefault();
                          if (index === 0) { // 금일 현황 카드
                            setCurrentPage('todayStatus');
                          } else if (index === 1) { // 전체 학생 카드
                            setCurrentPage('allStudents');
                          } else if (index === 2) { // 전체 선생님 카드
                            setCurrentPage('allTeachers');
                          }
                        }}
                      >
                        {stat.link}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Schedule Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-gray-800">전체 시간표</h2>
                  <div className="flex gap-2">
                    {showAllButton && (
                      <button
                        onClick={() => setSelectedZone('전체')}
                        className={`px-4 h-10 rounded text-sm transition-colors ${
                          selectedZone === '전체'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        전체
                      </button>
                    )}
                    {zones.map((zone, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedZone(zone.name)}
                        className={`px-4 h-10 rounded text-sm transition-colors ${
                          selectedZone === zone.name
                            ? 'bg-blue-500 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {zone.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2 items-center">
                  <div className="flex gap-2">
                    {days.map((day, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedDay(index + 1)}
                        className={`w-10 h-10 rounded flex items-center justify-center transition-colors ${
                          selectedDay === index + 1
                            ? 'bg-blue-500 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setIsRegisterBottomSheetOpen(true)}
                    className="flex items-center gap-2 px-4 h-10 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>등록 하기</span>
                  </button>
                </div>
              </div>
              
              {/* Schedule Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
                {(() => {
                  // 선택된 요일의 운영 시간 가져오기
                  const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                  const currentDayKey = dayKeys[selectedDay - 1];
                  const dayConfig = operatingHours[currentDayKey];
                  
                  if (!dayConfig || !dayConfig.isOpen) {
                    return (
                      <div className="p-8 text-center text-gray-500">
                        운영하지 않는 날입니다.
                      </div>
                    );
                  }

                  const gridStart = dayConfig.open; // 예: '09:00'
                  const gridEnd = dayConfig.close; // 예: '22:00'
                  
                  // 그리드 높이 계산 (분 단위)
                  const pxPerMinute = 2; // 1분당 2px (조정 가능)

                  // 해당 요일의 모든 수업 가져오기
                  const daySchedule = scheduleByDay[selectedDay] || [];
                  
                  // 각 강의실별로 수업 필터링 및 위치 계산
                  const roomEvents = displayRooms.map((room) => {
                    return daySchedule
                      .filter((event) => event.room === room)
                      .map((event) => {
                        // event.time을 start_time으로 사용, end_time은 classInterval로 계산
                        const startTime = event.start_time || event.time || '09:00';
                        const durationMinutes = event.duration || classInterval;
                        const startMinutes = timeToMinutes(startTime);
                        const endMinutes = startMinutes + durationMinutes;
                        const endTime = `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`;
                        
                        // gridStart 기준으로 top 계산
                        const gridStartMinutes = timeToMinutes(gridStart);
                        const top = (startMinutes - gridStartMinutes) * pxPerMinute;
                        const height = durationMinutes * pxPerMinute;
                        
                        // end가 gridEnd를 넘는지 확인
                        const gridEndMinutes = timeToMinutes(gridEnd);
                        const actualEndMinutes = endMinutes;
                        
                        // 디버그 로그
                        console.log('[TT EVENT POS]', {
                          start: startTime,
                          end: endTime,
                          top,
                          height,
                          gridStart,
                          gridEnd,
                          room: event.room,
                          title: event.title
                        });
                        
                        return {
                          ...event,
                          startTime,
                          endTime,
                          top,
                          height,
                          actualEndMinutes,
                          gridEndMinutes
                        };
                      });
                  });

                  // 실제 그리드 끝이 필요한지 확인 (수업이 gridEnd를 넘는 경우)
                  const maxEndMinutes = Math.max(
                    ...roomEvents.flat().map(e => e.actualEndMinutes),
                    timeToMinutes(gridEnd)
                  );
                  const actualGridHeightPx = (maxEndMinutes - timeToMinutes(gridStart)) * pxPerMinute;

                  return (
                    <div className="flex">
                      {/* 시간 라벨 컬럼 */}
                      <div className="sticky left-0 bg-gray-50 border-r border-gray-200 z-10" style={{ minWidth: '100px' }}>
                        {/* 헤더 */}
                        <div className="px-4 py-3 border-b border-gray-200 text-sm text-gray-700 text-center font-medium">
                          시간
                        </div>
                        {/* 시간 라벨들 (정각만) */}
                        <div className="relative" style={{ height: `${actualGridHeightPx}px` }}>
                          {timeSlots.map((time, timeIndex) => {
                            const timeMinutes = timeToMinutes(time);
                            const gridStartMinutes = timeToMinutes(gridStart);
                            const top = (timeMinutes - gridStartMinutes) * pxPerMinute;
                            
                            // 다음 시간까지의 높이 계산 (마지막 시간은 남은 공간)
                            let height = 60 * pxPerMinute; // 기본 1시간 = 60분
                            if (timeIndex < timeSlots.length - 1) {
                              const nextTime = timeSlots[timeIndex + 1];
                              const nextTimeMinutes = timeToMinutes(nextTime);
                              height = (nextTimeMinutes - timeMinutes) * pxPerMinute;
                            } else {
                              // 마지막 시간 라벨은 남은 공간까지
                              height = actualGridHeightPx - top;
                            }
                            
                            return (
                              <div
                                key={timeIndex}
                                className="absolute left-0 right-0 border-b border-gray-200 text-sm text-gray-600 text-center px-4 py-2 bg-gray-50 flex items-center justify-center"
                                style={{ top: `${top}px`, height: `${height}px` }}
                              >
                                {time}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 강의실 컬럼들 */}
                      <div className="flex-1 flex">
                        {displayRooms.map((room, roomIndex) => {
                          const events = roomEvents[roomIndex] || [];
                          
                          return (
                            <div
                              key={roomIndex}
                              className="flex-1 border-r border-gray-200 last:border-r-0 relative"
                              style={{ minWidth: '200px' }}
                            >
                              {/* 헤더 */}
                              <div className="px-4 py-3 border-b border-gray-200 text-sm text-gray-700 text-center font-medium bg-white sticky top-0 z-10">
                                {room}
                              </div>
                              {/* 수업 블록 컨테이너 */}
                              <div 
                                className="relative overflow-visible"
                                style={{ height: `${actualGridHeightPx}px` }}
                              >
                                {/* 수업 블록들 */}
                                {events.map((event, eventIndex) => (
                                  <button
                                    key={eventIndex}
                                    onClick={() => {
                                      setSelectedClassInfo(event);
                                      setIsClassStudentListModalOpen(true);
                                    }}
                                    className={`absolute left-1 right-1 ${event.color || 'bg-pink-50 border-pink-200'} border rounded p-2 text-left hover:opacity-90 transition-opacity z-20`}
                                    style={{
                                      top: `${event.top}px`,
                                      height: `${event.height}px`,
                                      minHeight: '40px'
                                    }}
                                  >
                                    <div className="flex items-start justify-between mb-1">
                                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                                    </div>
                                    <p className="text-xs text-gray-700">{event.teacher} · {event.level}</p>
                                    <p className="text-xs text-gray-600 mt-1">
                                      {event.students} 명 / 0명 결석
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {event.startTime} - {event.endTime}
                                    </p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </section>
          </>
        )}
        
        {currentPage === 'todayStatus' && (
          <TodayStatus 
            onBack={() => setCurrentPage('home')} 
            onStudentClick={(studentId) => {
              setSelectedStudentId(studentId);
              setCurrentPage('studentDetail');
            }}
            onTeacherClick={(teacherId) => {
              setSelectedTeacherId(teacherId);
              setCurrentPage('teacherDetail');
            }}
            onRegisterClick={() => setIsRegisterBottomSheetOpen(true)}
          />
        )}
        
        {currentPage === 'allStudents' && (
          <AllStudents 
            onBack={() => setCurrentPage('home')}
            onStudentClick={(studentId) => {
              setSelectedStudentId(studentId);
              setCurrentPage('studentDetail');
            }}
            onRegisterClick={() => setIsRegisterBottomSheetOpen(true)}
          />
        )}
        
        {currentPage === 'allTeachers' && (
          <AllTeachers 
            onBack={() => setCurrentPage('home')}
            onTeacherClick={(teacherId) => {
              setSelectedTeacherId(teacherId);
              setCurrentPage('teacherDetail');
            }}
            onRegisterClick={() => setIsRegisterBottomSheetOpen(true)}
          />
        )}
        
        {currentPage === 'settings' && (
          <SettingsPage 
            onBack={() => setCurrentPage('home')}
            mainColor={mainColor}
            onMainColorChange={(color) => setMainColor(color)}
            zones={zones}
            onZonesChange={(newZones) => {
              setZones(newZones);
              // zones 변경 시 classrooms는 useEffect에서 자동 업데이트됨 (API 호출 없이)
            }}
            operatingHours={operatingHours}
            onOperatingHoursChange={(hours) => {
              if (hours) {
                setOperatingHours(hours);
              }
            }}
            subjects={subjects}
            onSubjectsChange={setSubjects}
            classInterval={classInterval}
            onClassIntervalChange={setClassInterval}
            difficulties={difficulties}
            onDifficultiesChange={setDifficulties}
            classTypes={classTypes}
            onClassTypesChange={setClassTypes}
          />
        )}
        
        {currentPage === 'studentDetail' && (
          <StudentDetailPage 
            onBack={() => setCurrentPage('allStudents')}
            studentId={selectedStudentId}
          />
        )}
        
        {currentPage === 'teacherDetail' && (
          <TeacherDetailPage 
            onBack={() => setCurrentPage('allTeachers')}
            teacherId={selectedTeacherId}
            subjects={subjects.map(s => s.name)}
            levels={difficulties}
            classTypes={classTypes}
            rooms={classrooms}
            classInterval={classInterval}
            operatingHours={operatingHours}
            teachers={teachers}
            onClassCreated={() => {
              // 수업 생성 후 설정 다시 로드
              loadSettings();
            }}
          />
        )}
      </main>

      {/* Student Register Modal */}
      <StudentRegisterModal 
        isOpen={isStudentRegisterModalOpen} 
        onClose={() => setIsStudentRegisterModalOpen(false)}
        subjects={subjects.map(s => s.name)}
      />

      {/* Teacher Register Modal */}
      <TeacherRegisterModal 
        isOpen={isTeacherRegisterModalOpen} 
        onClose={() => setIsTeacherRegisterModalOpen(false)}
        operatingHours={operatingHours}
        subjects={subjects}
      />

      {/* Class Register Modal */}
      <ClassRegisterModal 
        isOpen={isClassRegisterModalOpen} 
        onClose={() => setIsClassRegisterModalOpen(false)}
        subjects={subjects.map(s => s.name)}
        levels={difficulties}
        classTypes={classTypes}
        teachers={teachers}
        rooms={classrooms}
        operatingHours={operatingHours}
        onClassCreated={() => {
          // 수업 생성 후 HomePage 새로고침을 위해 상태 업데이트
          // currentPage가 'home'이면 HomePage가 자동으로 다시 렌더링됨
          if (currentPage === 'home') {
            // 강제로 리렌더링하기 위해 상태 업데이트
            setCurrentPage('home');
          }
        }}
      />

      {/* Class Student List Modal */}
      <ClassStudentListModal 
        isOpen={isClassStudentListModalOpen} 
        onClose={() => setIsClassStudentListModalOpen(false)} 
        classInfo={selectedClassInfo}
        onSaveAttendance={handleSaveAttendance}
        onStudentClick={(studentId) => {
          setSelectedStudentId(studentId);
          setIsClassStudentListModalOpen(false);
          setCurrentPage('studentDetail');
        }}
      />

      {/* Register Bottom Sheet */}
      <RegisterBottomSheet
        isOpen={isRegisterBottomSheetOpen}
        onClose={() => setIsRegisterBottomSheetOpen(false)}
        onClassRegister={() => {
          setIsRegisterBottomSheetOpen(false);
          setTimeout(() => setIsClassRegisterModalOpen(true), 100);
        }}
        onTeacherRegister={() => {
          setIsRegisterBottomSheetOpen(false);
          setTimeout(() => setIsTeacherRegisterModalOpen(true), 100);
        }}
        onStudentRegister={() => {
          setIsRegisterBottomSheetOpen(false);
          setTimeout(() => setIsStudentRegisterModalOpen(true), 100);
        }}
      />
    </div>
  );
}
