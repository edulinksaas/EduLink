import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teacherService } from '../services/teacherService';
import { classService } from '../services/classService';
import { studentService } from '../services/studentService';
import { subjectService } from '../services/subjectService';
import { academyService } from '../services/academyService';
import { classroomService } from '../services/classroomService';
import { timetableSettingsService } from '../services/timetableSettingsService';
import { tuitionFeeService } from '../services/tuitionFeeService';
import { useAcademy } from '../contexts/AcademyContext';
import Modal from '../components/Modal';
import Form from '../components/Form';
import ClassFormModal from '../components/ClassFormModal';
import { checkAndDeleteEmptyClass } from '../utils/classAutoDelete';
import './TeacherDetail.css';
import '../pages/Classes.css';

const TeacherDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { academy, academyId } = useAcademy();
  const [teacher, setTeacher] = useState(null);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [timetableSettings, setTimetableSettings] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedClassForStudents, setSelectedClassForStudents] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [isStudentRegisterModalOpen, setIsStudentRegisterModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [selectedDay, setSelectedDay] = useState('월');
  const [allowedDaysForModal, setAllowedDaysForModal] = useState(['월', '화', '수', '목', '금', '토', '일']); // 모달에서 선택 가능한 요일
  const [selectedTimetableType, setSelectedTimetableType] = useState('weekday'); // 'weekday' 또는 'weekend'
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [tuitionFees, setTuitionFees] = useState([]);
  const [studentFormData, setStudentFormData] = useState({
    name: '',
    parent_contact: '',
    payment_method: '',
    class_id: '',
    teacher_id: '',
    fee: '',
    receipt_file: null,
    note: '',
  });

  // 통계 계산 (useMemo로 최적화)
  const teacherStats = useMemo(() => {
    if (!students || students.length === 0) {
      return {
        monthlySales: 0,
        monthlyRegistrations: 0,
        monthlyStudents: 0,
      };
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-based

    const getCreatedDate = (student) => {
      const created = student.createdAt || student.created_at;
      return created ? new Date(created) : null;
    };

    // 해당 월에 등록된 학생 필터링
    const monthlyStudents = students.filter((student) => {
      const createdDate = getCreatedDate(student);
      if (!createdDate) return false;
      return (
        createdDate.getFullYear() === currentYear &&
        createdDate.getMonth() === currentMonth
      );
    });

    const monthlyRegistrations = monthlyStudents.length;

    // 월 매출 계산 (해당 월에 등록된 학생들의 fee 합계)
    const monthlySales = monthlyStudents.reduce((sum, student) => {
      const feeValue =
        typeof student.fee === 'number'
          ? student.fee
          : student.fee
          ? parseInt(student.fee, 10)
          : 0;
      return sum + (Number.isNaN(feeValue) ? 0 : feeValue);
    }, 0);

    return {
      monthlySales,
      monthlyRegistrations,
      monthlyStudents: monthlyRegistrations, // 해당 월 인원 수는 월 신규등록과 동일
    };
  }, [students]);

  // 시간 파싱 함수들 (Classes 페이지와 동일)
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
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const parseHHMMToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const parts = String(timeStr).split(':');
    if (parts.length !== 2) return null;
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) return null;
    return hours * 60 + minutes;
  };

  const generateTimeSlotsFromSettings = (startTimeStr, endTimeStr) => {
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

  // 색상 함수들 (Classes 페이지와 동일)
  const lightenColor = (hex, mixRatio = 0.5) => {
    if (!hex) return '#e3f2fd';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const whiteR = 255;
    const whiteG = 255;
    const whiteB = 255;
    const newR = Math.round(r * mixRatio + whiteR * (1 - mixRatio));
    const newG = Math.round(g * mixRatio + whiteG * (1 - mixRatio));
    const newB = Math.round(b * mixRatio + whiteB * (1 - mixRatio));
    return `rgb(${newR}, ${newG}, ${newB})`;
  };

  const getHoverColor = (hex, mixRatio = 0.4) => {
    return lightenColor(hex, mixRatio);
  };

  useEffect(() => {
    loadTeacherData();
  }, [id]);

  // Classes 페이지에서 변경 시 자동 새로고침
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'teacherDetailPageRefresh' && id) {
        console.log('🔄 Classes 페이지에서 수업/학생 변경 감지, TeacherDetail 페이지 새로고침');
        loadTeacherData();
      }
    };

    // storage 이벤트 리스너 등록 (다른 탭/창에서의 변경 감지)
    window.addEventListener('storage', handleStorageChange);

    // 같은 페이지에서의 변경 감지 (polling 방식)
    const interval = setInterval(() => {
      const refreshTime = localStorage.getItem('teacherDetailPageRefresh');
      if (refreshTime && id) {
        const lastRefresh = parseInt(refreshTime);
        const now = Date.now();
        // 1초 이내의 변경만 처리 (너무 자주 새로고침 방지)
        if (now - lastRefresh < 1000) {
          console.log('🔄 수업/학생 변경 감지, TeacherDetail 페이지 새로고침');
          loadTeacherData();
          // 처리 후 플래그 제거
          localStorage.removeItem('teacherDetailPageRefresh');
        }
      }
    }, 500); // 0.5초마다 확인

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [id]);

  // 시간표 설정 로드
  useEffect(() => {
    const loadTimetableSettings = async () => {
      if (!academyId) return;
      
      try {
        const response = await timetableSettingsService.get(academyId);
        const dbSettings = response?.settings;
        if (dbSettings) {
          const normalizedSettings = {
            timeInterval: dbSettings.time_interval || dbSettings.timeInterval || '1시간',
            dayTimeSettings: dbSettings.day_time_settings || dbSettings.dayTimeSettings || {},
            operatingDays: dbSettings.operating_days || dbSettings.operatingDays || [],
          };
          setTimetableSettings(normalizedSettings);
          
          // 모든 요일의 시간 범위를 확인하여 가장 넓은 범위로 시간대 생성
          const allDays = ['월', '화', '수', '목', '금', '토', '일'];
          const allDayTimes = allDays
            .map(day => {
              const daySetting = normalizedSettings.dayTimeSettings[day];
              if (!daySetting) return null;
              const startTime = daySetting.startTime || daySetting.start_time || '오전 09:00';
              const endTime = daySetting.endTime || daySetting.end_time || '오후 10:00';
              return {
                start: parseTime(startTime),
                end: parseTime(endTime)
              };
            })
            .filter(Boolean);
          
          // 가장 이른 시작 시간과 가장 늦은 종료 시간
          const overallStart = allDayTimes.length > 0
            ? Math.min(...allDayTimes.map(t => t.start))
            : parseTime('오전 09:00');
          const overallEnd = allDayTimes.length > 0
            ? Math.max(...allDayTimes.map(t => t.end))
            : parseTime('오후 10:00');
          
          // 시간 문자열로 변환
          const startTimeStr = overallStart < 12 * 60 
            ? `오전 ${formatTime(overallStart)}` 
            : `오후 ${formatTime(overallStart)}`;
          const endTimeStr = overallEnd < 12 * 60 
            ? `오전 ${formatTime(overallEnd)}` 
            : `오후 ${formatTime(overallEnd)}`;
          
          const slots = generateTimeSlotsFromSettings(startTimeStr, endTimeStr);
          setTimeSlots(slots);
        } else {
          // 기본값
          const slots = generateTimeSlotsFromSettings('오전 09:00', '오후 10:00');
          setTimeSlots(slots);
        }
      } catch (error) {
        // 429 에러 등 rate limit 에러는 재시도하지 않음
        if (error?.response?.status === 429) {
          console.warn('⚠️ API 요청 제한 초과, 기본값 사용');
        } else {
          console.warn('시간표 설정 로드 실패:', error);
        }
        const slots = generateTimeSlotsFromSettings('오전 09:00', '오후 10:00');
        setTimeSlots(slots);
      }
    };

    if (academyId) {
      loadTimetableSettings();
    }
  }, [academyId]);

  // 결제 방법 및 수강료 로드
  useEffect(() => {
    const loadPaymentMethodsAndFees = async () => {
      // 결제 방법 로드 (localStorage)
      const storedPaymentMethods = localStorage.getItem('paymentMethods');
      if (storedPaymentMethods) {
        try {
          const methods = JSON.parse(storedPaymentMethods);
          setPaymentMethods(methods);
        } catch (error) {
          console.error('결제 방법 파싱 실패:', error);
          setPaymentMethods(['현금', '카드', '계좌이체', '무통장입금']);
        }
      } else {
        setPaymentMethods(['현금', '카드', '계좌이체', '무통장입금']);
      }

      // 수강료 로드 (서버)
      if (academyId) {
        try {
          const response = await tuitionFeeService.getAll(academyId);
          const fees = response.fees || response.data?.fees || response.data || [];
          
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
      }
    };

    loadPaymentMethodsAndFees();
  }, [academyId]);

  // 학부모 연락처 자동 생성 함수
  const generateParentContact = () => {
    const middle = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const last = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `010-${middle}-${last}`;
  };

  // 학생 등록 모달이 열릴 때 학부모 연락처 자동 생성
  useEffect(() => {
    if (isStudentRegisterModalOpen && !studentFormData.parent_contact) {
      setStudentFormData(prev => ({
        ...prev,
        parent_contact: generateParentContact()
      }));
    }
  }, [isStudentRegisterModalOpen]);

  // 수업별 학생 수 계산
  const classStudentCounts = useMemo(() => {
    const counts = {};
    allStudents.forEach(student => {
      if (student.class_id) {
        counts[student.class_id] = (counts[student.class_id] || 0) + 1;
      }
    });
    return counts;
  }, [allStudents]);

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      
      // 학원 ID 가져오기
      let currentAcademyId = academyId || academy?.id;
      if (!currentAcademyId) {
        const academiesRes = await academyService.getAll();
        const academies = academiesRes.data.academies || [];
        currentAcademyId = academies[0]?.id;
      }

      if (!currentAcademyId) {
        console.error('학원 정보를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      // 선생님 정보 로드
      const teacherRes = await teacherService.getAll(currentAcademyId);
      const teachersList = teacherRes.data.teachers || [];
      const foundTeacher = teachersList.find(t => t.id === id);
      
      if (!foundTeacher) {
        console.error('선생님을 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      setTeacher(foundTeacher);

      // 과목 정보 로드
      const subjectsRes = await subjectService.getAll(currentAcademyId);
      setSubjects(subjectsRes.data.subjects || []);

      // 선생님 목록 로드
      const teachersRes = await teacherService.getAll(currentAcademyId);
      setTeachers(teachersRes.data.teachers || []);

      // 담당 수업 목록 로드
      const classesRes = await classService.getAll(currentAcademyId);
      const allClasses = classesRes.data.classes || [];
      const teacherClasses = allClasses.filter(c => c.teacher_id === id);
      setClasses(teacherClasses);

      // 전체 학생 목록 로드 (학생 리스트 모달용)
      const studentsRes = await studentService.getAll(currentAcademyId);
      const allStudentsList = studentsRes.data.students || studentsRes.data || [];
      setAllStudents(allStudentsList);

      // 담당 학생 목록 로드
      const teacherStudents = allStudentsList.filter(s => s.teacher_id === id);
      setStudents(teacherStudents);

      // 강의실 정보 로드
      const classroomsRes = await classroomService.getAll(currentAcademyId);
      const allClassrooms = classroomsRes.data.classrooms || [];
      
      // 시간표 설정에서 강의실 ID 가져오기
      try {
        const settingsResponse = await timetableSettingsService.get(currentAcademyId);
        const settings = settingsResponse?.settings;
        const settingsClassroomIds = settings?.classroom_ids || settings?.classroomIds || [];
        
        if (settingsClassroomIds.length > 0) {
          const filteredClassrooms = allClassrooms.filter(c => 
            settingsClassroomIds.includes(c.id)
          );
          setClassrooms(filteredClassrooms);
        } else {
          setClassrooms(allClassrooms);
        }
      } catch (error) {
        console.warn('시간표 설정 로드 실패:', error);
        setClassrooms(allClassrooms);
      }

    } catch (error) {
      console.error('선생님 정보 로드 실패:', error);
      alert('선생님 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 근무 요일 정렬 함수
  const sortWorkDays = (days) => {
    const order = ['월', '화', '수', '목', '금', '토', '일'];
    return days.sort((a, b) => {
      const indexA = order.indexOf(a.trim());
      const indexB = order.indexOf(b.trim());
      return indexA - indexB;
    });
  };

  const workDays = teacher?.work_days 
    ? sortWorkDays(teacher.work_days.split(',')) 
    : [];
  
  // 평일과 주말 분리
  const weekdayDays = ['월', '화', '수', '목', '금'];
  const weekendDays = ['토', '일'];
  const teacherWeekdays = workDays.filter(day => weekdayDays.includes(day));
  const teacherWeekends = workDays.filter(day => weekendDays.includes(day));

  const teacherSubjectIds = teacher?.subject_ids || [];
  const teacherSubjects = teacherSubjectIds
    .map(subjectId => subjects.find(s => s.id === subjectId))
    .filter(Boolean);


  // 수업 수정 핸들러
  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    // 수정 시에는 모든 요일 선택 가능하도록 설정
    setAllowedDaysForModal(['월', '화', '수', '목', '금', '토', '일']);
    setIsClassModalOpen(true);
  };

  // 수업 삭제 핸들러
  const handleDelete = async (classItem, e) => {
    e.stopPropagation();
    
    const confirmed = window.confirm(`"${classItem.name}" 수업을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`);
    
    if (!confirmed) return;
    
    try {
      await classService.delete(classItem.id);
      alert('수업이 삭제되었습니다.');
      
      // 수업 목록 다시 로드
      let currentAcademyId = academyId || academy?.id;
      if (!currentAcademyId) {
        const academiesRes = await academyService.getAll();
        const academies = academiesRes.data.academies || [];
        currentAcademyId = academies[0]?.id;
      }
      
      const classesRes = await classService.getAll(currentAcademyId);
      const allClasses = classesRes.data.classes || [];
      const teacherClasses = allClasses.filter(c => c.teacher_id === id);
      setClasses(teacherClasses);

      // Classes 페이지에 변경 알림 (localStorage를 통한 간단한 이벤트 시스템)
      localStorage.setItem('classesPageRefresh', Date.now().toString());
    } catch (error) {
      console.error('수업 삭제 실패:', error);
      let errorMessage = '삭제에 실패했습니다.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
        } else if (errorData.message) {
          errorMessage = typeof errorData.message === 'string' ? errorData.message : JSON.stringify(errorData.message);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`수업 삭제에 실패했습니다: ${errorMessage}`);
    }
  };

  // 학생 리스트 열기 핸들러
  const handleOpenStudentList = async (classItem) => {
    try {
      let currentAcademyId = academyId || academy?.id;
      if (!currentAcademyId) {
        const academiesRes = await academyService.getAll();
        const academies = academiesRes.data.academies || [];
        currentAcademyId = academies[0]?.id;
      }

      if (!currentAcademyId) {
        alert('학원 정보를 불러올 수 없습니다. 페이지를 새로고침해주세요.');
        return;
      }

      setSelectedClassForStudents(classItem);

      let sourceStudents = allStudents;
      if (!sourceStudents || sourceStudents.length === 0) {
        const response = await studentService.getAll(currentAcademyId);
        sourceStudents = response.data?.students || response.data || [];
        setAllStudents(sourceStudents);
      }

      const classStudents = sourceStudents.filter(
        (student) => student.class_id === classItem.id
      );

      setEnrolledStudents(classStudents);
      setIsStudentModalOpen(true);
    } catch (error) {
      console.error('수업별 학생 목록 조회 실패:', error);
      alert('수업에 등록된 학생 목록을 불러오지 못했습니다.');
    }
  };

  // 시간 간격을 분으로 변환
  const getIntervalMinutes = (interval) => {
    if (interval === '30분') return 30;
    if (interval === '40분') return 40;
    if (interval === '50분') return 50;
    if (interval === '1시간') return 60;
    if (interval === '1시간 30분') return 90;
    return 60; // 기본값
  };

  // 종료 시간 계산
  const calculateEndTime = (startTime) => {
    if (!startTime) return null;
    
    const interval = timetableSettings?.timeInterval || timetableSettings?.time_interval || '1시간';
    const intervalMinutes = getIntervalMinutes(interval);
    
    const parseTimeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = startMinutes + intervalMinutes;
    
    const formatMinutesToTime = (totalMinutes) => {
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };
    
    return formatMinutesToTime(endMinutes);
  };

  // 폼 데이터 변경 핸들러
  const handleFormChange = (name, value, allData) => {
    const newData = { ...allData };
    
    // 수업 유형이 변경되면 정원 자동 설정
    if (name === 'class_type' && value) {
      if (value === '2대1레슨') {
        newData.max_students = 2;
      } else if (value === '개인 레슨') {
        newData.max_students = 1;
      }
    }
    
    // 시작 시간이 변경되면 종료 시간 자동 계산
    if (name === 'start_time' && value) {
      const calculatedEndTime = calculateEndTime(value);
      if (calculatedEndTime) {
        newData.end_time = calculatedEndTime;
      }
    }
    
    setFormData(newData);
  };

  // 특정 시간대와 요일의 수업 찾기 (요일을 열로 표시)
  const getClassesForSlot = (timeSlot, day, selectedDays) => {
    if (!timeSlot || !day || !selectedDays || !selectedDays.includes(day)) {
      return [];
    }
    
    const slotStartMinutes = parseHHMMToMinutes(String(timeSlot));
    const slotEndMinutes = slotStartMinutes != null ? slotStartMinutes + 60 : null;
    
    if (slotStartMinutes == null || slotEndMinutes == null) return [];
    
    return classes.filter(cls => {
      // 요일 매칭
      if (cls.schedule && cls.schedule !== day) return false;
      
      if (!cls.start_time || !cls.end_time) return false;
      
      const clsStart = parseHHMMToMinutes(String(cls.start_time));
      const clsEnd = parseHHMMToMinutes(String(cls.end_time));
      if (clsStart == null || clsEnd == null) return false;
      
      // 수업의 시작 시간이 이 슬롯 시간 범위에 속하는지 확인
      // 수업이 이 슬롯에서 시작해야 함 (시작 시간이 슬롯 범위 내)
      const startsInSlot = clsStart >= slotStartMinutes && clsStart < slotEndMinutes;
      if (!startsInSlot) return false;
      
      return true;
    });
  };

  // 시간표 렌더링 함수 (요일을 열로, 시간을 행으로 표시)
  const renderTimetable = (selectedDays) => {
    if (!selectedDays || selectedDays.length === 0) return null;

    // 해당 요일들의 시간 범위 계산
    const dayTimeRanges = selectedDays
      .map(day => {
        const daySetting = timetableSettings?.dayTimeSettings?.[day];
        if (!daySetting) return null;
        const startTime = daySetting.startTime || daySetting.start_time || '오전 09:00';
        const endTime = daySetting.endTime || daySetting.end_time || '오후 10:00';
        return {
          start: parseTime(startTime),
          end: parseTime(endTime)
        };
      })
      .filter(Boolean);
    
    // 가장 이른 시작 시간과 가장 늦은 종료 시간
    const minStart = dayTimeRanges.length > 0 
      ? Math.min(...dayTimeRanges.map(r => r.start))
      : parseTime('오전 09:00');
    const maxEnd = dayTimeRanges.length > 0
      ? Math.max(...dayTimeRanges.map(r => r.end))
      : parseTime('오후 10:00');
    
    // 해당 요일들의 시간 범위에 맞는 시간대만 필터링
    const filteredTimeSlots = timeSlots.filter(timeSlot => {
      const slotMinutes = parseHHMMToMinutes(timeSlot);
      return slotMinutes != null && slotMinutes >= minStart && slotMinutes < maxEnd;
    });

    return (
      <div className="timetable-container">
        <table className="timetable">
          <thead>
            <tr>
              <th className="time-column">시간</th>
              {selectedDays.map((day) => (
                <th key={day} className="classroom-column">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTimeSlots.map((timeSlot) => {
              const slotStartMinutes = parseHHMMToMinutes(String(timeSlot));
              return (
                <tr key={timeSlot}>
                  <td className="time-cell">{timeSlot}</td>
                  {selectedDays.map((day) => {
                    // 해당 요일의 수업 찾기 (모든 강의실에서 검색)
                    let classItems = [];
                    for (const classroom of classrooms) {
                      const found = getClassesForSlot(timeSlot, day, selectedDays);
                      if (found && found.length > 0) {
                        // 해당 강의실의 수업만 필터링
                        const classroomClasses = found.filter(cls => 
                          String(cls.classroom_id || '') === String(classroom.id || '')
                        );
                        if (classroomClasses.length > 0) {
                          classItems.push(...classroomClasses);
                        }
                      }
                    }
                    
                    // 중복 제거 (같은 수업이 여러 강의실에서 매칭될 수 있음)
                    const uniqueClassItems = classItems.filter((cls, index, self) =>
                      index === self.findIndex(c => c.id === cls.id)
                    );
                    
                    return (
                      <td key={day} className="classroom-cell">
                        {uniqueClassItems.map((classItem) => {
                          const subject = subjects.find(s => s.id === classItem.subject_id);
                          const classroom = classrooms.find(c => c.id === classItem.classroom_id);
                          
                          // 수업 아이템의 위치와 높이 계산
                          let itemStyle = {};
                          if (classItem.start_time && classItem.end_time) {
                            const classStartMinutes = parseHHMMToMinutes(String(classItem.start_time));
                            const classEndMinutes = parseHHMMToMinutes(String(classItem.end_time));
                            
                            if (slotStartMinutes != null && classStartMinutes != null && classEndMinutes != null) {
                              const cellHeightMinutes = 60;
                              const offsetMinutes = classStartMinutes - slotStartMinutes;
                              const durationMinutes = classEndMinutes - classStartMinutes;
                              
                              // 수업이 이 슬롯에서 시작하는 경우 (offsetMinutes >= 0 && offsetMinutes < 60)
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
                          
                          const subjectColor = subject?.color || '#1976d2';
                          const backgroundColor = lightenColor(subjectColor, 0.5);
                          const borderColor = subjectColor;
                          const textColor = '#000000';
                          
                          const studentCount = classStudentCounts[classItem.id] || 0;
                          const maxStudents = classItem?.max_students || 0;
                          
                          return itemStyle.position === 'absolute' ? (
                            <div
                              key={classItem.id}
                              className="class-item"
                              style={{
                                ...itemStyle,
                                backgroundColor: backgroundColor,
                                borderColor: borderColor,
                                color: textColor
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = getHoverColor(subjectColor, 0.4);
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
                              {classroom && (
                                <div className="class-item-teacher">
                                  {classroom.name}
                                </div>
                              )}
                              <div className="class-item-students">
                                학생: {studentCount}{maxStudents > 0 ? `/${maxStudents}` : ''}명
                              </div>
                            </div>
                          ) : null;
                        })}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="teacher-detail-page">
        <div className="loading-container">
          <div className="loading-text">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="teacher-detail-page">
        <div className="error-container">
          <div className="error-text">선생님 정보를 찾을 수 없습니다.</div>
          <button 
            className="back-button"
            onClick={() => navigate('/teachers')}
          >
            선생님 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-detail-page">
      {/* 헤더 섹션 */}
      <section className="teacher-header">
        <div className="teacher-header-top">
          <div className="teacher-header-text">
            <h1 className="teacher-name-text">{teacher.name}</h1>
            {teacher.contact && (
              <div className="teacher-contact">
                연락처: {teacher.contact}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 통계 카드 섹션 */}
      <div className="summary-cards">
        {/* <div className="summary-card">
          <div className="summary-card-title">월 매출</div>
          <div className="summary-card-value">₩{teacherStats.monthlySales.toLocaleString()}</div>
        </div> */}
        <div className="summary-card">
          <div className="summary-card-title">월 신규등록</div>
          <div className="summary-card-value">{teacherStats.monthlyRegistrations}명</div>
        </div>
        <div 
          className="summary-card" 
          onClick={() => navigate(`/students?teacher_id=${id}`)}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px', textAlign: 'center' }}>담당 학생 페이지로 가기</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <div className="summary-card-title" style={{ margin: 0 }}>담당 학생 수</div>
            <div className="summary-card-value" style={{ margin: 0 }}>{students.length}명</div>
          </div>
        </div>
      </div>

      {/* 근무 요일 섹션 */}
      {workDays.length > 0 && (
        <section className="teacher-section">
          <h2 className="section-title">근무 요일</h2>
          <div className="work-days-container">
            {workDays.map((day, index) => (
              <span key={index} className="day-badge">{day}</span>
            ))}
          </div>
        </section>
      )}

      {/* 담당 과목 섹션 */}
      {teacherSubjects.length > 0 && (
        <section className="teacher-section">
          <h2 className="section-title">담당 과목</h2>
          <div className="subjects-container">
            {teacherSubjects.map((subject, index) => (
              <span 
                key={index} 
                className="subject-badge"
                style={{ 
                  backgroundColor: subject.color ? `${subject.color}20` : '#e3f2fd',
                  color: subject.color || '#1976d2',
                  borderColor: subject.color || '#1976d2'
                }}
              >
                {subject.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 선생님 시간표 섹션 */}
      {workDays.length > 0 && (
        <section className="teacher-section">
          <div className="page-header-section">
            <h2 className="section-title" style={{ margin: 0 }}>시간표</h2>
            <div className="header-actions">
              <div className="day-buttons">
                {teacherWeekdays.length > 0 && (
                  <button
                    className={`day-button ${selectedTimetableType === 'weekday' ? 'active' : ''}`}
                    onClick={() => setSelectedTimetableType('weekday')}
                  >
                    평일
                  </button>
                )}
                {teacherWeekends.length > 0 && (
                  <button
                    className={`day-button ${selectedTimetableType === 'weekend' ? 'active' : ''}`}
                    onClick={() => setSelectedTimetableType('weekend')}
                  >
                    주말
                  </button>
                )}
              </div>
              <button
                className="add-class-header-button"
                onClick={() => {
                  setEditingClass(null);
                  if (selectedTimetableType === 'weekday') {
                    setAllowedDaysForModal(['월', '화', '수', '목', '금']); // 평일만 선택 가능
                  } else {
                    setAllowedDaysForModal(['토', '일']); // 주말만 선택 가능
                  }
                  setIsClassModalOpen(true);
                }}
              >
                + 수업 추가
              </button>
            </div>
          </div>
          {selectedTimetableType === 'weekday' && teacherWeekdays.length > 0 && renderTimetable(teacherWeekdays)}
          {selectedTimetableType === 'weekend' && teacherWeekends.length > 0 && renderTimetable(teacherWeekends)}
        </section>
      )}

      {/* 학생 리스트 모달 */}
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
                  
                  setStudentFormData({
                    name: '',
                    parent_contact: generateParentContact(),
                    payment_method: '',
                    class_id: selectedClassForStudents.id,
                    teacher_id: id,
                    fee: '',
                    receipt_file: null,
                    note: '',
                  });
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
                            // TODO: 학생 수정 기능 추가
                            alert('학생 수정 기능은 준비 중입니다.');
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
                                  await loadTeacherData(); // 수업 목록 새로고침
                                  // Classes 페이지에 변경 알림
                                  localStorage.setItem('classesPageRefresh', Date.now().toString());
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
                              const studentsRes = await studentService.getAll(academyId);
                              const allStudentsList = studentsRes.data?.students || studentsRes.data || [];
                              setAllStudents(allStudentsList);
                              const teacherStudents = allStudentsList.filter(s => s.teacher_id === id);
                              setStudents(teacherStudents);
                              
                              // Classes 페이지에 변경 알림
                              localStorage.setItem('classesPageRefresh', Date.now().toString());
                              
                              // 수강생 목록도 새로고침
                              if (selectedClassForStudents) {
                                const classStudents = allStudentsList.filter(
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
                          onClick={() => {
                            const today = new Date().toLocaleDateString('ko-KR');
                            alert(`${student.name} 학생의 출석이 기록되었습니다.\n날짜: ${today}`);
                            // TODO: 출석 데이터 저장 로직 추가
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
                          onClick={() => {
                            const today = new Date().toLocaleDateString('ko-KR');
                            alert(`${student.name} 학생의 결석이 기록되었습니다.\n날짜: ${today}`);
                            // TODO: 결석 데이터 저장 로직 추가
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
                          onClick={() => {
                            const today = new Date().toLocaleDateString('ko-KR');
                            alert(`${student.name} 학생의 이월이 기록되었습니다.\n날짜: ${today}`);
                            // TODO: 이월 데이터 저장 로직 추가
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
            <div className="empty-state">
              <div className="empty-message">등록된 학생이 없습니다</div>
            </div>
          )
        ) : null}
      </Modal>

      {/* 학생 등록 모달 */}
      <Modal
        isOpen={isStudentRegisterModalOpen}
        onClose={() => {
          setIsStudentRegisterModalOpen(false);
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
        }}
        title="학생 등록"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              let currentAcademyId = academyId || academy?.id;
              if (!currentAcademyId) {
                const academiesRes = await academyService.getAll();
                const academies = academiesRes.data.academies || [];
                currentAcademyId = academies[0]?.id;
              }

              if (!currentAcademyId) {
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
                academy_id: currentAcademyId,
                class_id: studentFormData.class_id,
                teacher_id: studentFormData.teacher_id,
                fee: studentFormData.fee ? parseInt(studentFormData.fee, 10) : null,
                has_receipt: !!studentFormData.receipt_file,
              };

              await studentService.create(studentData);
              alert('학생이 등록되었습니다.');

              // 학생 목록 새로고침
              const studentsRes = await studentService.getAll(currentAcademyId);
              const allStudentsList = studentsRes.data?.students || studentsRes.data || [];
              setAllStudents(allStudentsList);
              const teacherStudents = allStudentsList.filter(s => s.teacher_id === id);
              setStudents(teacherStudents);

              // Classes 페이지에 변경 알림
              localStorage.setItem('classesPageRefresh', Date.now().toString());

              // 수강생 목록도 새로고침
              if (selectedClassForStudents) {
                const classStudents = allStudentsList.filter(
                  (student) => student.class_id === selectedClassForStudents.id
                );
                setEnrolledStudents(classStudents);
              }

              // 학생 등록 모달 닫기
              setIsStudentRegisterModalOpen(false);
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
              
              // 학생 목록 모달 다시 열기
              if (selectedClassForStudents) {
                setIsStudentModalOpen(true);
              }
            } catch (error) {
              console.error('학생 저장 실패:', error);
              alert('학생 저장에 실패했습니다.');
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

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                영수증 등록하기
              </label>
              <input
                type="file"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
                accept="image/*,.pdf"
                onChange={(e) =>
                  setStudentFormData({ ...studentFormData, receipt_file: e.target.files[0] })
                }
              />
              {studentFormData.receipt_file && (
                <span style={{ fontSize: '0.9rem', color: '#666', marginTop: '4px', display: 'block' }}>
                  선택된 파일: {studentFormData.receipt_file.name}
                </span>
              )}
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
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => {
                setIsStudentRegisterModalOpen(false);
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
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
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
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              등록
            </button>
          </div>
        </form>
      </Modal>


      {/* 수업 수정 모달 (레거시 - 제거 예정) */}
      {false && (
      <Modal
        isOpen={false}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClass(null);
          setFormData({});
        }}
        title="수업 수정"
      >
        <Form
            fields={[
            { name: 'schedule', label: '요일', required: true, type: 'select' },
            { name: 'class_type', label: '수업 유형', required: true, type: 'select' },
            { name: 'subject_id', label: '과목', required: true, type: 'select' },
            { name: 'teacher_id', label: '선생님', required: true, type: 'select' },
            { name: 'classroom_id', label: '강의실', required: true, type: 'select' },
            { name: 'name', label: '강의 명', required: true, maxLength: 20 },
            { name: 'level', label: '레벨', required: true },
            { name: 'start_time', label: '시작 시간', required: true, type: 'custom' },
            { name: 'end_time', label: '종료 시간', required: true, type: 'text', readOnly: true },
            { name: 'max_students', label: '정원', required: true, type: 'number' },
          ].map(field => {
            if (field.name === 'subject_id') {
              const subjectOptions = subjects && subjects.length > 0 
                ? subjects.map(s => ({ value: s.id, label: s.name }))
                : [];
              return { ...field, options: subjectOptions };
            } else if (field.name === 'teacher_id') {
              const teacherOptions = teachers && teachers.length > 0
                ? teachers.map(t => ({ value: t.id, label: t.name }))
                : [];
              return { ...field, options: teacherOptions };
            } else if (field.name === 'schedule') {
              const allDays = ['월', '화', '수', '목', '금', '토', '일'];
              return {
                ...field,
                options: allDays.map(d => ({ value: d, label: d })),
              };
            } else if (field.name === 'class_type') {
              return {
                ...field,
                options: [
                  { value: '단체반', label: '단체반' },
                  { value: '2대1레슨', label: '2대1레슨' },
                  { value: '개인 레슨', label: '개인 레슨' }
                ],
              };
            } else if (field.name === 'classroom_id') {
              const classroomOptions = classrooms && classrooms.length > 0
                ? classrooms.map(c => ({
                    value: c.id,
                    label: c.name,
                  }))
                : [];
              return {
                ...field,
                options: classroomOptions,
              };
            } else if (field.name === 'max_students') {
              // 정원 필드: 수업 유형에 따라 읽기 전용 처리
              const currentClassType = formData.class_type || editingClass?.class_type || '';
              const isReadOnly = currentClassType === '2대1레슨' || currentClassType === '개인 레슨';
              return {
                ...field,
                readOnly: isReadOnly,
              };
            } else if (field.name === 'start_time') {
              // 시작 시간: 시/분을 나눠서 입력 & 선택할 수 있는 커스텀 필드
              return {
                ...field,
                type: 'custom',
                render: ({ formData: fd, onChange, setField }) => {
                  const timeList = timeSlots || [];

                  if (!timeList || timeList.length === 0) {
                    return <div style={{ padding: '10px', color: '#999' }}>사용 가능한 시간대가 없습니다. 시간표 설정을 확인해주세요.</div>;
                  }

                  // 현재 값 또는 기본값
                  const currentValue =
                    fd.start_time ||
                    editingClass?.start_time ||
                    timeList[0];

                  const [currentHourRaw, currentMinuteRaw] = (currentValue || '00:00').split(':');
                  const currentHour = currentHourRaw || '00';
                  const currentMinute = currentMinuteRaw || '00';

                  // 24시간 형식: 00시부터 23시까지 모든 시간 옵션 제공
                  const allHours = Array.from({ length: 24 }, (_, i) => 
                    String(i).padStart(2, '0')
                  );

                  // 분 옵션은 0분~55분까지 5분 단위 고정
                  const minuteOptions = Array.from({ length: 12 }, (_, i) =>
                    String(i * 5).padStart(2, '0')
                  );

                  const handleHourChange = (e) => {
                    const newHour = e.target.value;
                    const newTime = `${newHour}:${currentMinute}`;
                    setField('start_time', newTime);
                    handleFormChange('start_time', newTime, { ...fd, start_time: newTime });
                  };

                  const handleMinuteChange = (e) => {
                    const newMinute = e.target.value;
                    const newTime = `${currentHour}:${newMinute}`;
                    setField('start_time', newTime);
                    handleFormChange('start_time', newTime, { ...fd, start_time: newTime });
                  };

                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <select
                        id={`${field.name}_hour`}
                        className="form-control"
                        value={currentHour}
                        onChange={handleHourChange}
                        style={{ maxWidth: '80px' }}
                        aria-label="시"
                      >
                        {allHours.map((h) => (
                          <option key={h} value={h}>
                            {`${h}시`}
                          </option>
                        ))}
                      </select>
                      <span>:</span>
                      <select
                        id={`${field.name}_minute`}
                        className="form-control"
                        value={currentMinute}
                        onChange={handleMinuteChange}
                        style={{ maxWidth: '80px' }}
                        aria-label="분"
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
          onSubmit={async (data) => {
            try {
              let currentAcademyId = academyId || academy?.id;
              if (!currentAcademyId) {
                const academiesRes = await academyService.getAll();
                const academies = academiesRes.data.academies || [];
                currentAcademyId = academies[0]?.id;
              }

              if (!currentAcademyId) {
                alert('학원 정보를 불러올 수 없습니다.');
                return;
              }

              const classData = {
                ...data,
                academy_id: currentAcademyId,
                teacher_id: data.teacher_id || id, // 선생님 ID는 현재 선생님으로 고정
              };

              if (!editingClass) {
                alert('수정할 수업이 선택되지 않았습니다.');
                return;
              }
              
              await classService.update(editingClass.id, classData);
              alert('수업이 수정되었습니다.');

              // 수업 목록 다시 로드
              const classesRes = await classService.getAll(currentAcademyId);
              const allClasses = classesRes.data.classes || [];
              const teacherClasses = allClasses.filter(c => c.teacher_id === id);
              setClasses(teacherClasses);

              // Classes 페이지에 변경 알림
              localStorage.setItem('classesPageRefresh', Date.now().toString());

              setIsModalOpen(false);
              setEditingClass(null);
              setFormData({});
            } catch (error) {
              console.error('수업 저장 실패:', error);
              alert('수업 저장에 실패했습니다.');
            }
          }}
          onChange={handleFormChange}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingClass(null);
            setFormData({});
          }}
          initialData={formData && Object.keys(formData).length > 0 ? formData : (editingClass || {})}
        />
      </Modal>
      )}

      {/* 수업 등록/수정 모달 */}
      <ClassFormModal
        isOpen={isClassModalOpen}
        onClose={() => {
          setIsClassModalOpen(false);
          setEditingClass(null);
          setAllowedDaysForModal(['월', '화', '수', '목', '금', '토', '일']); // 초기화
        }}
        editingClass={editingClass}
        subjects={subjects}
        teachers={teachers}
        classrooms={classrooms}
        timeSlots={timeSlots}
        selectedDay={selectedDay}
        academyId={academyId || academy?.id}
        defaultTeacherId={id}
        classStudentCounts={classStudentCounts}
        onSubmitSuccess={async () => {
          // 수업 목록 다시 로드
          let currentAcademyId = academyId || academy?.id;
          if (!currentAcademyId) {
            const academiesRes = await academyService.getAll();
            const academies = academiesRes.data.academies || [];
            currentAcademyId = academies[0]?.id;
          }
          
          const classesRes = await classService.getAll(currentAcademyId);
          const allClasses = classesRes.data.classes || [];
          const teacherClasses = allClasses.filter(c => c.teacher_id === id);
          setClasses(teacherClasses);
          
          // Classes 페이지에 변경 알림
          localStorage.setItem('classesPageRefresh', Date.now().toString());
          
          setIsClassModalOpen(false);
          setEditingClass(null);
        }}
        days={allowedDaysForModal}
      />
    </div>
  );
};

export default TeacherDetail;
