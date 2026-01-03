import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { classService } from '../services/classService';
import { classroomService } from '../services/classroomService';
import { subjectService } from '../services/subjectService';
import { teacherService } from '../services/teacherService';
import { timetableSettingsService } from '../services/timetableSettingsService';
import { studentService } from '../services/studentService';
import { tuitionFeeService } from '../services/tuitionFeeService';
import { attendanceService } from '../services/attendanceService';
import { enrollmentService } from '../services/enrollmentService';
import { checkAndDeleteEmptyClass } from '../utils/classAutoDelete';
import { useAcademy } from '../contexts/AcademyContext';
import Modal from '../components/Modal';
import Form from '../components/Form';
import ClassFormModal from '../components/ClassFormModal';
import RegisterModal from '../components/RegisterModal';
import './Classes.css';
import './Students.css';

const Classes = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { academy, academyId, loading: academyLoading } = useAcademy();
  const [classes, setClasses] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    todayStatus: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
  });
  // 오늘 요일 자동 감지
  const getTodayDay = () => {
    const today = new Date();
    const dayIndex = today.getDay(); // 0(일요일) ~ 6(토요일)
    // JavaScript getDay() 매핑: 일(0) -> '일', 월(1) -> '월', 화(2) -> '화', ...
    const dayMap = ['일', '월', '화', '수', '목', '금', '토'];
    return dayMap[dayIndex];
  };

  const [selectedDay, setSelectedDay] = useState(() => getTodayDay());
  const [selectedBuilding, setSelectedBuilding] = useState(null); // 선택된 관 ID (초기값: null, 첫 번째 관으로 설정)
  const [buildingNames, setBuildingNames] = useState([{ id: 1, name: '1관' }]);
  const [loading, setLoading] = useState(false);
  const [autoReturnTimer, setAutoReturnTimer] = useState(null);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [formData, setFormData] = useState({});
  const [timetableSettings, setTimetableSettings] = useState(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedClassForStudents, setSelectedClassForStudents] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [isStudentRegisterModalOpen, setIsStudentRegisterModalOpen] = useState(false);
  const [isStudentEditModalOpen, setIsStudentEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isRegisteringFromClassModal, setIsRegisteringFromClassModal] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [tuitionFees, setTuitionFees] = useState([]);
  const [studentFormData, setStudentFormData] = useState({
    name: '',
    parent_contact: '',
    payment_method: '현금',
    class_id: '',
    teacher_id: '',
    schedule: '',
    fee: '',
    receipt_file: null,
    note: '',
  });

  const days = ['월', '화', '수', '목', '금', '토', '일'];

  // 학부모 연락처 자동 생성 함수
  const generateParentContact = () => {
    const middle = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const last = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `010-${middle}-${last}`;
  };

  const parseTime = (timeStr) => {
    const isAM = timeStr.includes('오전');
    const time = timeStr.replace(/오전|오후/g, '').trim();
    const [hours, minutes] = time.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes;
    if (!isAM && hours !== 12) {
      totalMinutes += 12 * 60;
    }
    return totalMinutes;
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    // 24시간 형식으로 표시 (00:00 ~ 23:59)
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };
  
  // 설정에서 요일별 시작/종료 시간을 읽어서 "정각 1시간 단위" 시간대 생성
  // (시간표 그리드는 항상 01:00 / 02:00 처럼 1시간 간격으로 고정)
  const generateTimeSlotsFromSettings = (startTimeStr, endTimeStr, _interval = '1시간') => {
    const startMinutes = parseTime(startTimeStr);
    const endMinutes = parseTime(endTimeStr);
    
    const intervalMinutes = 60; // 그리드는 항상 1시간 간격
    const slots = [];
    let currentMinutes = startMinutes;
    
    while (currentMinutes <= endMinutes) {
      slots.push(formatTime(currentMinutes));
      currentMinutes += intervalMinutes;
    }
    
    return slots;
  };

  const [timeSlots, setTimeSlots] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  const getIntervalMinutes = (interval) => {
    if (interval === '30분') return 30;
    if (interval === '40분') return 40;
    if (interval === '50분') return 50;
    if (interval === '1시간') return 60;
    if (interval === '1시간 30분') return 90;
    return 60; // 기본값
  };

  const generateTimeSlots = (startTimeStr = '오전 08:00', endTimeStr = '오후 08:00', interval = '1시간') => {
    const intervalMinutes = getIntervalMinutes(interval);
    const startMinutes = parseTime(startTimeStr);
    const endMinutes = parseTime(endTimeStr);

    const slots = [];
    let currentMinutes = startMinutes;

    while (currentMinutes < endMinutes) {
      slots.push(formatTime(currentMinutes));
      currentMinutes += intervalMinutes;
    }

    setTimeSlots(slots);
    setAvailableTimeSlots(slots); // 시간표와 모달에서 사용할 시간대 동일하게 설정
  };

  // 시간표 설정 로드 (academyId 변경 시에만)
  useEffect(() => {
    const loadTimetableSettings = async () => {
      if (!academyId) return;
      
      try {
        let normalizedSettings = null;

        // 1) 우선 DB의 timetable_settings에서 설정 읽기
        try {
          const response = await timetableSettingsService.get(academyId);
          const dbSettings = response?.settings;
          if (dbSettings) {
            normalizedSettings = {
              timeInterval: dbSettings.time_interval || dbSettings.timeInterval || '1시간',
              dayTimeSettings: dbSettings.day_time_settings || dbSettings.dayTimeSettings || {},
              operatingDays: dbSettings.operating_days || dbSettings.operatingDays || [],
            };
          }
        } catch (dbError) {
          // 429 에러 등 rate limit 에러는 재시도하지 않음
          if (dbError?.response?.status === 429) {
            console.warn('⚠️ API 요청 제한 초과, localStorage로 폴백');
          } else {
            console.warn('⚠️ DB 시간표 설정 로드 실패, localStorage로 폴백:', dbError);
          }
        }

        // 2) DB에 없으면 localStorage의 timetableSettings 사용 (구 버전 호환)
        if (!normalizedSettings) {
          const saved = localStorage.getItem('timetableSettings');
          if (saved) {
            const localSettings = JSON.parse(saved);
            normalizedSettings = {
              timeInterval: localSettings.timeInterval || '1시간',
              dayTimeSettings: localSettings.dayTimeSettings || {},
              operatingDays: localSettings.operatingDays || [],
            };
          }
        }

        // 3) 설정이 전혀 없으면 기본값 사용
        if (!normalizedSettings) {
          const slots = generateTimeSlotsFromSettings('오전 08:00', '오후 08:00', '1시간');
          setTimetableSettings(null);
          setTimeSlots(slots);
          setAvailableTimeSlots(slots);
          return;
        }

        // 상태에 저장 (calculateEndTime 등에서 재사용)
        setTimetableSettings(normalizedSettings);
      } catch (error) {
        console.error('시간표 설정 로드 실패:', error);
        const slots = generateTimeSlotsFromSettings('오전 08:00', '오후 08:00', '1시간');
        setTimeSlots(slots);
        setAvailableTimeSlots(slots);
      }
    };

    loadTimetableSettings();
  }, [academyId]); // academyId 변경 시에만 호출

  // 선택된 요일에 따라 시간대 업데이트 (로컬 상태만 변경, API 호출 없음)
  useEffect(() => {
    if (!timetableSettings) return;

    const intervalLabel = timetableSettings.timeInterval || '1시간';

    // 선택된 요일의 시간 설정 사용 (없으면 기본 08:00~20:00)
    const daySettings = timetableSettings.dayTimeSettings?.[selectedDay] || {
      startTime: '오전 08:00',
      endTime: '오후 08:00',
    };

    // startTime과 endTime 필드명 확인 (startTime/start_time 모두 지원)
    const startTime = daySettings.startTime || daySettings.start_time || '오전 08:00';
    const endTime = daySettings.endTime || daySettings.end_time || '오후 08:00';

    const slots = generateTimeSlotsFromSettings(
      startTime,
      endTime,
      intervalLabel
    );
    setTimeSlots(slots);
    setAvailableTimeSlots(slots);
  }, [timetableSettings, selectedDay]); // timetableSettings와 selectedDay 변경 시에만 로컬 상태 업데이트

  // 다른 요일 선택 시 10분 후 오늘 요일로 자동 복귀 타이머
  useEffect(() => {
    const todayDay = getTodayDay();
    
    // 오늘 요일이면 타이머 설정하지 않음
    if (selectedDay === todayDay) {
      // 기존 타이머가 있으면 클리어
      if (autoReturnTimer) {
        clearTimeout(autoReturnTimer);
        setAutoReturnTimer(null);
      }
      setShowReturnDialog(false);
      return;
    }

    // 다른 요일을 선택한 경우, 기존 타이머 클리어
    if (autoReturnTimer) {
      clearTimeout(autoReturnTimer);
    }

    // 10분(600000ms) 후 알림 다이얼로그 표시
    const timer = setTimeout(() => {
      setShowReturnDialog(true);
    }, 600000); // 10분

    setAutoReturnTimer(timer);

    // 컴포넌트 언마운트 또는 요일 변경 시 타이머 클리어
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay]); // selectedDay가 변경될 때마다 실행

  // 알림 다이얼로그 처리
  const handleReturnDialogConfirm = () => {
    const todayDay = getTodayDay();
    setSelectedDay(todayDay);
    setShowReturnDialog(false);
    if (autoReturnTimer) {
      clearTimeout(autoReturnTimer);
      setAutoReturnTimer(null);
    }
  };

  const handleReturnDialogCancel = () => {
    setShowReturnDialog(false);
    // 타이머 리셋: 다시 10분 후 알림 표시
    const timer = setTimeout(() => {
      setShowReturnDialog(true);
    }, 600000);
    setAutoReturnTimer(timer);
  };

  const fields = [
    // 요일 선택을 맨 위로 배치
    { name: 'schedule', label: '요일', required: true, type: 'select' },
    { name: 'class_type', label: '수업 유형', required: true, type: 'select' },
    { name: 'subject_id', label: '과목', required: true, type: 'select' },
    { name: 'teacher_id', label: '선생님', required: true, type: 'select' },
    { name: 'classroom_id', label: '강의실', required: true, type: 'select' },
    { name: 'name', label: '강의 명', required: true, maxLength: 20 },
    { name: 'level', label: '레벨', required: true },
    // 시작 시간은 시/분을 나눠서 선택할 수 있는 커스텀 필드
    { name: 'start_time', label: '시작 시간', required: true, type: 'custom' },
    // 종료 시간은 드롭다운이 아닌 자동 계산 읽기 전용 필드
    { name: 'end_time', label: '종료 시간', required: true, type: 'text', readOnly: true },
    { name: 'max_students', label: '정원', required: true, type: 'number' },
  ];

  // 결제 방법 로드
  useEffect(() => {
    const loadPaymentMethods = () => {
      try {
        const saved = localStorage.getItem('paymentMethods');
        if (saved) {
          setPaymentMethods(JSON.parse(saved));
        } else {
          // 기본값 설정
          const defaultMethods = ['월납', '일시불', '분할납', '회차별'];
          setPaymentMethods(defaultMethods);
          localStorage.setItem('paymentMethods', JSON.stringify(defaultMethods));
        }
      } catch (error) {
        console.error('결제 방법 로드 실패:', error);
        setPaymentMethods(['월납', '일시불', '분할납', '회차별']);
      }
    };
    loadPaymentMethods();
  }, []);

  // 수강료 로드
  useEffect(() => {
    const loadTuitionFees = async () => {
      if (!academyId) return;
      
      try {
        const response = await tuitionFeeService.getAll(academyId);
        const fees = response.fees || response.data?.fees || [];
        
        if (fees && fees.length > 0) {
          const formattedFees = fees.map(fee => ({
            id: fee.id,
            amount: fee.amount,
            value: fee.value ? fee.value.toString() : String(fee.value || '0'),
            class_type: fee.class_type || null,
            payment_method: fee.payment_method || null
          }));
          setTuitionFees(formattedFees);
        } else {
          // DB에 수강료가 없으면 로컬 스토리지에서 로드
          try {
            const saved = localStorage.getItem('tuitionFees');
            if (saved) {
              const localFees = JSON.parse(saved);
              setTuitionFees(Array.isArray(localFees) ? localFees : []);
            }
          } catch (localError) {
            console.error('로컬 스토리지 로드 실패:', localError);
          }
        }
      } catch (error) {
        console.error('수강료 목록 로드 실패:', error);
        // 에러 발생 시 로컬 스토리지에서 로드 (폴백)
        try {
          const saved = localStorage.getItem('tuitionFees');
          if (saved) {
            const localFees = JSON.parse(saved);
            setTuitionFees(Array.isArray(localFees) ? localFees : []);
          }
        } catch (localError) {
          console.error('로컬 스토리지 로드 실패:', localError);
        }
      }
    };
    
    if (academyId && !academyLoading) {
      loadTuitionFees();
    }
  }, [academyId, academyLoading]);

  // 통계 업데이트
  useEffect(() => {
    setStats({
      todayStatus: 0,
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalClasses: classes.length,
    });
  }, [students, teachers, classes]);

  // 담당 선생님의 출근 요일 필터링
  const availableDays = useMemo(() => {
    if (!studentFormData.teacher_id) {
      return days;
    }
    const selectedTeacher = teachers.find(t => t.id === studentFormData.teacher_id);
    if (!selectedTeacher || !selectedTeacher.work_days) {
      return days;
    }
    // work_days가 쉼표로 구분된 문자열인 경우 (예: "월,화,수")
    const workDaysArray = selectedTeacher.work_days.split(',').map(d => d.trim());
    return days.filter(d => workDaysArray.includes(d));
  }, [teachers, studentFormData.teacher_id]);

  // 담당 선생님과 요일에 따라 필터링된 수업 목록
  const filteredClasses = useMemo(() => {
    if (!studentFormData.teacher_id) {
      return classes;
    }
    // 선생님과 요일 모두 필터링
    let filtered = classes.filter(classItem => classItem.teacher_id === studentFormData.teacher_id);
    if (studentFormData.schedule) {
      filtered = filtered.filter(classItem => classItem.schedule === studentFormData.schedule);
    }
    return filtered;
  }, [classes, studentFormData.teacher_id, studentFormData.schedule]);

  // AcademyContext의 academyId가 준비되면 데이터 로드
  useEffect(() => {
    if (academyId && !academyLoading) {
      console.log('🚀 Classes 페이지 초기 로드 시작 - academyId:', academyId);
      // 강의실을 먼저 로드한 후 수업 로드
      loadClassrooms().then((loadedClassrooms) => {
        console.log('✅ 강의실 로드 완료, 수업 로드 시작');
        console.log('📋 로드된 강의실:', loadedClassrooms?.map(c => ({ id: c.id, name: c.name })) || '없음');
        console.log('📋 로드된 강의실 개수:', loadedClassrooms?.length || 0);
        // 로드된 강의실 목록을 파라미터로 전달
        if (loadedClassrooms && loadedClassrooms.length > 0) {
          console.log('✅ 강의실이 있으므로 수업 로드 시작');
          loadClasses(loadedClassrooms);
        } else {
          console.warn('⚠️ 로드된 강의실이 없습니다. 설정 페이지에서 강의실을 선택해주세요.');
          loadClasses();
        }
      }).catch((error) => {
        console.error('❌ 강의실 로드 실패:', error);
        loadClasses();
      });
      loadSubjects();
      loadTeachers();
      loadStudents();
    }
  }, [academyId, academyLoading]);

  // 다른 페이지에서 수업 변경 시 자동 새로고침
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'classesPageRefresh' && academyId && !academyLoading) {
        console.log('🔄 다른 페이지에서 수업 변경 감지, Classes 페이지 새로고침');
        loadClassrooms().then((loadedClassrooms) => {
          if (loadedClassrooms && loadedClassrooms.length > 0) {
            loadClasses(loadedClassrooms);
          } else {
            loadClasses();
          }
        }).catch(() => {
          loadClasses();
        });
      }
    };

    // storage 이벤트 리스너 등록 (다른 탭/창에서의 변경 감지)
    window.addEventListener('storage', handleStorageChange);

    // 같은 페이지에서의 변경 감지 (polling 방식)
    const interval = setInterval(() => {
      const refreshTime = localStorage.getItem('classesPageRefresh');
      if (refreshTime && academyId && !academyLoading) {
        const lastRefresh = parseInt(refreshTime);
        const now = Date.now();
        // 1초 이내의 변경만 처리 (너무 자주 새로고침 방지)
        if (now - lastRefresh < 1000) {
          console.log('🔄 수업 변경 감지, Classes 페이지 새로고침');
          loadClassrooms().then((loadedClassrooms) => {
            if (loadedClassrooms && loadedClassrooms.length > 0) {
              loadClasses(loadedClassrooms);
            } else {
              loadClasses();
            }
          }).catch(() => {
            loadClasses();
          });
          // 처리 후 플래그 제거
          localStorage.removeItem('classesPageRefresh');
        }
      }
    }, 500); // 0.5초마다 확인

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [academyId, academyLoading]);

  // URL 파라미터로 모달 자동 열기
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'register' && academyId && !academyLoading && !isModalOpen) {
      setIsModalOpen(true);
      // URL에서 파라미터 제거
      setSearchParams({});
    }
  }, [academyId, academyLoading, searchParams, setSearchParams, isModalOpen]);

  // 학생 등록 모달이 열릴 때 학부모 연락처 자동 생성
  useEffect(() => {
    if (isStudentRegisterModalOpen && !studentFormData.parent_contact) {
      setStudentFormData(prev => ({
        ...prev,
        parent_contact: generateParentContact()
      }));
    }
  }, [isStudentRegisterModalOpen]);

  // 시간표 설정이 변경되면 강의실 목록 다시 로드
  useEffect(() => {
    if (academyId) {
      // 설정 변경 감지를 위해 주기적으로 확인하거나, 페이지 포커스 시 확인
      const checkSettings = async () => {
        try {
          const settingsResponse = await timetableSettingsService.get(academyId);
          if (settingsResponse.settings && settingsResponse.settings.classroom_ids) {
            await loadClassrooms();
          }
        } catch (error) {
          console.warn('설정 확인 실패:', error);
        }
      };
      
      // 페이지 포커스 시 설정 확인
      const handleFocus = () => {
        checkSettings();
      };
      
      window.addEventListener('focus', handleFocus);
      
      // 초기 로드
      checkSettings();
      
      return () => {
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [academyId]);

  const loadClassrooms = async () => {
    if (!academyId) return [];
    try {
      // 먼저 DB에서 모든 강의실 가져오기
      const response = await classroomService.getAll(academyId);
      const dbClassrooms = response.data.classrooms || [];
      console.log('📋 DB에서 로드된 전체 강의실 목록:', dbClassrooms.map(c => ({ id: c.id, name: c.name })));
      // 시간표 설정에서 강의실 ID 가져오기 (DB 기준)
      let settingsClassroomIds = [];
      try {
        const settingsResponse = await timetableSettingsService.get(academyId);
        if (settingsResponse.settings && Array.isArray(settingsResponse.settings.classroom_ids)) {
          settingsClassroomIds = settingsResponse.settings.classroom_ids;
          console.log('✅ DB 시간표 설정에서 강의실 ID 로드:', settingsClassroomIds);
        }
        // 관 이름 로드
        if (settingsResponse.settings?.building_names) {
          if (Array.isArray(settingsResponse.settings.building_names)) {
            setBuildingNames(settingsResponse.settings.building_names);
          } else if (settingsResponse.settings.building_names.building1 || settingsResponse.settings.building_names.building2) {
            // 레거시 형식 (객체)을 배열로 변환
            const buildings = [];
            if (settingsResponse.settings.building_names.building1) {
              buildings.push({ id: 1, name: settingsResponse.settings.building_names.building1 });
            }
            if (settingsResponse.settings.building_names.building2) {
              buildings.push({ id: 2, name: settingsResponse.settings.building_names.building2 });
            }
            if (buildings.length > 0) {
              setBuildingNames(buildings);
            }
          }
        }
      } catch (settingsError) {
        console.warn('⚠️ 시간표 설정 로드 실패:', settingsError);
      }

      if (settingsClassroomIds.length === 0) {
        console.warn('⚠️ 시간표 설정에 강의실이 없습니다. 설정 페이지에서 강의실을 먼저 설정해주세요.');
        setClassrooms([]);
        return [];
      }

      // 설정에 저장된 강의실 ID로만 필터링 (순서 유지)
      const matchedClassrooms = settingsClassroomIds
        .map((id) => {
          const found = dbClassrooms.find((c) => c.id === id);
          if (!found) {
            console.warn(`⚠️ 시간표 설정에 있는 강의실 ID를 DB에서 찾을 수 없습니다: ${id}`);
          }
          return found;
        })
        .filter(Boolean);

      console.log('✅ 최종 사용 강의실 (설정 + DB 기준):', matchedClassrooms.map((c) => ({ id: c.id, name: c.name })));
      setClassrooms(matchedClassrooms);
      return matchedClassrooms;
    } catch (error) {
      console.error('강의실 목록 로드 실패:', error);
      return []; // 에러 발생 시 빈 배열 반환
    }
  };

  const loadSubjects = async () => {
    if (!academyId) return;
    try {
      const response = await subjectService.getAll(academyId);
      setSubjects(response.data.subjects || []);
    } catch (error) {
      console.error('과목 목록 로드 실패:', error);
    }
  };

  const loadTeachers = async () => {
    if (!academyId) return;
    try {
      const response = await teacherService.getAll(academyId);
      setTeachers(response.data.teachers || []);
    } catch (error) {
      console.error('선생님 목록 로드 실패:', error);
    }
  };

  const loadStudents = async () => {
    if (!academyId) return;
    try {
      const response = await studentService.getAll(academyId);
      const loadedStudents = response.data?.students || response.data || [];
      setStudents(loadedStudents);
      console.log('✅ 학생 목록 로드 성공:', loadedStudents.length, '명');
    } catch (error) {
      console.error('학생 목록 로드 실패:', error);
    }
  };

  const loadClasses = async (currentClassrooms = null) => {
    if (!academyId) {
      console.warn('⚠️ 학원 ID가 없습니다.');
      setClasses([]);
      return;
    }
    
    try {
      setLoading(true);
      console.log('📚 수업 목록 로드 시도 - academy_id:', academyId);
      console.log('📚 API 호출 URL:', `/api/classes?academy_id=${academyId}`);
      
      // 강의실 목록을 항상 최신 상태로 갱신 (수업의 classroom_id가 최신 강의실 목록에 있을 수 있음)
      console.log('🔄 강의실 목록 최신 상태로 갱신 중...');
      const loadedRooms = await loadClassrooms();
      let roomsToUse = loadedRooms || currentClassrooms || classrooms;
      
      // 강의실 목록 상태 업데이트 (항상 최신 상태로 유지)
      if (loadedRooms && loadedRooms.length > 0) {
        setClassrooms(loadedRooms);
        console.log('✅ 강의실 목록 갱신 완료:', loadedRooms.length, '개');
        roomsToUse = loadedRooms;
      } else if (currentClassrooms && currentClassrooms.length > 0) {
        setClassrooms(currentClassrooms);
        console.log('📋 파라미터로 전달된 강의실 목록 사용 및 상태 업데이트:', currentClassrooms.length, '개');
        roomsToUse = currentClassrooms;
      } else if (classrooms && classrooms.length > 0) {
        roomsToUse = classrooms;
        console.log('📋 상태의 강의실 목록 사용:', classrooms.length, '개');
      } else {
        console.warn('⚠️ 강의실 목록이 비어있습니다.');
      }
      
      console.log('📡 API 호출 전 - academyId:', academyId);
      console.log('📡 API 호출 URL:', `/api/classes?academy_id=${academyId}`);
      
      const response = await classService.getAll(academyId);
      console.log('📥 전체 서버 응답:', response);
      console.log('📥 서버 응답 데이터:', JSON.stringify(response.data, null, 2));
      console.log('📥 서버 응답 상태:', response.status);
      
      let loadedClasses = response.data?.classes || [];
      console.log('✅ 수업 목록 로드 성공:', loadedClasses.length, '개');
      
      if (loadedClasses.length === 0) {
        console.warn('⚠️ 수업이 0개입니다. 확인 필요:');
        console.warn('   - academyId:', academyId);
        console.warn('   - 서버 응답:', response.data);
        console.warn('   - 서버 터미널 로그를 확인하세요.');
      }
      
      if (loadedClasses.length > 0) {
        console.log('📋 로드된 수업 상세:', loadedClasses);
        console.log('📋 첫 번째 수업:', loadedClasses[0]);
      } else {
        console.warn('⚠️ 수업이 0개입니다.');
        console.warn('⚠️ 서버 응답 전체:', JSON.stringify(response.data, null, 2));
        console.warn('⚠️ academy_id:', academyId);
        
        // 서버에 직접 쿼리해서 확인
        console.log('🔍 디버깅: 서버 터미널에서 에러 로그를 확인하세요.');
      }
      
      // 현재 강의실 목록 사용 (위에서 이미 로드했거나 파라미터로 전달된 것 사용)
      // roomsToUse는 위에서 이미 설정됨
      console.log('📋 사용할 classrooms:', roomsToUse.length, '개');
      console.log('📋 강의실 목록:', roomsToUse.map(c => ({ id: c.id, name: c.name })));
      
      // displayClassrooms 계산 (최신 classrooms 기반)
      // 수업이 참조하는 강의실을 우선적으로 포함하도록 보장
      const usedClassroomIds = new Set(loadedClasses.map(c => c.classroom_id).filter(Boolean));
      const usedClassrooms = roomsToUse.filter(c => usedClassroomIds.has(c.id));
      const unusedClassrooms = roomsToUse.filter(c => !usedClassroomIds.has(c.id));
      
      // 수업이 사용하는 강의실을 먼저 포함하고, 나머지를 추가 (최대 5개)
      const currentDisplayClassrooms = [
        ...usedClassrooms,
        ...unusedClassrooms
      ].slice(0, 5);
      
      // 강의실이 5개 미만이면 기본 강의실 추가
      if (currentDisplayClassrooms.length < 5) {
        const defaultRooms = Array.from({ length: 5 - currentDisplayClassrooms.length }, (_, i) => ({
          id: `room-${currentDisplayClassrooms.length + i + 1}`,
          name: `강의실 ${currentDisplayClassrooms.length + i + 1}`
        }));
        currentDisplayClassrooms.push(...defaultRooms);
      }
      
      console.log('📋 displayClassrooms 계산 완료:', {
        수업이사용하는강의실: usedClassrooms.map(c => ({ id: c.id, name: c.name })),
        사용하지않는강의실: unusedClassrooms.map(c => ({ id: c.id, name: c.name })),
        최종displayClassrooms: currentDisplayClassrooms.map(c => ({ id: c.id, name: c.name }))
      });
      
      console.log('🔍 변환 전 수업 목록:', loadedClasses.map(c => ({ name: c.name, classroom_id: c.classroom_id, start_time: c.start_time })));
      console.log('🔍 현재 displayClassrooms:', currentDisplayClassrooms.map(c => ({ id: c.id, name: c.name })));
      console.log('🔍 현재 classrooms:', roomsToUse.map(c => ({ id: c.id, name: c.name })));
      
      // 수업이 참조하는 모든 강의실 ID 수집 (기존 수업 로드 시에만 실행)
      const allClassroomIds = new Set(loadedClasses.map(cls => cls.classroom_id).filter(Boolean));
      const missingClassroomIds = Array.from(allClassroomIds).filter(id => 
        !roomsToUse.find(c => c.id === id)
      );
      
      // 강의실 목록에 없는 강의실들을 서버에서 가져오기 (기존 수업이 참조하는 강의실)
      if (missingClassroomIds.length > 0) {
        console.log('🔍 강의실 목록에 없는 강의실 ID 발견 (기존 수업이 참조하는 강의실):', missingClassroomIds);
        console.log('   수업이 참조하는 강의실을 서버에서 가져오는 중...');
        
        try {
          // 모든 강의실 다시 로드 (수업이 참조하는 강의실이 포함되도록)
          const allClassroomsResponse = await classroomService.getAll(academyId);
          const allClassrooms = allClassroomsResponse.data.classrooms || [];
          
          // 누락된 강의실 찾기
          const missingClassrooms = allClassrooms.filter(c => missingClassroomIds.includes(c.id));
          
          if (missingClassrooms.length > 0) {
            console.log('✅ 누락된 강의실 찾음:', missingClassrooms.map(c => ({ id: c.id, name: c.name })));
            // 강의실 목록에 추가
            roomsToUse = [...roomsToUse, ...missingClassrooms];
            setClassrooms(roomsToUse);
            console.log('✅ 강의실 목록 업데이트 완료:', roomsToUse.length, '개');
            console.log('📋 업데이트된 강의실 목록:', roomsToUse.map(c => ({ id: c.id, name: c.name })));
          } else {
            console.warn('⚠️ 누락된 강의실을 서버에서 찾지 못함:', missingClassroomIds);
          }
        } catch (error) {
          console.error('❌ 누락된 강의실 로드 실패:', error);
        }
      }
      
      // UUID를 이름으로 변환하지 않고, 원본 UUID를 유지하면서 classroom_name 속성 추가
      // 이렇게 하면 getClassForSlot에서 UUID 매칭이 정상 작동함
      loadedClasses = loadedClasses.map(cls => {
        // classroom_id가 없는 경우 경고 및 기본값 설정
        if (!cls.classroom_id) {
          console.warn('⚠️ classroom_id가 없는 수업 발견:', {
            id: cls.id,
            name: cls.name,
            start_time: cls.start_time
          });
          
          // 첫 번째 강의실을 기본값으로 사용
          if (roomsToUse.length > 0) {
            console.warn('   첫 번째 강의실을 기본값으로 사용:', roomsToUse[0].id);
            cls.classroom_id = roomsToUse[0].id;
            cls.classroom_name = roomsToUse[0].name;
            return cls;
          }
        }
        
        // classroom_id가 UUID인 경우, 강의실 이름을 찾아서 classroom_name 속성에 추가
        if (cls.classroom_id) {
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(cls.classroom_id));
          
          if (isUUID) {
            const classroom = roomsToUse.find(c => c.id === cls.classroom_id);
            if (classroom) {
              // 원본 UUID는 유지하고, 이름은 별도 속성으로 추가
              return { ...cls, classroom_name: classroom.name };
            } else {
              // 강의실을 찾을 수 없으면 경고만 출력 (이미 위에서 로드 시도함)
              console.warn('⚠️ 수업의 classroom_id에 해당하는 강의실을 찾을 수 없음 (서버에서도 찾지 못함):', {
                수업명: cls.name,
                classroom_id: cls.classroom_id,
                강의실목록: roomsToUse.map(c => ({ id: c.id, name: c.name }))
              });
              
              // classroom_id는 유지하되, 이름은 "알 수 없음"으로 설정
              return { ...cls, classroom_name: `강의실 (ID: ${cls.classroom_id.substring(0, 8)}...)` };
            }
          } else if (String(cls.classroom_id).startsWith('temp-')) {
            // temp- 형식 처리
            const tempIndex = parseInt(String(cls.classroom_id).replace('temp-', ''));
            const classroom = currentDisplayClassrooms[tempIndex] || roomsToUse[tempIndex];
            if (classroom) {
              return { ...cls, classroom_name: classroom.name };
            }
          }
        }
        
        return cls;
      });
      
      console.log('✅ 수업 목록 처리 완료 (UUID 유지, 이름 추가)');
      console.log('🔍 처리 후 수업 목록:', loadedClasses.map(c => ({ 
        name: c.name, 
        classroom_id: c.classroom_id, 
        classroom_name: c.classroom_name,
        start_time: c.start_time 
      })));
      
      if (loadedClasses.length > 0) {
        console.log('📋 로드된 수업 목록:', loadedClasses.map(c => ({
          id: c.id,
          name: c.name,
          start_time: c.start_time,
          classroom_id: c.classroom_id
        })));
      }
      
      // 수업 목록 상태 업데이트
      setClasses(loadedClasses);
      
      // 강의실 목록도 확실히 업데이트 (렌더링 반영을 위해)
      if (roomsToUse && roomsToUse.length > 0) {
        setClassrooms(roomsToUse);
        console.log('✅ 강의실 목록 상태 최종 업데이트:', roomsToUse.length, '개');
      }
    } catch (error) {
      console.error('❌ 수업 목록 로드 실패:', error);
      console.error('에러 상세:', error.response?.data);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setEditingClass(null);
    setSelectedTimeSlot(null);
    setSelectedClassroom(null);
    
    // 모달이 열릴 때 강의실 목록을 최신 상태로 갱신
    console.log('🔄 모달 열림: 강의실 목록 최신화 중...');
    const freshClassrooms = await loadClassrooms();
    if (freshClassrooms && freshClassrooms.length > 0) {
      setClassrooms(freshClassrooms);
      console.log('✅ 강의실 목록 갱신 완료:', freshClassrooms.length, '개');
    }
    
    // 초기 폼 데이터 설정 (시작 시간이 있으면 종료 시간 자동 계산)
    const initialStartTime = availableTimeSlots[0] || timeSlots[0];
    const initialEndTime = initialStartTime ? calculateEndTime(initialStartTime) : null;
    setFormData({
      schedule: selectedDay,
      start_time: initialStartTime || null,
      end_time: initialEndTime || null
    });
    setIsModalOpen(true);
  };

  const handleAddClass = async (timeSlot, classroomId) => {
    setSelectedTimeSlot(timeSlot);
    
    // 모달이 열릴 때 강의실 목록을 최신 상태로 갱신
    console.log('🔄 모달 열림 (시간표 클릭): 강의실 목록 최신화 중...');
    const freshClassrooms = await loadClassrooms();
    if (freshClassrooms && freshClassrooms.length > 0) {
      setClassrooms(freshClassrooms);
      console.log('✅ 강의실 목록 갱신 완료:', freshClassrooms.length, '개');
    }
    
    // classroomId는 이미 유효한 DB 강의실 ID라고 가정 (displayClassrooms 기반)
    setSelectedClassroom(classroomId);
    setEditingClass(null);
    // 초기 폼 데이터 설정
    const initialStartTime = timeSlot || availableTimeSlots[0] || timeSlots[0];
    const initialEndTime = calculateEndTime(initialStartTime);
    setFormData({
      schedule: selectedDay,
      classroom_id: classroomId,
      start_time: initialStartTime,
      end_time: initialEndTime || null
    });
    setIsModalOpen(true);
  };

  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    // 편집 시 폼 데이터 설정
    setFormData({
      subject_id: classItem.subject_id,
      teacher_id: classItem.teacher_id,
      schedule: classItem.schedule || selectedDay,
      classroom_id: classItem.classroom_id,
      name: classItem.name,
      level: classItem.level,
      start_time: classItem.start_time,
      end_time: classItem.end_time,
      max_students: classItem.max_students,
      class_type: classItem.class_type || '단체반'
    });
    setIsModalOpen(true);
  };

  // 수업 카드 클릭 시, 해당 수업에 등록된 학생 목록 모달 열기
  const handleOpenStudentList = async (classItem) => {
    try {
      if (!academyId) {
        alert('학원 정보를 불러올 수 없습니다. 페이지를 새로고침해주세요.');
        return;
      }

      setSelectedClassForStudents(classItem);

      console.log('👀 수업별 학생 목록 조회 시작:', {
        classId: classItem.id,
        className: classItem.name,
        academyId,
      });

      let sourceStudents = students;

      // 아직 학생 목록이 로드되지 않았다면 한 번 로드
      if (!sourceStudents || sourceStudents.length === 0) {
        const response = await studentService.getAll(academyId);
        sourceStudents = response.data?.students || response.data || [];
        setStudents(sourceStudents);
      }

      const classStudents = sourceStudents.filter(
        (student) => student.class_id === classItem.id
      );

      // enrollment 정보 가져오기
      try {
        const enrollmentResponse = await enrollmentService.getAll(classItem.id);
        const enrollments = enrollmentResponse.data?.enrollments || enrollmentResponse.data || [];
        
        // 각 학생에 enrollment_id 매핑
        const studentsWithEnrollment = classStudents.map(student => {
          const enrollment = enrollments.find(
            (enr) => enr.student_id === student.id && enr.class_id === classItem.id
          );
          return {
            ...student,
            enrollment_id: enrollment?.id || null,
          };
        });

        console.log('✅ 해당 수업 수강 학생 수:', studentsWithEnrollment.length);
        setEnrolledStudents(studentsWithEnrollment);
      } catch (enrollmentError) {
        console.warn('⚠️ enrollment 정보 조회 실패, enrollment_id 없이 진행:', enrollmentError);
        // enrollment 정보가 없어도 진행
        setEnrolledStudents(classStudents);
      }

      setIsStudentModalOpen(true);
    } catch (error) {
      console.error('❌ 수업별 학생 목록 조회 실패:', error);
      alert('수업에 등록된 학생 목록을 불러오지 못했습니다.');
    }
  };

  const handleDelete = async (classItem, e) => {
    // 이벤트 전파 방지 (카드 클릭 이벤트와 충돌 방지)
    e.stopPropagation();
    
    // 확인 대화상자
    const confirmed = window.confirm(`"${classItem.name}" 수업을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`);
    
    if (!confirmed) {
      return;
    }
    
    try {
      console.log('🗑️ 수업 삭제 시도:', classItem.id, classItem.name);
      
      await classService.delete(classItem.id);
      
      console.log('✅ 수업 삭제 완료');
      alert('수업이 삭제되었습니다.');
      
      // 수업 목록 다시 로드
      await loadClasses();
      
      // TeacherDetail 페이지에 변경 알림
      localStorage.setItem('teacherDetailPageRefresh', Date.now().toString());
    } catch (error) {
      console.error('❌ 수업 삭제 실패:', error);
      console.error('에러 상세:', error.response?.data || error.message);
      
      // 에러 메시지 추출 (다양한 형식 지원)
      let errorMessage = '삭제에 실패했습니다.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
        } else if (errorData.message) {
          errorMessage = typeof errorData.message === 'string' ? errorData.message : JSON.stringify(errorData.message);
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // 외래 키 제약 조건 에러인 경우 친절한 메시지
      if (errorMessage.includes('foreign key constraint') || errorMessage.includes('외래 키')) {
        errorMessage = '해당 수업에 등록된 학생이 있어 삭제할 수 없습니다.\n\n먼저 학생 관리 페이지에서 해당 수업의 학생들을 다른 수업으로 이동하거나 삭제해주세요.';
      }
      
      alert(`삭제에 실패했습니다.\n\n${errorMessage}`);
    }
  };

  // 시작 시간에서 설정된 수업 시간 간격만큼 더한 종료 시간 계산
  const calculateEndTime = (startTime) => {
    if (!startTime) {
      console.warn('⚠️ 시작 시간이 없습니다.');
      return null;
    }
    
    // 설정에서 수업 시간 간격 가져오기 (DB/로컬 스토리지 양쪽 키 모두 지원)
    const interval =
      timetableSettings?.timeInterval ||
      timetableSettings?.time_interval ||
      '1시간';
    console.log('📐 사용할 시간 간격:', interval);
    const intervalMinutes = getIntervalMinutes(interval);
    console.log('📐 시간 간격(분):', intervalMinutes);
    
    // 시작 시간 문자열을 분으로 변환
    const parseTimeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    // 시작 시간을 분으로 변환
    const startMinutes = parseTimeToMinutes(startTime);
    // 종료 시간 계산 (시작 시간 + 간격) - 시간표 행(availableTimeSlots)와 무관하게 정확히 계산
    const endMinutes = startMinutes + intervalMinutes;
    
    // 분을 시간 문자열로 변환
    const formatMinutesToTime = (totalMinutes) => {
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };
    
    const calculatedEndTime = formatMinutesToTime(endMinutes);
    console.log('📊 계산:', { startTime, startMinutes, intervalMinutes, endMinutes, calculatedEndTime });
    
    // 더 이상 시간표 행에 맞추지 않고, 계산된 값을 그대로 사용
    console.log('✅ 종료 시간 (간격 그대로 적용):', calculatedEndTime);
    return calculatedEndTime;
  };

  // "HH:MM" 형식의 시간을 분 단위 숫자로 변환
  const parseHHMMToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
  };

  // 폼 데이터 변경 핸들러
  const handleFormChange = (name, value, allData) => {
    console.log('🔄 폼 데이터 변경:', { name, value, allData });
    const newData = { ...allData };
    
    // 수업 유형이 변경되면 정원 자동 설정
    if (name === 'class_type' && value) {
      if (value === '2대1레슨') {
        newData.max_students = 2;
      } else if (value === '개인 레슨') {
        newData.max_students = 1;
      }
      // 단체반의 경우 정원은 사용자가 직접 입력
    }
    
    // 시작 시간이 변경되면 종료 시간 자동 계산
    if (name === 'start_time' && value) {
      console.log('⏰ 시작 시간 변경됨:', value);
      console.log('📋 현재 시간표 설정:', timetableSettings);
      console.log('📋 사용 가능한 시간대:', availableTimeSlots);
      
      const calculatedEndTime = calculateEndTime(value);
      console.log('✅ 계산된 종료 시간:', calculatedEndTime);
      
      if (calculatedEndTime) {
        newData.end_time = calculatedEndTime;
        console.log('✅ 종료 시간 자동 설정:', calculatedEndTime);
      } else {
        console.warn('⚠️ 종료 시간 계산 실패');
      }
    }
    
    console.log('📝 업데이트할 폼 데이터:', newData);
    setFormData(newData);
  };

  const handleSubmit = async (data) => {
    console.log('🚀 handleSubmit 함수 시작!');
    console.log('🚀 받은 데이터:', data);
    
    try {
      // 학원 ID 자동 추가 (AcademyContext에서 가져옴)
      if (!academyId) {
        console.error('❌ academyId가 없습니다!');
        alert('학원 정보를 불러올 수 없습니다. 페이지를 새로고침해주세요.');
        return;
      }
      
      console.log('✅ academyId 확인:', academyId);
      data.academy_id = academyId;
      
      // 요일 정보가 비어있으면 현재 선택된 요일로 설정
      if (!data.schedule) {
        data.schedule = selectedDay;
      }
      
      // 가장 먼저 최신 강의실 목록을 로드하여 동기화
      console.log('🔄 최신 강의실 목록 로드 중...');
      const latestClassrooms = await loadClassrooms();
      if (latestClassrooms && latestClassrooms.length > 0) {
        setClassrooms(latestClassrooms);
        console.log('✅ 최신 강의실 목록 로드 완료:', latestClassrooms.map(c => ({ id: c.id, name: c.name })));
      } else {
        console.error('❌ 강의실 목록을 로드할 수 없습니다.');
        alert('강의실 목록을 불러올 수 없습니다. 페이지를 새로고침해주세요.');
        return;
      }
      
      console.log('📝 수업 저장 시도 - 폼 데이터:', data);
      console.log('📝 선택된 시간:', selectedTimeSlot);
      console.log('📝 선택된 강의실:', selectedClassroom);
      console.log('📝 data.classroom_id (초기값):', data.classroom_id);
      
      // 시간 정보 추가 (새 수업인 경우)
      if (selectedTimeSlot && !editingClass) {
        data.start_time = selectedTimeSlot;
      }
      
      // 강의실 ID 처리: 폼에서 선택한 classroom_id를 우선 사용 (DB ID 기준)
      if (data.classroom_id) {
        console.log('📝 폼에서 선택한 classroom_id:', data.classroom_id);
        
        // UUID 형식인지 확인
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(data.classroom_id));
        
        if (!isUUID) {
          alert('잘못된 강의실 ID입니다. 페이지를 새로고침 후 다시 시도해주세요.');
          return;
        }
      } else if (selectedClassroom && !editingClass) {
        // 폼에서 선택하지 않았지만 selectedClassroom이 있는 경우 (시간표에서 클릭한 경우)
        console.log('📝 selectedClassroom 사용:', selectedClassroom);
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(selectedClassroom));
        if (isUUID) {
          const foundClassroom = latestClassrooms.find(c => c.id === selectedClassroom);
          if (foundClassroom) {
            data.classroom_id = foundClassroom.id;
            console.log('✅ selectedClassroom에서 강의실 확인:', foundClassroom.id, foundClassroom.name);
          } else {
            console.error('❌ selectedClassroom을 최신 강의실 목록에서 찾을 수 없음:', selectedClassroom);
            console.error('   최신 강의실 목록:', latestClassrooms.map(c => ({ id: c.id, name: c.name })));
            alert(`선택한 강의실을 찾을 수 없습니다.\n\n강의실 ID: ${selectedClassroom}\n\n다른 강의실을 선택하거나 페이지를 새로고침해주세요.`);
            return;
          }
        } else {
          data.classroom_id = selectedClassroom;
        }
      }

      // 임시 강의실 ID(temp-/room-)는 더 이상 사용하지 않으므로 처리 로직 제거

      // 최종 classroom_id 확인 및 검증
      if (!data.classroom_id) {
        alert('강의실을 선택해주세요.');
        return;
      }
      
      // 최종 classroom_id 검증 및 로깅
      console.log('🔍 최종 classroom_id (서버로 전송 예정):', data.classroom_id);

      // ===== 강의실/시간 겹침 검사 =====
      if (!data.start_time) {
        console.warn('⚠️ start_time이 없어 기본 시간으로 설정 후 검사합니다.');
        const fallbackStart =
          selectedTimeSlot || formData.start_time || availableTimeSlots[0] || timeSlots[0];
        data.start_time = fallbackStart;
      }

      if (!data.end_time && data.start_time) {
        const autoEnd = calculateEndTime(data.start_time);
        if (autoEnd) {
          data.end_time = autoEnd;
        }
      }

      if (data.start_time && data.end_time) {
        const newStart = parseHHMMToMinutes(data.start_time);
        const newEnd = parseHHMMToMinutes(data.end_time);
        const targetDay = data.schedule || selectedDay;

        if (newStart != null && newEnd != null) {
          const conflict = classes.find((cls) => {
            // 자신(수정 중인 수업)은 제외
            if (editingClass && cls.id === editingClass.id) return false;
            // 강의실이 다르면 패스
            if (!cls.classroom_id) return false;
            if (String(cls.classroom_id) !== String(data.classroom_id)) return false;
            // 요일이 다르면 패스 (cls.schedule이 없으면 같은 요일로 간주)
            if (cls.schedule && cls.schedule !== targetDay) return false;
            if (!cls.start_time || !cls.end_time) return false;

            const existStart = parseHHMMToMinutes(String(cls.start_time));
            const existEnd = parseHHMMToMinutes(String(cls.end_time));
            if (existStart == null || existEnd == null) return false;

            // 시간 겹침 여부: [start, end) 구간이 하나라도 겹치면 true
            return newStart < existEnd && existStart < newEnd;
          });

          if (conflict) {
            alert('강의실이 겹칩니다.\n\n같은 요일, 같은 강의실에 시간이 겹치는 수업이 이미 등록되어 있습니다.');
            return;
          }
        }
      }
      // ===== 강의실/시간 겹침 검사 끝 =====

      console.log('💾 수업 저장 시도:', data);
      console.log('💾 최종 classroom_id:', data.classroom_id);
      console.log('💾 academy_id:', data.academy_id);
      console.log('💾 전체 데이터:', JSON.stringify(data, null, 2));

      let savedClass;
      if (editingClass) {
        const response = await classService.update(editingClass.id, data);
        savedClass = response.data?.class || response.data;
        console.log('✅ 수업 수정 완료:', savedClass);
        alert('수정되었습니다.');
      } else {
        const response = await classService.create(data);
        savedClass = response.data?.class || response.data;
        console.log('✅ 수업 생성 완료:', savedClass);
        alert('생성되었습니다.');
      }
      
      setIsModalOpen(false);
      setEditingClass(null);
      setSelectedTimeSlot(null);
      setSelectedClassroom(null);
      setFormData({});
      
      // 강의실 목록 다시 로드
      const updatedClassrooms = await loadClassrooms();
      
      // 강의실 목록 상태 업데이트
      if (updatedClassrooms && updatedClassrooms.length > 0) {
        setClassrooms(updatedClassrooms);
      }
      
      // 수업 목록 다시 로드 (강의실 목록 전달)
      await loadClasses(updatedClassrooms);
      
      // TeacherDetail 페이지에 변경 알림
      localStorage.setItem('teacherDetailPageRefresh', Date.now().toString());
      
      // 강제 리렌더링을 위한 짧은 지연
      setTimeout(() => {
        console.log('🔄 화면 업데이트 완료');
      }, 100);
    } catch (error) {
      console.error('❌ 저장 실패:', error);
      console.error('에러 상세:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.message || '저장에 실패했습니다.';
      alert(`저장에 실패했습니다.\n\n에러: ${errorMessage}`);
    }
  };

  const getClassForSlot = (timeSlot, classroomId) => {
    if (classes.length === 0) {
      return null;
    }
    
    // 현재 classrooms 상태에서 강의실 찾기 (displayClassrooms 대신 실제 classrooms 사용)
    const actualClassroom = classrooms.find(c => c.id === classroomId);
    const displayClassroom = displayClassrooms.find(c => c.id === classroomId);
    
    // 강의실 이름 결정 (실제 강의실 우선, 없으면 displayClassroom 사용)
    const classroomName = actualClassroom?.name || displayClassroom?.name;
    
    // 현재 슬롯의 시작/종료 시각(분 단위) 계산 - 슬롯은 항상 정각 기준
    const slotStartMinutes = parseHHMMToMinutes(String(timeSlot));
    const slotEndMinutes = slotStartMinutes != null ? slotStartMinutes + 60 : null;
    
    // 디버깅: 매칭 시도 전 로그 (슬롯 구간 기준)
    const matchingClasses = classes.filter(cls => {
      // 요일이 다르면 제외
      if (cls.schedule && cls.schedule !== selectedDay) return false;
      const clsStart = parseHHMMToMinutes(String(cls.start_time || ''));
      const clsEnd = parseHHMMToMinutes(String(cls.end_time || ''));
      if (clsStart == null || clsEnd == null || slotStartMinutes == null || slotEndMinutes == null) return false;
      // 슬롯 구간 [slotStart, slotEnd)과 수업 구간이 겹치는지 확인
      return clsStart < slotEndMinutes && slotStartMinutes < clsEnd;
    });
    
    if (matchingClasses.length > 0 && !window._debugSlotMatch) {
      console.log('🔍 시간 매칭된 수업들:', {
        timeSlot,
        classroomId,
        classroomName: classroomName,
        actualClassroom: actualClassroom ? { id: actualClassroom.id, name: actualClassroom.name } : null,
        matchingClasses: matchingClasses.map(c => ({
          name: c.name,
          classroom_id: c.classroom_id,
          classroom_name: c.classroom_name,
          start_time: c.start_time
        }))
      });
      window._debugSlotMatch = true;
    }
    
    // 수업의 시작 시간이 해당 슬롯에 속하는 수업만 찾기
    const found = classes.find(cls => {
      // 요일 매칭: schedule이 설정되어 있으면 선택된 요일과 같을 때만 표시
      if (cls.schedule && cls.schedule !== selectedDay) {
        return false;
      }
      
      if (!cls.start_time || !cls.end_time) {
        return false;
      }
      
      const clsStart = parseHHMMToMinutes(String(cls.start_time));
      const clsEnd = parseHHMMToMinutes(String(cls.end_time));
      if (clsStart == null || clsEnd == null || slotStartMinutes == null || slotEndMinutes == null) {
        return false;
      }
      
      // 수업의 시작 시간이 이 슬롯 시간 범위에 속하는지 확인
      // 수업이 이 슬롯에서 시작해야 함 (시작 시간이 슬롯 범위 내)
      const startsInSlot = clsStart >= slotStartMinutes && clsStart < slotEndMinutes;
      if (!startsInSlot) {
        return false;
      }
      
      // 강의실 매칭 - 간단하고 확실한 비교
      const clsClassroomId = String(cls.classroom_id || '');
      const slotClassroomId = String(classroomId || '');
      
      // 가장 간단하고 확실한 매칭: 정확한 UUID 비교
      if (clsClassroomId === slotClassroomId) {
        return true;
      }
      
      // actualClassroom이 있고 수업의 classroom_id와 일치하는지 확인
      if (actualClassroom && clsClassroomId === String(actualClassroom.id)) {
        return true;
      }
      
      // displayClassroom이 있고 수업의 classroom_id와 일치하는지 확인
      if (displayClassroom && clsClassroomId === String(displayClassroom.id)) {
        return true;
      }
      
      return false;
    });
    
    // 매칭 성공 시 로그 (첫 번째만)
    if (found && !window._matchSuccessLogged) {
      console.log('✅ 수업 매칭 성공:', {
        수업명: found.name,
        시작시간: found.start_time,
        시간슬롯: timeSlot,
        수업의강의실ID: found.classroom_id,
        슬롯의강의실ID: classroomId,
        강의실명: found.classroom_name || classroomName
      });
      window._matchSuccessLogged = true;
    }
    
    // 매칭 실패 시 상세 디버깅 로그
    if (!found && matchingClasses.length > 0) {
      // 각 매칭 실패한 수업의 classroom_id와 현재 classroomId 비교
      const failedMatches = matchingClasses.map(c => {
        const clsId = String(c.classroom_id || '');
        const slotId = String(classroomId || '');
        const isExactMatch = clsId === slotId;
        const clsIsUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clsId);
        const slotIsUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slotId);
        
        // 수업의 classroom_id가 실제 classrooms 배열에 있는지 확인
        const clsClassroomInList = classrooms.find(cr => cr.id === clsId);
        const slotClassroomInList = classrooms.find(cr => cr.id === slotId);
        
        return {
          수업명: c.name,
          수업의강의실ID: clsId,
          슬롯의강의실ID: slotId,
          정확히일치: isExactMatch,
          수업ID는UUID: clsIsUUID,
          슬롯ID는UUID: slotIsUUID,
          classroom_name: c.classroom_name,
          수업의강의실이목록에있음: clsClassroomInList ? { id: clsClassroomInList.id, name: clsClassroomInList.name } : null,
          슬롯의강의실이목록에있음: slotClassroomInList ? { id: slotClassroomInList.id, name: slotClassroomInList.name } : null
        };
      });
      
      if (!window._matchFailLogged) {
        console.warn('⚠️ 시간은 매칭되지만 강의실이 매칭되지 않음:', {
          timeSlot,
          classroomId,
          classroomName: classroomName,
          actualClassroom: actualClassroom ? { id: actualClassroom.id, name: actualClassroom.name } : null,
          displayClassroom: displayClassroom ? { id: displayClassroom.id, name: displayClassroom.name } : null,
          매칭실패상세: failedMatches,
          전체강의실목록: classrooms.map(c => ({ id: c.id, name: c.name })),
          displayClassrooms목록: displayClassrooms.map(c => ({ id: c.id, name: c.name })),
          classes배열의수업수: classes.length,
          matchingClasses수: matchingClasses.length
        });
        
        // 추가 디버깅: 수업들의 실제 classroom_id 목록
        const uniqueClassroomIds = [...new Set(classes.map(c => c.classroom_id).filter(Boolean))];
        console.log('📋 수업들이 사용하는 모든 classroom_id:', uniqueClassroomIds);
        console.log('📋 시간표가 표시하는 classroom_id:', classroomId);
        
        window._matchFailLogged = true;
      }
    }
    
    return found;
  };

  // 수업별 현재 수강 학생 수 계산 (class_id 기준)
  const classStudentCounts = useMemo(() => {
    const counts = {};
    students.forEach((student) => {
      if (!student.class_id) return;
      counts[student.class_id] = (counts[student.class_id] || 0) + 1;
    });
    return counts;
  }, [students]);

  // 강의실이 5개 미만이면 기본 강의실 생성
  // useMemo를 사용하여 classrooms와 classes가 변경될 때만 재계산
  // 수업이 참조하는 강의실을 우선적으로 포함
  // 설정에서 지정한 강의실만 표시 (기본 강의실 생성하지 않음)
  const displayClassrooms = useMemo(() => {
    console.log('🔄 displayClassrooms 재계산 시작:', {
      classrooms상태: classrooms.map(c => ({ id: c.id, name: c.name })),
      classrooms개수: classrooms.length
    });
    
    // 설정에서 로드한 강의실만 사용 (기본 강의실 생성하지 않음)
    if (classrooms.length === 0) {
      console.warn('⚠️ 설정에 강의실이 없습니다. 설정 페이지에서 강의실을 선택해주세요.');
      return [];
    }
    
    // 설정에서 지정한 강의실만 표시
    const result = classrooms.slice(); // 복사
    
    console.log('✅ displayClassrooms 최종 결과:', {
      설정에서로드한강의실: result.map(c => ({ id: c.id, name: c.name })),
      강의실개수: result.length,
      강의실이름목록: result.map(c => c.name)
    });
    
    return result;
  }, [classrooms]);

  // 관별로 강의실 분배 (각 관당 6개씩)
  const classroomsByBuilding = useMemo(() => {
    const buildings = [];
    const classroomsPerBuilding = 6;
    
    buildingNames.forEach((building, buildingIndex) => {
      const startIndex = buildingIndex * classroomsPerBuilding;
      const endIndex = startIndex + classroomsPerBuilding;
      const buildingClassrooms = displayClassrooms.slice(startIndex, endIndex);
      if (buildingClassrooms.length > 0) {
        buildings.push({
          id: building.id,
          name: building.name,
          classrooms: buildingClassrooms
        });
      }
    });
    
    // selectedBuilding이 null이면 첫 번째 관으로 설정
    if (buildings.length > 0 && selectedBuilding === null) {
      setSelectedBuilding(buildings[0].id);
    }
    
    return buildings;
  }, [displayClassrooms, buildingNames, selectedBuilding]);

  // 메인 시간표에 표시할 강의실 (첫 번째 관)
  const mainClassrooms = useMemo(() => {
    return classroomsByBuilding[0]?.classrooms || displayClassrooms.slice(0, 6);
  }, [classroomsByBuilding, displayClassrooms]);

  // 추가 시간표 섹션에 표시할 강의실 (두 번째 관부터)
  const additionalClassrooms = useMemo(() => {
    if (classroomsByBuilding.length > 1) {
      return classroomsByBuilding[1]?.classrooms || [];
    }
    return displayClassrooms.slice(6);
  }, [classroomsByBuilding, displayClassrooms]);

  const statCards = [
    {
      title: '금일 현황',
      value: stats.todayStatus,
      icon: '📅',
      iconBg: '#E3F2FD',
      onClick: () => navigate('/today-status'),
    },
    {
      title: '총 학생 수',
      value: stats.totalStudents,
      icon: '🎓',
      iconBg: '#E8F5E9',
      onClick: () => navigate('/students'),
    },
    {
      title: '총 선생님 수',
      value: stats.totalTeachers,
      icon: '👨‍🏫',
      iconBg: '#FFF3E0',
      onClick: () => navigate('/teachers'),
    },
  ];

  return (
    <div className="classes-page">
      {/* 현황 카드 섹션 */}
      <section className="status-section">
        <div className="stat-cards">
          {statCards.map((card, index) => (
            <div key={index} className="stat-card" onClick={card.onClick}>
              <div className="stat-card-icon" style={{ backgroundColor: card.iconBg }}>
                <span>{card.icon}</span>
              </div>
              <div className="stat-card-content">
                <div className="stat-card-value">{card.value}</div>
                <div className="stat-card-title">{card.title}</div>
              </div>
              <button className="stat-card-button">
                자세히 보기 →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 자동 복귀 알림 다이얼로그 */}
      {showReturnDialog && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
          }}
          onClick={(e) => {
            // 배경 클릭 시 닫히지 않도록
            e.stopPropagation();
          }}
        >
          <div 
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              minWidth: '300px',
              maxWidth: '400px',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>
              오늘 요일로 돌아가기
            </h3>
            <p style={{ marginBottom: '24px', color: '#666', lineHeight: '1.5' }}>
              다른 요일을 10분 이상 보고 계십니다. 오늘 요일({getTodayDay()})로 돌아가시겠습니까?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={handleReturnDialogCancel}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f0f0f0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#e0e0e0'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#f0f0f0'}
              >
                취소
              </button>
              <button
                onClick={handleReturnDialogConfirm}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#2980b9'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#3498db'}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 className="page-title">전체 시간표</h1>
          {classroomsByBuilding.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {buildingNames.map((building) => {
                const buildingClassrooms = classroomsByBuilding.find(b => b.id === building.id)?.classrooms || [];
                if (buildingClassrooms.length === 0) return null;
                
                return (
                  <button
                    key={building.id}
                    className={`building-button ${selectedBuilding === building.id ? 'active' : ''}`}
                    onClick={() => setSelectedBuilding(building.id)}
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: 600,
                      border: '2px solid',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: selectedBuilding === building.id ? '#3498db' : 'white',
                      color: selectedBuilding === building.id ? 'white' : '#3498db',
                      borderColor: '#3498db',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseOver={(e) => {
                      if (selectedBuilding !== building.id) {
                        e.target.style.backgroundColor = '#e8f4f8';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (selectedBuilding !== building.id) {
                        e.target.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    {building.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="header-actions">
          <div className="day-buttons">
            {days.map((day) => (
              <button
                key={day}
                className={`day-button ${selectedDay === day ? 'active' : ''}`}
                onClick={() => setSelectedDay(day)}
              >
                {day}
              </button>
            ))}
          </div>
          <button
            className="add-class-header-button"
            onClick={() => {
              setRegisterModalOpen(true);
            }}
          >
            등록하기
          </button>
        </div>
      </div>

      {/* 첫 번째 관 시간표 (첫 번째 관 선택 시 또는 관이 하나일 때 표시) */}
      {(classroomsByBuilding.length === 0 || selectedBuilding === (classroomsByBuilding[0]?.id || 1)) && (
        <div className="timetable-container">
          <table className="timetable">
            <thead>
              <tr>
                <th className="time-column">시간</th>
                {mainClassrooms.map((classroom) => (
                  <th key={classroom.id} className="classroom-column">
                    {classroom.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((timeSlot) => (
                <tr key={timeSlot}>
                  <td className="time-cell">{timeSlot}</td>
                  {mainClassrooms.map((classroom) => {
                  const classItem = getClassForSlot(timeSlot, classroom.id);
                  // 선생님 정보 찾기
                  const teacher = classItem ? teachers.find(t => t.id === classItem.teacher_id) : null;
                  // 과목 정보 찾기 (색상용)
                  const subject = classItem ? subjects.find(s => s.id === classItem.subject_id) : null;
                  
                  // 수업 아이템의 위치와 높이 계산
                  let itemStyle = {};
                  if (classItem && classItem.start_time && classItem.end_time) {
                    const slotStartMinutes = parseHHMMToMinutes(String(timeSlot));
                    const classStartMinutes = parseHHMMToMinutes(String(classItem.start_time));
                    const classEndMinutes = parseHHMMToMinutes(String(classItem.end_time));
                    
                    if (slotStartMinutes != null && classStartMinutes != null && classEndMinutes != null) {
                      // 시간대 셀의 높이 (1시간 = 60분 기준)
                      const cellHeightMinutes = 60;
                      
                      // 시간대 시작 시간 기준으로 수업 시작 시간까지의 분 차이
                      const offsetMinutes = classStartMinutes - slotStartMinutes;
                      
                      // 수업의 지속 시간 (분)
                      const durationMinutes = classEndMinutes - classStartMinutes;
                      
                      // 수업이 이 슬롯에서 시작하는 경우만 표시 (offsetMinutes >= 0 && offsetMinutes < 60)
                      if (offsetMinutes >= 0 && offsetMinutes < cellHeightMinutes) {
                        // 수업의 전체 지속 시간을 표시 (다음 슬롯으로 넘어가도 전체 높이 표시)
                        const topPercent = (offsetMinutes / cellHeightMinutes) * 100;
                        const heightPercent = (durationMinutes / cellHeightMinutes) * 100;
                        
                        itemStyle = {
                          position: 'absolute',
                          top: `${topPercent}%`,
                          height: `${heightPercent}%`,
                          minHeight: '50px',
                          zIndex: 1
                        };
                      }
                    }
                  }
                  
                  // 과목 색상 적용 (밝은 배경색과 원본 테두리 색상)
                  const subjectColor = subject?.color || '#1976d2';
                  const lightenColor = (color) => {
                    try {
                      // HEX 색상을 RGB로 변환
                      let hex = color.replace('#', '');
                      // 3자리 HEX 색상 처리 (예: #FFF -> #FFFFFF)
                      if (hex.length === 3) {
                        hex = hex.split('').map(char => char + char).join('');
                      }
                      if (hex.length !== 6) {
                        return '#e3f2fd'; // 기본 색상 반환
                      }
                      const r = parseInt(hex.substr(0, 2), 16);
                      const g = parseInt(hex.substr(2, 2), 16);
                      const b = parseInt(hex.substr(4, 2), 16);
                      // 더 투명하게 만들기 (50% 원본 색상 + 50% 흰색 혼합)
                      const lightR = Math.round(r * 0.5 + 255 * 0.5);
                      const lightG = Math.round(g * 0.5 + 255 * 0.5);
                      const lightB = Math.round(b * 0.5 + 255 * 0.5);
                      return `rgb(${lightR}, ${lightG}, ${lightB})`;
                    } catch (error) {
                      return '#e3f2fd'; // 기본 색상 반환
                    }
                  };
                  
                  const backgroundColor = subjectColor ? lightenColor(subjectColor) : '#e3f2fd';
                  const borderColor = subjectColor || '#90caf9';
                  const textColor = '#000000'; // 모든 텍스트는 검은색으로 통일
                  
                  // hover 색상 계산
                  const getHoverColor = (color) => {
                    try {
                      let hex = color.replace('#', '');
                      if (hex.length === 3) {
                        hex = hex.split('').map(char => char + char).join('');
                      }
                      if (hex.length !== 6) {
                        return backgroundColor;
                      }
                      const r = parseInt(hex.substr(0, 2), 16);
                      const g = parseInt(hex.substr(2, 2), 16);
                      const b = parseInt(hex.substr(4, 2), 16);
                      // hover 시 조금 더 진하게 (40% 원본 색상 + 60% 흰색 혼합)
                      const hoverR = Math.round(r * 0.4 + 255 * 0.6);
                      const hoverG = Math.round(g * 0.4 + 255 * 0.6);
                      const hoverB = Math.round(b * 0.4 + 255 * 0.6);
                      return `rgb(${hoverR}, ${hoverG}, ${hoverB})`;
                    } catch (error) {
                      return backgroundColor;
                    }
                  };
                  
                  return (
                    <td key={classroom.id} className="classroom-cell">
                      {classItem ? (
                        <div
                          className="class-item"
                          style={{
                            ...itemStyle,
                            backgroundColor: backgroundColor,
                            borderColor: borderColor,
                            color: textColor
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = getHoverColor(subjectColor);
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = backgroundColor;
                          }}
                          onClick={() => handleOpenStudentList(classItem)}
                        >
                          <button
                            type="button"
                            className="class-item-edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(classItem);
                            }}
                            title="수업 수정"
                            aria-label="수업 수정"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="class-item-delete"
                            onClick={(e) => handleDelete(classItem, e)}
                            title="수업 삭제"
                            aria-label="수업 삭제"
                          >
                            🗑️
                          </button>
                          <div className="class-item-name">{classItem.name}</div>
                          {teacher && (
                            <div className="class-item-teacher">담당: {teacher.name}</div>
                          )}
                          <div className="class-item-students">
                            학생: {classStudentCounts[classItem.id] || 0}{classItem.max_students ? `/${classItem.max_students}` : ''}명
                          </div>
                        </div>
                      ) : (
                        <div className="empty-class-cell"></div>
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

      {/* 두 번째 관 이후 시간표 (두 번째 관 이후 선택 시 표시) */}
      {classroomsByBuilding.length > 1 && classroomsByBuilding.slice(1).some(b => b.id === selectedBuilding) && (
        <div className="timetable-container">
            <table className="timetable">
              <thead>
                <tr>
                  <th className="time-column">시간</th>
                  {additionalClassrooms.map((classroom) => (
                    <th key={classroom.id} className="classroom-column">
                      {classroom.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((timeSlot) => (
                  <tr key={timeSlot}>
                    <td className="time-cell">{timeSlot}</td>
                    {additionalClassrooms.map((classroom) => {
                      const classItem = getClassForSlot(timeSlot, classroom.id);
                      // 선생님 정보 찾기
                      const teacher = classItem ? teachers.find(t => t.id === classItem.teacher_id) : null;
                      // 과목 정보 찾기 (색상용)
                      const subject = classItem ? subjects.find(s => s.id === classItem.subject_id) : null;
                      
                      // 수업 아이템의 위치와 높이 계산
                      let itemStyle = {};
                      if (classItem && classItem.start_time && classItem.end_time) {
                        const slotStartMinutes = parseHHMMToMinutes(String(timeSlot));
                        const classStartMinutes = parseHHMMToMinutes(String(classItem.start_time));
                        const classEndMinutes = parseHHMMToMinutes(String(classItem.end_time));
                        
                        if (slotStartMinutes != null && classStartMinutes != null && classEndMinutes != null) {
                          // 시간대 셀의 높이 (1시간 = 60분 기준)
                          const cellHeightMinutes = 60;
                          
                          // 시간대 시작 시간 기준으로 수업 시작 시간까지의 분 차이
                          const offsetMinutes = classStartMinutes - slotStartMinutes;
                          
                          // 수업의 지속 시간 (분)
                          const durationMinutes = classEndMinutes - classStartMinutes;
                          
                          // 수업이 이 슬롯에서 시작하는 경우만 표시 (offsetMinutes >= 0 && offsetMinutes < 60)
                          if (offsetMinutes >= 0 && offsetMinutes < cellHeightMinutes) {
                            // 수업의 전체 지속 시간을 표시 (다음 슬롯으로 넘어가도 전체 높이 표시)
                            const topPercent = (offsetMinutes / cellHeightMinutes) * 100;
                            const heightPercent = (durationMinutes / cellHeightMinutes) * 100;
                            
                            itemStyle = {
                              position: 'absolute',
                              top: `${topPercent}%`,
                              height: `${heightPercent}%`,
                              minHeight: '50px',
                              zIndex: 1
                            };
                          }
                        }
                      }
                      
                      // 과목 색상 적용 (밝은 배경색과 원본 테두리 색상)
                      const subjectColor = subject?.color || '#1976d2';
                      const lightenColor = (color) => {
                        try {
                          // HEX 색상을 RGB로 변환
                          let hex = color.replace('#', '');
                          // 3자리 HEX 색상 처리 (예: #FFF -> #FFFFFF)
                          if (hex.length === 3) {
                            hex = hex.split('').map(char => char + char).join('');
                          }
                          if (hex.length !== 6) {
                            return '#e3f2fd'; // 기본 색상 반환
                          }
                          const r = parseInt(hex.substr(0, 2), 16);
                          const g = parseInt(hex.substr(2, 2), 16);
                          const b = parseInt(hex.substr(4, 2), 16);
                          // 더 투명하게 만들기 (50% 원본 색상 + 50% 흰색 혼합)
                          const lightR = Math.round(r * 0.5 + 255 * 0.5);
                          const lightG = Math.round(g * 0.5 + 255 * 0.5);
                          const lightB = Math.round(b * 0.5 + 255 * 0.5);
                          return `rgb(${lightR}, ${lightG}, ${lightB})`;
                        } catch (error) {
                          return '#e3f2fd'; // 기본 색상 반환
                        }
                      };
                      
                      const backgroundColor = subjectColor ? lightenColor(subjectColor) : '#e3f2fd';
                      const borderColor = subjectColor || '#90caf9';
                      const textColor = '#000000'; // 모든 텍스트는 검은색으로 통일
                      
                      // hover 색상 계산
                      const getHoverColor = (color) => {
                        try {
                          let hex = color.replace('#', '');
                          if (hex.length === 3) {
                            hex = hex.split('').map(char => char + char).join('');
                          }
                          if (hex.length !== 6) {
                            return backgroundColor;
                          }
                          const r = parseInt(hex.substr(0, 2), 16);
                          const g = parseInt(hex.substr(2, 2), 16);
                          const b = parseInt(hex.substr(4, 2), 16);
                          // hover 시 조금 더 진하게 (40% 원본 색상 + 60% 흰색 혼합)
                          const hoverR = Math.round(r * 0.4 + 255 * 0.6);
                          const hoverG = Math.round(g * 0.4 + 255 * 0.6);
                          const hoverB = Math.round(b * 0.4 + 255 * 0.6);
                          return `rgb(${hoverR}, ${hoverG}, ${hoverB})`;
                        } catch (error) {
                          return backgroundColor;
                        }
                      };
                      
                      return (
                        <td key={classroom.id} className="classroom-cell">
                          {classItem ? (
                            <div
                              className="class-item"
                              style={{
                                ...itemStyle,
                                backgroundColor: backgroundColor,
                                borderColor: borderColor,
                                color: textColor
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = getHoverColor(subjectColor);
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = backgroundColor;
                              }}
                              onClick={() => handleOpenStudentList(classItem)}
                            >
                              <button
                                type="button"
                                className="class-item-edit"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(classItem);
                                }}
                                title="수업 수정"
                                aria-label="수업 수정"
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                className="class-item-delete"
                                onClick={(e) => handleDelete(classItem, e)}
                                title="수업 삭제"
                                aria-label="수업 삭제"
                              >
                                🗑️
                              </button>
                              <div className="class-item-content">
                                <div className="class-item-title">{classItem.name}</div>
                                <div className="class-item-teacher">
                                  {teacher ? teacher.name : '선생님 미지정'}
                                </div>
                                <div className="class-item-time">
                                  {classItem.start_time} - {classItem.end_time}
                                </div>
                                {classStudentCounts[classItem.id] !== undefined && (
                                  <div className="class-item-students">
                                    학생 {classStudentCounts[classItem.id]}명
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="empty-class-cell"></div>
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

      <ClassFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClass(null);
          setSelectedTimeSlot(null);
          setSelectedClassroom(null);
          setFormData({});
        }}
        editingClass={editingClass}
        subjects={subjects}
        teachers={teachers}
        classrooms={displayClassrooms && displayClassrooms.length > 0 ? displayClassrooms : classrooms}
        timeSlots={timeSlots}
        selectedDay={selectedDay}
        selectedTimeSlot={selectedTimeSlot}
        selectedClassroom={selectedClassroom}
        academyId={academyId}
        onSubmitSuccess={async () => {
          await loadClasses();
          await loadStudents();
          // TeacherDetail 페이지에 변경 알림
          localStorage.setItem('teacherDetailPageRefresh', Date.now().toString());
        }}
        days={days}
      />

      {/* 레거시 모달 (제거 예정) */}
      {false && (
      <Modal
        isOpen={false}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClass(null);
          setSelectedTimeSlot(null);
          setSelectedClassroom(null);
          setFormData({});
        }}
        title={editingClass ? '수업 수정' : '수업 등록하기'}
      >
        <Form
          fields={fields.map(field => {
            if (field.name === 'subject_id') {
              return { ...field, options: subjects.map(s => ({ value: s.id, label: s.name })) };
            } else if (field.name === 'teacher_id') {
              return { ...field, options: teachers.map(t => ({ value: t.id, label: t.name })) };
            } else if (field.name === 'schedule') {
              // 요일 선택 옵션 (월~일)
              return {
                ...field,
                options: days.map(d => ({ value: d, label: d })),
              };
            } else if (field.name === 'class_type') {
              // 수업 유형 선택 옵션
              return {
                ...field,
                options: [
                  { value: '단체반', label: '단체반' },
                  { value: '2대1레슨', label: '2대1레슨' },
                  { value: '개인 레슨', label: '개인 레슨' }
                ],
              };
            } else if (field.name === 'max_students') {
              // 정원 필드: 수업 유형에 따라 읽기 전용 처리
              const currentClassType = formData.class_type || editingClass?.class_type || '';
              const isReadOnly = currentClassType === '2대1레슨' || currentClassType === '개인 레슨';
              return {
                ...field,
                readOnly: isReadOnly,
              };
            } else if (field.name === 'classroom_id') {
              // 설정에서 사용하는 강의실 목록을 그대로 사용 (설정 페이지와 동일한 목록)
              // displayClassrooms가 있으면 우선 사용, 없으면 classrooms 사용
              const modalClassrooms = (displayClassrooms && displayClassrooms.length > 0)
                ? displayClassrooms
                : classrooms;

              if (!modalClassrooms || modalClassrooms.length === 0) {
                console.warn('⚠️ 수업 등록 모달에 표시할 강의실이 없습니다. 설정 페이지에서 강의실을 먼저 설정해주세요.');
              }

              console.log('📋 수업 등록 모달에 표시할 강의실 옵션 (설정 기반):', modalClassrooms.map(c => ({ id: c.id, name: c.name })));

              // 값으로는 강의실 ID를 사용 (DB 기준)
              return {
                ...field,
                options: modalClassrooms.map(c => ({
                  value: c.id,
                  label: c.name,
                })),
              };
            } else if (field.name === 'start_time') {
              // 시작 시간: 시/분을 나눠서 입력 & 선택할 수 있는 커스텀 필드
              return {
                ...field,
                type: 'custom',
                render: ({ formData: fd, onChange, setField }) => {
                  const timeList =
                    availableTimeSlots.length > 0 ? availableTimeSlots : timeSlots;

                  if (!timeList || timeList.length === 0) {
                    return <div>사용 가능한 시간대가 없습니다.</div>;
                  }

                  // 현재 값 또는 기본값
                  const currentValue =
                    fd.start_time ||
                    editingClass?.start_time ||
                    selectedTimeSlot ||
                    timeList[0];

                  const [currentHourRaw, currentMinuteRaw] = (currentValue || '00:00').split(':');
                  const currentHour = currentHourRaw || '00';
                  const currentMinute = currentMinuteRaw || '00';

                  // 시간/분 옵션 생성 (설정된 슬롯 기반)
                  const parsedTimes = timeList.map((t) => {
                    const [h, m] = t.split(':');
                    return { value: t, hour: h, minute: m };
                  });

                  // 24시간 형식: 00시부터 23시까지 모든 시간 옵션 제공
                  const allHours = Array.from({ length: 24 }, (_, i) => 
                    String(i).padStart(2, '0')
                  );
                  const uniqueHours = Array.from(
                    new Set(parsedTimes.map((p) => p.hour))
                  ).sort((a, b) => Number(a) - Number(b));
                  
                  // 시간표에 없는 시간도 선택 가능하도록 전체 시간 목록 사용
                  const availableHours = allHours;

                  // 분 옵션은 0분~55분까지 5분 단위 고정
                  const minuteOptions = Array.from({ length: 12 }, (_, i) =>
                    String(i * 5).padStart(2, '0')
                  );

                  const handleHourChange = (e) => {
                    const newHour = e.target.value;
                    // 선택한 시간과 현재 분을 조합하여 24시간 형식으로 저장
                    const newTime = `${newHour}:${currentMinute}`;
                    setField('start_time', newTime);
                  };

                  const handleMinuteChange = (e) => {
                    const newMinute = e.target.value;
                    const newTime = `${currentHour}:${newMinute}`;
                    setField('start_time', newTime);
                  };

                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <select
                        className="form-control"
                        value={currentHour}
                        onChange={handleHourChange}
                        style={{ maxWidth: '80px' }}
                      >
                        {availableHours.map((h) => (
                          <option key={h} value={h}>
                            {`${h}시`}
                          </option>
                        ))}
                      </select>
                      <span>:</span>
                      <select
                        className="form-control"
                        value={currentMinute}
                        onChange={handleMinuteChange}
                        style={{ maxWidth: '80px' }}
                      >
                        {minuteOptions.map((m) => (
                          <option key={m} value={m}>
                            {`${m}분`}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                },
              };
            }
            return field;
          })}
          onSubmit={handleSubmit}
          onChange={handleFormChange}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingClass(null);
            setSelectedTimeSlot(null);
            setSelectedClassroom(null);
            setFormData({});
          }}
          initialData={formData && Object.keys(formData).length > 0 ? formData : (editingClass || (() => {
            const defaultStartTime = selectedTimeSlot || availableTimeSlots[0] || timeSlots[0];
            const defaultEndTime = defaultStartTime ? calculateEndTime(defaultStartTime) : null;
            return {
              schedule: selectedDay,
              classroom_id: selectedClassroom,
              start_time: defaultStartTime,
              end_time: defaultEndTime
            };
          })())}
          key={`form-${formData.start_time}-${formData.end_time}`} // formData가 변경되면 Form 컴포넌트 재렌더링
        />
      </Modal>
      )}

      {/* 학생 등록 모달 */}
      <Modal
        isOpen={isStudentRegisterModalOpen}
        onClose={() => {
          setIsStudentRegisterModalOpen(false);
          setIsRegisteringFromClassModal(false);
          setStudentFormData({
            name: '',
            parent_contact: '',
            payment_method: '현금',
            class_id: '',
            teacher_id: '',
            schedule: '',
            fee: '',
            receipt_file: null,
            note: '',
          });
        }}
        title="학생 등록"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              if (!academyId) {
                alert('학원 정보를 불러올 수 없습니다.');
                return;
              }

              if (!studentFormData.name.trim()) {
                alert('학생 이름을 입력해주세요.');
                return;
              }

              if (!studentFormData.class_id) {
                alert('수업을 선택해주세요.');
                return;
              }

              // 정원 확인
              const selectedClass = classes.find(c => c.id === studentFormData.class_id);
              if (selectedClass && selectedClass.max_students) {
                const currentStudentCount = classStudentCounts[selectedClass.id] || 0;
                if (currentStudentCount >= selectedClass.max_students) {
                  alert('정원이 꽉 찼습니다. 더이상 등록이 안됩니다.');
                  return;
                }
              }

              if (!studentFormData.teacher_id) {
                alert('담당 선생님을 선택해주세요.');
                return;
              }

              if (!studentFormData.schedule) {
                alert('요일을 선택해주세요.');
                return;
              }

              if (!studentFormData.fee) {
                alert('수강료를 선택해주세요.');
                return;
              }

              // 학부모 연락처가 없으면 자동 생성
              const finalParentContact = studentFormData.parent_contact.trim() || generateParentContact();

              const studentData = {
                name: studentFormData.name,
                parent_contact: finalParentContact,
                note: studentFormData.note,
                academy_id: academyId,
                class_id: studentFormData.class_id,
                teacher_id: studentFormData.teacher_id,
                schedule: studentFormData.schedule || null,
                fee: studentFormData.fee ? parseInt(studentFormData.fee, 10) : null,
                has_receipt: !!studentFormData.receipt_file,
              };

              await studentService.create(studentData);
              alert('학생이 등록되었습니다.');

              // 학생 목록 새로고침
              await loadStudents();
              
              // TeacherDetail 페이지에 변경 알림
              localStorage.setItem('teacherDetailPageRefresh', Date.now().toString());

              // 수강생 목록도 새로고침
              if (selectedClassForStudents) {
                const response = await studentService.getAll(academyId);
                const allStudents = response.data?.students || response.data || [];
                const classStudents = allStudents.filter(
                  (student) => student.class_id === selectedClassForStudents.id
                );
                setEnrolledStudents(classStudents);
              }

              // 학생 등록 모달 닫기
              setIsStudentRegisterModalOpen(false);
              setIsRegisteringFromClassModal(false);
              setStudentFormData({
                name: '',
                parent_contact: '',
                payment_method: '현금',
                class_id: '',
                teacher_id: '',
                schedule: '',
                fee: '',
                receipt_file: null,
                note: '',
              });
              
              // 학생 목록 모달 다시 열기
              if (selectedClassForStudents) {
                setIsStudentModalOpen(true);
              }
            } catch (error) {
              console.error('학생 저장 실패:', error);
              alert('학생 저장에 실패했습니다.');
            }
          }}
          className="student-register-form"
        >
          {/* 처음 2개 필드 가로 정렬 */}
          <div className="form-row-two-columns">
            <div className="form-column">
              <div className="form-group">
                <label className="form-label">
                  학생 이름 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  name="name"
                  value={studentFormData.name}
                  onChange={(e) =>
                    setStudentFormData({ ...studentFormData, name: e.target.value })
                  }
                  placeholder="학생 이름을 입력하세요"
                  required
                />
              </div>
            </div>

            <div className="form-column">
              <div className="form-group">
                <label className="form-label">
                  담당 선생님 <span className="required">*</span>
                </label>
                <div className="button-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {teachers.map((teacher) => {
                    const isSelected = studentFormData.teacher_id === teacher.id;
                    const isDisabled = isRegisteringFromClassModal; // 수업 모달에서 등록하는 경우 비활성화
                    return (
                      <button
                        key={teacher.id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => {
                          // 수업 모달에서 등록하는 경우, 수업 정보를 유지하면서 필터링만 업데이트
                          if (isRegisteringFromClassModal && selectedClassForStudents) {
                            const newFilteredClasses = classes.filter(
                              c => c.teacher_id === teacher.id && c.schedule === studentFormData.schedule
                            );
                            // 현재 선택된 수업이 새로운 필터에 포함되어 있으면 유지
                            const shouldKeepClass = newFilteredClasses.some(c => c.id === studentFormData.class_id);
                            setStudentFormData({
                              ...studentFormData,
                              teacher_id: teacher.id,
                              class_id: shouldKeepClass ? studentFormData.class_id : '',
                            });
                          } else {
                            setStudentFormData({
                              ...studentFormData,
                              teacher_id: teacher.id,
                              schedule: '', // 요일 선택 초기화
                              class_id: '', // 수업 선택 초기화
                            });
                          }
                        }}
                        style={{
                          padding: '10px 20px',
                          border: `2px solid ${isSelected ? '#667eea' : '#e0e0e0'}`,
                          borderRadius: '8px',
                          background: isSelected ? '#667eea' : 'white',
                          color: isSelected ? 'white' : '#2c3e50',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          fontSize: '0.95rem',
                          fontWeight: isSelected ? '600' : '500',
                          transition: 'all 0.2s',
                          opacity: isDisabled ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!isDisabled && !isSelected) {
                            e.target.style.borderColor = '#667eea';
                            e.target.style.background = '#f0f0ff';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isDisabled && !isSelected) {
                            e.target.style.borderColor = '#e0e0e0';
                            e.target.style.background = 'white';
                          }
                        }}
                      >
                        {teacher.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 요일 선택 필드와 수업 이름 선택 필드 (가로 정렬) */}
          <div className="form-row-two-columns">
            <div className="form-column">
              <div className="form-group">
                <label className="form-label">
                  요일 <span className="required">*</span>
                </label>
                <div className="button-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {availableDays.map((day) => {
                    const isSelected = studentFormData.schedule === day;
                    const isDisabled = !studentFormData.teacher_id || isRegisteringFromClassModal; // 수업 모달에서 등록하는 경우 비활성화
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          if (!isDisabled) {
                            // 수업 모달에서 등록하는 경우, 수업 정보를 유지하면서 필터링만 업데이트
                            if (isRegisteringFromClassModal && selectedClassForStudents) {
                              const newFilteredClasses = classes.filter(
                                c => c.teacher_id === studentFormData.teacher_id && c.schedule === day
                              );
                              // 현재 선택된 수업이 새로운 필터에 포함되어 있으면 유지
                              const shouldKeepClass = newFilteredClasses.some(c => c.id === studentFormData.class_id);
                              setStudentFormData({
                                ...studentFormData,
                                schedule: day,
                                class_id: shouldKeepClass ? studentFormData.class_id : '',
                              });
                            } else {
                              setStudentFormData({
                                ...studentFormData,
                                schedule: day,
                                class_id: '', // 수업 선택 초기화
                              });
                            }
                          }
                        }}
                        disabled={isDisabled}
                        style={{
                          padding: '10px 20px',
                          border: `2px solid ${isSelected ? '#667eea' : '#e0e0e0'}`,
                          borderRadius: '8px',
                          background: isSelected ? '#667eea' : 'white',
                          color: isSelected ? 'white' : '#2c3e50',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          fontSize: '0.95rem',
                          fontWeight: isSelected ? '600' : '500',
                          transition: 'all 0.2s',
                          opacity: isDisabled ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!isDisabled && !isSelected) {
                            e.target.style.borderColor = '#667eea';
                            e.target.style.background = '#f0f0ff';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isDisabled && !isSelected) {
                            e.target.style.borderColor = '#e0e0e0';
                            e.target.style.background = 'white';
                          }
                        }}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
                {!studentFormData.teacher_id && (
                  <div style={{ marginTop: '8px', fontSize: '0.875rem', color: '#999' }}>
                    담당 선생님을 먼저 선택하세요
                  </div>
                )}
              </div>
            </div>

            <div className="form-column">
              <div className="form-group">
                <label className="form-label">
                  수업 이름 <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  name="class_id"
                  value={studentFormData.class_id}
                  onChange={(e) =>
                    setStudentFormData({ ...studentFormData, class_id: e.target.value })
                  }
                  required
                  disabled={!studentFormData.teacher_id || !studentFormData.schedule || isRegisteringFromClassModal}
                >
                  <option value="">
                    {!studentFormData.teacher_id 
                      ? '담당 선생님을 먼저 선택하세요'
                      : !studentFormData.schedule
                      ? '요일을 먼저 선택하세요'
                      : '선택하세요'}
                  </option>
                  {filteredClasses.map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 학부모 연락처와 영수증 등록하기 (가로 정렬) */}
          <div className="form-row-two-columns">
            <div className="form-column">
              <div className="form-group">
                <label className="form-label">
                  학부모 연락처 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  name="parent_contact"
                  value={studentFormData.parent_contact}
                  onChange={(e) =>
                    setStudentFormData({ ...studentFormData, parent_contact: e.target.value })
                  }
                  placeholder="010-1234-5678"
                  required
                />
              </div>
            </div>

            <div className="form-column">
              <div className="form-group">
                <label className="form-label">영수증 등록하기</label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    id="receipt_file"
                    name="receipt_file"
                    className="file-input"
                    accept="image/*,.pdf"
                    onChange={(e) =>
                      setStudentFormData({ ...studentFormData, receipt_file: e.target.files[0] || null })
                    }
                  />
                  <label htmlFor="receipt_file" className="file-label">
                    파일 선택
                  </label>
                  {studentFormData.receipt_file && (
                    <span className="file-name">{studentFormData.receipt_file.name}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 결제 방법과 수강료 (가로 정렬) */}
          <div className="form-row-two-columns">
            <div className="form-column">
              <div className="form-group">
                <label className="form-label">
                  결제 방법 <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  name="payment_method"
                  value={studentFormData.payment_method}
                  onChange={(e) =>
                    setStudentFormData({ ...studentFormData, payment_method: e.target.value })
                  }
                  required
                >
                  <option value="현금">현금</option>
                  <option value="카드">카드</option>
                  <option value="계좌이체">계좌이체</option>
                  <option value="무통장입금">무통장입금</option>
                </select>
              </div>
            </div>

            <div className="form-column">
              <div className="form-group">
                <label className="form-label">
                  수강료 <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  name="fee"
                  value={studentFormData.fee}
                  onChange={(e) => {
                    const selectedFeeValue = e.target.value;
                    // 선택된 수강료의 결제 방법 찾기
                    const selectedFee = tuitionFees.find(fee => fee.value === selectedFeeValue);
                    setStudentFormData({ 
                      ...studentFormData, 
                      fee: selectedFeeValue,
                      payment_method: selectedFee?.payment_method || studentFormData.payment_method
                    });
                  }}
                  required
                >
                  <option value="">선택하세요</option>
                  {tuitionFees.map((fee) => {
                    // 수강료 표시 형식: "수업유형 - 결제방법: 금액" 또는 "금액"
                    const displayText = fee.class_type && fee.payment_method
                      ? `${fee.class_type} - ${fee.payment_method}: ${fee.amount}`
                      : fee.amount;
                    return (
                      <option key={fee.id} value={fee.value}>
                        {displayText}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          <div className="form-group full-width">
            <label className="form-label">메모</label>
            <textarea
              className="form-textarea"
              name="note"
              value={studentFormData.note}
              onChange={(e) =>
                setStudentFormData({ ...studentFormData, note: e.target.value })
              }
              placeholder="메모를 입력하세요"
              rows={4}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setIsStudentRegisterModalOpen(false);
                setIsRegisteringFromClassModal(false);
                setStudentFormData({
                  name: '',
                  parent_contact: '',
                  payment_method: '현금',
                  class_id: '',
                  teacher_id: '',
                  schedule: '',
                  fee: '',
                  receipt_file: null,
                  note: '',
                });
              }}
            >
              취소
            </button>
            <button type="submit" className="btn-submit">
              등록하기
            </button>
          </div>
        </form>
      </Modal>

      {/* 학생 정보 수정 모달 */}
      <Modal
        isOpen={isStudentEditModalOpen}
        onClose={() => {
          setIsStudentEditModalOpen(false);
          setEditingStudent(null);
          setStudentFormData({
            name: '',
            parent_contact: '',
            payment_method: '현금',
            class_id: '',
            teacher_id: '',
            schedule: '',
            fee: '',
            receipt_file: null,
            note: '',
          });
        }}
        title="학생 정보 수정"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              if (!academyId) {
                alert('학원 정보를 불러올 수 없습니다.');
                return;
              }

              if (!studentFormData.name.trim()) {
                alert('학생 이름을 입력해주세요.');
                return;
              }

              // 학부모 연락처가 없으면 자동 생성
              const finalParentContact = studentFormData.parent_contact.trim() || generateParentContact();

              if (!studentFormData.class_id) {
                alert('수업을 선택해주세요.');
                return;
              }

              if (!studentFormData.teacher_id) {
                alert('담당 선생님을 선택해주세요.');
                return;
              }

              if (!studentFormData.fee) {
                alert('수강료를 선택해주세요.');
                return;
              }

              const studentData = {
                name: studentFormData.name,
                parent_contact: studentFormData.parent_contact,
                note: studentFormData.note,
                academy_id: academyId,
                class_id: studentFormData.class_id,
                teacher_id: studentFormData.teacher_id,
                fee: studentFormData.fee ? parseInt(studentFormData.fee, 10) : null,
                has_receipt: !!studentFormData.receipt_file,
              };

              if (editingStudent) {
                const oldClassId = editingStudent.class_id; // 수정 전 수업 ID 저장
                const newClassId = studentData.class_id; // 수정 후 수업 ID
                
                await studentService.update(editingStudent.id, studentData);
                
                // 수업이 변경되었고, 이전 수업에 학생이 없으면 수업 자동 삭제
                if (oldClassId && oldClassId !== newClassId && academyId) {
                  const deleted = await checkAndDeleteEmptyClass(oldClassId, academyId);
                  if (deleted) {
                    console.log('✅ 빈 수업이 자동으로 삭제되었습니다.');
                    await loadClasses(); // 수업 목록 새로고침
                    // TeacherDetail 페이지에 변경 알림
                    localStorage.setItem('teacherDetailPageRefresh', Date.now().toString());
                  }
                }
                
                alert('학생 정보가 수정되었습니다.');
              }

              // 학생 목록 새로고침
              await loadStudents();
              
              // TeacherDetail 페이지에 변경 알림
              localStorage.setItem('teacherDetailPageRefresh', Date.now().toString());

              // 수강생 목록도 새로고침
              if (selectedClassForStudents) {
                const response = await studentService.getAll(academyId);
                const allStudents = response.data?.students || response.data || [];
                const classStudents = allStudents.filter(
                  (student) => student.class_id === selectedClassForStudents.id
                );
                setEnrolledStudents(classStudents);
              }

              setIsStudentEditModalOpen(false);
              setEditingStudent(null);
              setStudentFormData({
                name: '',
                parent_contact: '',
                payment_method: '현금',
                class_id: '',
                teacher_id: '',
                schedule: '',
                fee: '',
                receipt_file: null,
                note: '',
              });
              // 수정 완료 후 학생 목록 모달 다시 열기
              if (selectedClassForStudents) {
                setIsStudentModalOpen(true);
              }
            } catch (error) {
              console.error('학생 수정 실패:', error);
              alert('학생 정보 수정에 실패했습니다.');
            }
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                학생 이름 <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <input
                type="text"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
                value={studentFormData.name}
                onChange={(e) =>
                  setStudentFormData({ ...studentFormData, name: e.target.value })
                }
                placeholder="학생 이름을 입력하세요"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                학부모 연락처 <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <input
                type="text"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
                value={studentFormData.parent_contact}
                onChange={(e) =>
                  setStudentFormData({ ...studentFormData, parent_contact: e.target.value })
                }
                placeholder="010-1234-5678"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                결제 방법 <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
                value={studentFormData.payment_method}
                onChange={(e) =>
                  setStudentFormData({ ...studentFormData, payment_method: e.target.value })
                }
                required
              >
                <option value="">선택하세요</option>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                수업 이름 <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
                value={studentFormData.class_id}
                onChange={(e) =>
                  setStudentFormData({ ...studentFormData, class_id: e.target.value })
                }
                required
              >
                <option value="">선택하세요</option>
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                담당 선생님 <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
                value={studentFormData.teacher_id}
                onChange={(e) =>
                  setStudentFormData({ ...studentFormData, teacher_id: e.target.value })
                }
                required
              >
                <option value="">선택하세요</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                수강료 <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
                value={studentFormData.fee}
                onChange={(e) => {
                  const selectedFeeValue = e.target.value;
                  // 선택된 수강료의 결제 방법 찾기
                  const selectedFee = tuitionFees.find(fee => fee.value === selectedFeeValue);
                  setStudentFormData({ 
                    ...studentFormData, 
                    fee: selectedFeeValue,
                    payment_method: selectedFee?.payment_method || studentFormData.payment_method
                  });
                }}
                required
              >
                <option value="">선택하세요</option>
                {tuitionFees.map((fee) => {
                  // 수강료 표시 형식: "수업유형 - 결제방법: 금액" 또는 "금액"
                  const displayText = fee.class_type && fee.payment_method
                    ? `${fee.class_type} - ${fee.payment_method}: ${fee.amount}`
                    : fee.amount;
                  return (
                    <option key={fee.id} value={fee.value}>
                      {displayText}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              메모
            </label>
            <textarea
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                minHeight: '80px',
                resize: 'vertical',
              }}
              value={studentFormData.note}
              onChange={(e) =>
                setStudentFormData({ ...studentFormData, note: e.target.value })
              }
              placeholder="메모를 입력하세요"
              rows={4}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => {
                setIsStudentEditModalOpen(false);
                setEditingStudent(null);
                setStudentFormData({
                  name: '',
                  parent_contact: '',
                  payment_method: '',
                  class_id: '',
                  teacher_id: '',
                  fee: '',
                  receipt_file: null,
                  note: '',
                });
                // 취소 시 학생 목록 모달 다시 열기
                if (selectedClassForStudents) {
                  setIsStudentModalOpen(true);
                }
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              취소
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              수정
            </button>
          </div>
        </form>
      </Modal>

      {/* 수업별 수강 학생 목록 모달 */}
      <Modal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setSelectedClassForStudents(null);
          setEnrolledStudents([]);
        }}
        title={
          selectedClassForStudents
            ? selectedClassForStudents.name
            : '수강 학생'
        }
        headerActions={
          selectedClassForStudents ? (
            <button
              type="button"
              onClick={() => {
                if (selectedClassForStudents) {
                  // 정원 확인
                  if (selectedClassForStudents.max_students) {
                    const currentStudentCount = classStudentCounts[selectedClassForStudents.id] || 0;
                    if (currentStudentCount >= selectedClassForStudents.max_students) {
                      alert('인원이 꽉 찼습니다.');
                      return;
                    }
                  }
                  
                  // 선택된 수업의 요일 정보 가져오기
                  const selectedClassSchedule = selectedClassForStudents.schedule || '';
                  setStudentFormData({
                    name: '',
                    parent_contact: generateParentContact(),
                    payment_method: '현금',
                    class_id: selectedClassForStudents.id,
                    teacher_id: selectedClassForStudents.teacher_id || '',
                    schedule: selectedClassSchedule,
                    fee: '',
                    receipt_file: null,
                    note: '',
                  });
                  setIsRegisteringFromClassModal(true); // 수업 모달에서 등록하는 경우 표시
                  setIsStudentModalOpen(false);
                  setIsStudentRegisterModalOpen(true);
                }
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2980b9'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#3498db'}
            >
              + 학생 등록하기
            </button>
          ) : null
        }
      >
        {selectedClassForStudents ? (
          enrolledStudents.length > 0 ? (
            <table className="students-table compact">
              <thead>
                <tr>
                  <th>학생 이름</th>
                  <th>학부모 연락처</th>
                  <th>비고</th>
                  <th>작업</th>
                  <th>출석 관리</th>
                </tr>
              </thead>
              <tbody>
                {enrolledStudents.map((student) => (
                  <tr key={student.id}>
                    <td
                      style={{ cursor: 'pointer', color: '#3498db', fontWeight: 500 }}
                      onClick={() => navigate(`/students/${student.id}`)}
                    >
                      {student.name}
                    </td>
                    <td>{student.parent_contact || '-'}</td>
                    <td>{student.note || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingStudent(student);
                            // fee 값을 문자열로 변환 (select 옵션의 value와 매칭)
                            const feeValue = student.fee ? String(student.fee) : '';
                            // 수업에서 요일 정보 가져오기
                            const studentClass = classes.find(c => c.id === student.class_id);
                            const classSchedule = studentClass?.schedule || '';
                            setStudentFormData({
                              name: student.name || '',
                              parent_contact: student.parent_contact || '',
                              payment_method: '현금',
                              class_id: student.class_id || '',
                              teacher_id: student.teacher_id || '',
                              schedule: classSchedule,
                              fee: feeValue,
                              receipt_file: null,
                              note: student.note || '',
                            });
                            // 학생 목록 모달 닫기
                            setIsStudentModalOpen(false);
                            // 학생 정보 수정 모달 열기
                            setIsStudentEditModalOpen(true);
                          }}
                          style={{
                            width: '28px',
                            height: '28px',
                            padding: '0',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            transition: 'transform 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                          }}
                          title="수정"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!window.confirm(`${student.name} 학생 정보를 삭제하시겠습니까?`)) {
                              return;
                            }
                            try {
                              const classIdToCheck = student.class_id; // 삭제 전 수업 ID 저장
                              await studentService.delete(student.id);
                              
                              // 학생 삭제 후 해당 수업에 학생이 없으면 수업도 자동 삭제
                              if (classIdToCheck && academyId) {
                                const deleted = await checkAndDeleteEmptyClass(classIdToCheck, academyId);
                                if (deleted) {
                                  console.log('✅ 빈 수업이 자동으로 삭제되었습니다.');
                                  await loadClasses(); // 수업 목록 새로고침
                                  // TeacherDetail 페이지에 변경 알림
                                  localStorage.setItem('teacherDetailPageRefresh', Date.now().toString());
                                  // 수업이 삭제되었으면 학생 목록 모달 닫기
                                  setIsStudentModalOpen(false);
                                  setSelectedClassForStudents(null);
                                  setEnrolledStudents([]);
                                  alert('학생 정보가 삭제되었고, 해당 수업도 자동으로 삭제되었습니다.');
                                  return;
                                }
                              }
                              
                              alert('학생 정보가 삭제되었습니다.');
                              
                              // 학생 목록 새로고침
                              await loadStudents();
                              
                              // TeacherDetail 페이지에 변경 알림
                              localStorage.setItem('teacherDetailPageRefresh', Date.now().toString());
                              
                              // 수강생 목록도 새로고침
                              if (selectedClassForStudents) {
                                const response = await studentService.getAll(academyId);
                                const allStudents = response.data?.students || response.data || [];
                                const classStudents = allStudents.filter(
                                  (s) => s.class_id === selectedClassForStudents.id
                                );
                                setEnrolledStudents(classStudents);
                              }
                            } catch (error) {
                              console.error('학생 삭제 실패:', error);
                              alert('학생 삭제에 실패했습니다.');
                            }
                          }}
                          style={{
                            width: '28px',
                            height: '28px',
                            padding: '0',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            transition: 'transform 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                          }}
                          title="삭제"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!academyId || !selectedClassForStudents) {
                              alert('학원 정보 또는 수업 정보가 없습니다.');
                              return;
                            }

                            try {
                              const today = new Date();
                              // 로컬 날짜를 YYYY-MM-DD 형식으로 변환 (타임존 문제 방지)
                              const year = today.getFullYear();
                              const month = String(today.getMonth() + 1).padStart(2, '0');
                              const day = String(today.getDate()).padStart(2, '0');
                              const dateStr = `${year}-${month}-${day}`;

                              await attendanceService.create({
                                academyId,
                                studentId: student.id,
                                classId: selectedClassForStudents.id,
                                enrollmentId: student.enrollment_id,
                                date: dateStr,
                                status: 'present',
                                note: '',
                              });

                              // 학생 상세 페이지에 출석 변경 알림
                              localStorage.setItem('studentAttendanceUpdate', JSON.stringify({
                                studentId: student.id,
                                timestamp: Date.now(),
                                action: 'create',
                                date: dateStr,
                              }));

                              const todayFormatted = today.toLocaleDateString('ko-KR');
                              alert(`${student.name} 학생의 출석이 기록되었습니다.\n날짜: ${todayFormatted}`);
                            } catch (error) {
                              console.error('출석 등록 실패:', error);
                              alert('출석 등록에 실패했습니다.');
                            }
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#27ae60',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#229954'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#27ae60'}
                        >
                          출석
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!academyId || !selectedClassForStudents) {
                              alert('학원 정보 또는 수업 정보가 없습니다.');
                              return;
                            }

                            try {
                              const today = new Date();
                              // 로컬 날짜를 YYYY-MM-DD 형식으로 변환 (타임존 문제 방지)
                              const year = today.getFullYear();
                              const month = String(today.getMonth() + 1).padStart(2, '0');
                              const day = String(today.getDate()).padStart(2, '0');
                              const dateStr = `${year}-${month}-${day}`;

                              await attendanceService.create({
                                academyId,
                                studentId: student.id,
                                classId: selectedClassForStudents.id,
                                enrollmentId: student.enrollment_id,
                                date: dateStr,
                                status: 'absent',
                                note: '',
                              });

                              // 학생 상세 페이지에 출석 변경 알림
                              localStorage.setItem('studentAttendanceUpdate', JSON.stringify({
                                studentId: student.id,
                                timestamp: Date.now(),
                                action: 'create',
                                date: dateStr,
                              }));

                              const todayFormatted = today.toLocaleDateString('ko-KR');
                              alert(`${student.name} 학생의 결석이 기록되었습니다.\n날짜: ${todayFormatted}`);
                            } catch (error) {
                              console.error('결석 등록 실패:', error);
                              alert('결석 등록에 실패했습니다.');
                            }
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#c0392b'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#e74c3c'}
                        >
                          결석
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!academyId || !selectedClassForStudents) {
                              alert('학원 정보 또는 수업 정보가 없습니다.');
                              return;
                            }

                            try {
                              const today = new Date();
                              // 로컬 날짜를 YYYY-MM-DD 형식으로 변환 (타임존 문제 방지)
                              const year = today.getFullYear();
                              const month = String(today.getMonth() + 1).padStart(2, '0');
                              const day = String(today.getDate()).padStart(2, '0');
                              const dateStr = `${year}-${month}-${day}`;

                              await attendanceService.create({
                                academyId,
                                studentId: student.id,
                                classId: selectedClassForStudents.id,
                                enrollmentId: student.enrollment_id,
                                date: dateStr,
                                status: 'official', // 이월은 공결로 처리
                                note: '이월',
                              });

                              // 학생 상세 페이지에 출석 변경 알림
                              localStorage.setItem('studentAttendanceUpdate', JSON.stringify({
                                studentId: student.id,
                                timestamp: Date.now(),
                                action: 'create',
                                date: dateStr,
                              }));

                              const todayFormatted = today.toLocaleDateString('ko-KR');
                              alert(`${student.name} 학생의 이월이 기록되었습니다.\n날짜: ${todayFormatted}`);
                            } catch (error) {
                              console.error('이월 등록 실패:', error);
                              alert('이월 등록에 실패했습니다.');
                            }
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#f39c12',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#d68910'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#f39c12'}
                        >
                          이월
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ marginBottom: '16px', fontSize: '0.9rem', color: '#666' }}>
                아직 이 수업에 등록된 학생이 없습니다.
              </div>
            </div>
          )
        ) : (
          <div style={{ padding: '12px 4px', fontSize: '0.9rem' }}>
            수업 정보를 불러오는 중입니다.
          </div>
        )}
      </Modal>
      
      {/* 등록 모달 */}
      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />
    </div>
  );
};

export default Classes;
