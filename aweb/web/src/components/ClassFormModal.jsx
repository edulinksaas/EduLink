import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Modal from './Modal';
import Form from './Form';
import { classService } from '../services/classService';
import { classroomService } from '../services/classroomService';
import { timetableSettingsService } from '../services/timetableSettingsService';
import { studentService } from '../services/studentService';

const ClassFormModal = ({
  isOpen,
  onClose,
  editingClass,
  subjects = [],
  teachers = [],
  classrooms = [],
  timeSlots = [],
  selectedDay = '월',
  selectedTimeSlot = null,
  selectedClassroom = null,
  academyId,
  onSubmitSuccess,
  defaultTeacherId = null, // TeacherDetail에서 사용
  days = ['월', '화', '수', '목', '금', '토', '일'],
  classStudentCounts = {}, // 수업별 학생 수 (선택적)
}) => {
  const [formData, setFormData] = useState({});
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [timeInterval, setTimeInterval] = useState('1시간'); // 기본값
  const [dayTimeSettings, setDayTimeSettings] = useState({}); // 요일별 운영 시간 설정
  const [classTypes, setClassTypes] = useState([]); // 수업 유형 목록 (객체 배열: { name, maxStudents })

  // "오전 09:00" 형식을 분 단위로 변환
  const parseTime = (timeStr) => {
    if (!timeStr) return null;
    const isAM = timeStr.includes('오전');
    const time = timeStr.replace(/오전|오후/g, '').trim();
    const [hours, minutes] = time.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes;
    if (!isAM && hours !== 12) {
      totalMinutes += 12 * 60;
    }
    return totalMinutes;
  };

  // 시간 간격 문자열을 분 단위로 변환
  const getIntervalMinutes = (interval) => {
    if (interval === '30분') return 30;
    if (interval === '40분') return 40;
    if (interval === '50분') return 50;
    if (interval === '1시간') return 60;
    if (interval === '1시간 30분') return 90;
    return 60; // 기본값
  };

  // "HH:MM" 형식의 시간을 분 단위 숫자로 변환
  const parseHHMMToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
  };

  // 종료 시간 계산 함수 (Settings의 시간 간격 설정 반영)
  // useCallback을 사용하여 timeInterval이 변경될 때마다 함수 재생성
  const calculateEndTime = useCallback((startTime) => {
    if (!startTime) return null;
    
    // Settings에서 설정한 시간 간격 가져오기 (항상 최신 값 사용)
    const intervalMinutes = getIntervalMinutes(timeInterval);
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + intervalMinutes;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
  }, [timeInterval]);

  // 수업 유형 로드
  useEffect(() => {
    const loadClassTypes = () => {
      try {
        const saved = localStorage.getItem('classTypes');
        if (saved) {
          const parsed = JSON.parse(saved);
          // 기존 문자열 배열 형식인 경우 객체 배열로 마이그레이션
          if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
            const migrated = parsed.map(type => {
              const typeLower = type.toLowerCase();
              let maxStudents = null;
              if (typeLower.includes('3대1') || typeLower.includes('3:1')) {
                maxStudents = 3;
              } else if (typeLower.includes('2대1') || typeLower.includes('2:1')) {
                maxStudents = 2;
              } else if (typeLower.includes('개인')) {
                maxStudents = 1;
              }
              return { name: type, maxStudents };
            });
            setClassTypes(migrated);
          } else {
            setClassTypes(parsed);
          }
        } else {
          // 기본값 설정 (객체 배열 형식)
          const defaultTypes = [
            { name: '단체반', maxStudents: null },
            { name: '2대1레슨', maxStudents: 2 },
            { name: '개인 레슨', maxStudents: 1 }
          ];
          setClassTypes(defaultTypes);
        }
      } catch (error) {
        console.error('수업 유형 로드 실패:', error);
        setClassTypes([
          { name: '단체반', maxStudents: null },
          { name: '2대1레슨', maxStudents: 2 },
          { name: '개인 레슨', maxStudents: 1 }
        ]);
      }
    };
    loadClassTypes();
  }, []);

  // 시간표 설정 로드 (시간 간격 및 요일별 운영 시간 가져오기)
  // 모달이 열릴 때마다 Settings를 다시 로드하여 최신 값 사용
  useEffect(() => {
    const loadTimetableSettings = async () => {
      if (!academyId) return;
      
      try {
        // DB에서 시간표 설정 로드
        const response = await timetableSettingsService.get(academyId);
        if (response?.settings) {
          const settings = response.settings;
          const interval = settings.time_interval || settings.timeInterval || '1시간';
          setTimeInterval(interval);
          
          const daySettings = settings.day_time_settings || settings.dayTimeSettings || {};
          setDayTimeSettings(daySettings);
        } else {
          // DB에 없으면 localStorage에서 로드
          const saved = localStorage.getItem('timetableSettings');
          if (saved) {
            try {
              const localSettings = JSON.parse(saved);
              if (localSettings.timeInterval) {
                setTimeInterval(localSettings.timeInterval);
              }
              if (localSettings.dayTimeSettings) {
                setDayTimeSettings(localSettings.dayTimeSettings);
              }
            } catch (e) {
              console.warn('localStorage 파싱 실패:', e);
            }
          }
        }
      } catch (error) {
        // 429 에러 등 rate limit 에러는 재시도하지 않음
        if (error?.response?.status === 429) {
          console.warn('⚠️ API 요청 제한 초과, localStorage로 폴백');
        } else {
          console.warn('시간표 설정 로드 실패:', error);
        }
        // localStorage에서 폴백
        const saved = localStorage.getItem('timetableSettings');
        if (saved) {
          try {
            const localSettings = JSON.parse(saved);
            if (localSettings.timeInterval) {
              setTimeInterval(localSettings.timeInterval);
            }
            if (localSettings.dayTimeSettings) {
              setDayTimeSettings(localSettings.dayTimeSettings);
            }
          } catch (e) {
            console.warn('localStorage 로드 실패:', e);
          }
        }
      }
    };
    
    // 모달이 열릴 때마다 Settings 로드
    if (isOpen) {
      loadTimetableSettings();
    }
  }, [academyId, isOpen]);

  // 시간표 설정에 따라 사용 가능한 시간대 필터링
  useEffect(() => {
    if (timeSlots && timeSlots.length > 0) {
      setAvailableTimeSlots(timeSlots);
    }
  }, [timeSlots, selectedDay]);

  // 모달이 열릴 때 또는 수업 유형이 변경될 때 정원 자동 설정 (설정 페이지에서 설정한 고정 정원 값 사용)
  useEffect(() => {
    if (isOpen) {
      const currentClassType = formData.class_type || editingClass?.class_type || '';
      if (currentClassType && classTypes.length > 0) {
        // 설정 페이지에서 설정한 수업 유형 정보 찾기
        const classTypeInfo = classTypes.find(ct => {
          const ctName = typeof ct === 'string' ? ct : ct.name;
          return ctName === currentClassType;
        });
        
        let maxStudents = null;
        
        if (classTypeInfo) {
          // 설정 페이지에서 설정한 고정 정원 값 사용
          if (typeof classTypeInfo === 'object' && classTypeInfo.maxStudents !== null) {
            maxStudents = classTypeInfo.maxStudents;
          }
        } else {
          // 설정 페이지에 없는 경우 기존 하드코딩된 로직 사용 (하위 호환성)
          const classTypeLower = currentClassType.toLowerCase();
          if (classTypeLower.includes('3대1') || classTypeLower.includes('3:1')) {
            maxStudents = 3;
          } else if (classTypeLower.includes('2대1') || classTypeLower.includes('2:1') || classTypeLower.includes('2대 1')) {
            maxStudents = 2;
          } else if (classTypeLower.includes('개인')) {
            maxStudents = 1;
          }
        }
        
        // 정원이 설정되어야 하는 경우에만 업데이트 (현재 값과 다를 때만)
        if (maxStudents !== null && formData.max_students !== maxStudents) {
          setFormData(prev => ({
            ...prev,
            max_students: maxStudents
          }));
        }
      }
    }
  }, [isOpen, formData.class_type, editingClass?.class_type, classTypes]);

  // 폼 데이터 변경 핸들러
  const handleFormChange = (name, value, newData) => {
    if (name === 'class_type') {
      // 수업 유형에 따라 정원 자동 설정 (설정 페이지에서 설정한 고정 정원 값 사용)
      if (value && classTypes.length > 0) {
        // 설정 페이지에서 설정한 수업 유형 정보 찾기
        const classTypeInfo = classTypes.find(ct => {
          const ctName = typeof ct === 'string' ? ct : ct.name;
          return ctName === value;
        });
        
        if (classTypeInfo && typeof classTypeInfo === 'object' && classTypeInfo.maxStudents !== null) {
          // 설정 페이지에서 설정한 고정 정원 값 사용
          newData.max_students = classTypeInfo.maxStudents;
        } else {
          // 설정 페이지에 없는 경우 기존 하드코딩된 로직 사용 (하위 호환성)
          const classTypeLower = value.toLowerCase();
          if (classTypeLower.includes('3대1') || classTypeLower.includes('3:1')) {
            newData.max_students = 3;
          } else if (classTypeLower.includes('2대1') || classTypeLower.includes('2:1') || classTypeLower.includes('2대 1')) {
            newData.max_students = 2;
          } else if (classTypeLower.includes('개인')) {
            newData.max_students = 1;
          }
          // 그 외의 경우 정원은 사용자가 직접 입력
        }
      }
    }

    if (name === 'start_time') {
      // 시작 시간 변경 시 종료 시간 자동 계산
      const endTime = calculateEndTime(value);
      newData.end_time = endTime;
    }

    setFormData(newData);
  };

  // 폼 제출 핸들러
  const handleSubmit = async (data) => {
    try {
      if (!academyId) {
        alert('학원 정보를 불러올 수 없습니다. 페이지를 새로고침해주세요.');
        return;
      }

      data.academy_id = academyId;

      // 요일 정보가 비어있으면 현재 선택된 요일로 설정
      if (!data.schedule) {
        data.schedule = selectedDay;
      }

      // defaultTeacherId가 있으면 기본값으로 설정 (선택 가능하지만 기본값 제공)
      if (defaultTeacherId && !data.teacher_id) {
        data.teacher_id = defaultTeacherId;
      }

      // 최신 강의실 목록 로드
      const latestClassrooms = await classroomService.getAll(academyId);
      const classroomsList = latestClassrooms.data?.classrooms || [];

      // 시간 정보 추가 (새 수업인 경우)
      if (selectedTimeSlot && !editingClass) {
        data.start_time = selectedTimeSlot;
      }

      // 강의실 ID 처리
      if (data.classroom_id) {
        const foundClassroom = classroomsList.find(c => c.id === data.classroom_id);
        if (!foundClassroom) {
          alert('선택한 강의실을 찾을 수 없습니다.');
          return;
        }
      }

      // 종료 시간이 없으면 자동 계산
      if (!data.end_time && data.start_time) {
        data.end_time = calculateEndTime(data.start_time);
      }

      // ===== 겹침 검사 =====
      if (data.start_time && data.end_time && data.classroom_id && data.teacher_id) {
        // 모든 수업 목록 가져오기 (겹침 검사용)
        const allClassesResponse = await classService.getAll(academyId);
        const allClasses = allClassesResponse.data?.classes || allClassesResponse.data || [];
        
        const newStart = parseHHMMToMinutes(data.start_time);
        const newEnd = parseHHMMToMinutes(data.end_time);
        const targetDay = data.schedule || selectedDay;

        if (newStart != null && newEnd != null) {
          // 1. 강의실 겹침 검사
          const classroomConflict = allClasses.find((cls) => {
            // 자신(수정 중인 수업)은 제외
            if (editingClass && cls.id === editingClass.id) return false;
            // 강의실이 다르면 패스
            if (!cls.classroom_id) return false;
            if (String(cls.classroom_id) !== String(data.classroom_id)) return false;
            // 요일이 다르면 패스
            if (cls.schedule && cls.schedule !== targetDay) return false;
            if (!cls.start_time || !cls.end_time) return false;

            const existStart = parseHHMMToMinutes(String(cls.start_time));
            const existEnd = parseHHMMToMinutes(String(cls.end_time));
            if (existStart == null || existEnd == null) return false;

            // 시간 겹침 여부: [start, end) 구간이 하나라도 겹치면 true
            return newStart < existEnd && existStart < newEnd;
          });

          if (classroomConflict) {
            alert('강의실이 겹칩니다.\n\n같은 요일, 같은 강의실에 시간이 겹치는 수업이 이미 등록되어 있습니다.');
            return;
          }

          // 2. 선생님 시간 겹침 검사
          const teacherConflict = allClasses.find((cls) => {
            // 자신(수정 중인 수업)은 제외
            if (editingClass && cls.id === editingClass.id) return false;
            // 선생님이 다르면 패스
            if (!cls.teacher_id) return false;
            if (String(cls.teacher_id) !== String(data.teacher_id)) return false;
            // 요일이 다르면 패스
            if (cls.schedule && cls.schedule !== targetDay) return false;
            if (!cls.start_time || !cls.end_time) return false;

            const existStart = parseHHMMToMinutes(String(cls.start_time));
            const existEnd = parseHHMMToMinutes(String(cls.end_time));
            if (existStart == null || existEnd == null) return false;

            // 시간 겹침 여부: [start, end) 구간이 하나라도 겹치면 true
            return newStart < existEnd && existStart < newEnd;
          });

          if (teacherConflict) {
            alert('선생님 수업 시간이 겹칩니다.\n\n같은 요일, 같은 선생님의 시간이 겹치는 수업이 이미 등록되어 있습니다.');
            return;
          }
        }
      }
      // ===== 겹침 검사 끝 =====

      // 수업 수정 시 정원 확인
      if (editingClass && data.max_students !== undefined) {
        // 현재 등록된 학생 수 확인
        let currentStudentCount = 0;
        
        // classStudentCounts가 전달된 경우 사용
        if (classStudentCounts && classStudentCounts[editingClass.id] !== undefined) {
          currentStudentCount = classStudentCounts[editingClass.id];
        } else {
          // classStudentCounts가 없으면 직접 조회
          try {
            const studentsResponse = await studentService.getAll(academyId);
            const allStudents = studentsResponse.data?.students || studentsResponse.data || [];
            currentStudentCount = allStudents.filter(s => s.class_id === editingClass.id).length;
          } catch (error) {
            console.warn('학생 수 조회 실패:', error);
          }
        }
        
        // 정원을 현재 등록된 학생 수보다 적게 설정하려고 하면 경고
        if (data.max_students < currentStudentCount) {
          alert(`정원을 현재 등록된 학생 수(${currentStudentCount}명)보다 적게 설정할 수 없습니다.\n\n현재 등록된 학생 수: ${currentStudentCount}명\n설정하려는 정원: ${data.max_students}명`);
          return;
        }
      }

      if (editingClass) {
        // 수업 수정
        await classService.update(editingClass.id, data);
        alert('수업이 수정되었습니다.');
      } else {
        // 수업 등록
        await classService.create(data);
        alert('수업이 등록되었습니다.');
      }

      // 성공 콜백 호출
      if (onSubmitSuccess) {
        await onSubmitSuccess();
      }

      // 모달 닫기
      onClose();
      setFormData({});
    } catch (error) {
      console.error('수업 저장 실패:', error);
      const errorMessage = error.response?.data?.message || error.message || '수업 저장에 실패했습니다.';
      alert(`수업 저장에 실패했습니다: ${errorMessage}`);
    }
  };

  // 필드 정의
  const fields = [
    { name: 'schedule', label: '요일', required: true, type: 'select' },
    { name: 'teacher_id', label: '선생님', required: true, type: 'select' },
    { name: 'subject_id', label: '과목', required: true, type: 'select' },
    { name: 'class_type', label: '수업 유형', required: true, type: 'select' },
    { name: 'classroom_id', label: '강의실', required: true, type: 'select' },
    { name: 'name', label: '강의 명', required: true, maxLength: 20 },
    { name: 'start_time', label: '시작 시간', required: true, type: 'custom' },
    { name: 'end_time', label: '종료 시간', required: true, type: 'custom' },
    { name: 'max_students', label: '정원', required: true, type: 'number' },
  ];

  // 필드 옵션 및 커스터마이징 (formData 변경 시 재계산)
  const processedFields = useMemo(() => fields.map(field => {
    if (field.name === 'subject_id') {
      // 선택된 선생님의 과목만 필터링
      const selectedTeacherId = formData.teacher_id || editingClass?.teacher_id || defaultTeacherId || null;
      let availableSubjects = subjects;
      
      if (selectedTeacherId) {
        const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);
        if (selectedTeacher) {
          // subject_ids 배열이 있으면 그것을 사용, 없으면 subject_id 사용
          const teacherSubjectIds = selectedTeacher.subject_ids && selectedTeacher.subject_ids.length > 0
            ? selectedTeacher.subject_ids
            : selectedTeacher.subject_id
              ? [selectedTeacher.subject_id]
              : [];
          
          if (teacherSubjectIds.length > 0) {
            availableSubjects = subjects.filter(s => teacherSubjectIds.includes(s.id));
          }
        }
      }
      
      return {
        ...field,
        options: availableSubjects.map(s => ({ value: s.id, label: s.name })),
      };
    } else if (field.name === 'teacher_id') {
      // defaultTeacherId가 있으면 해당 선생님만 표시하고 readOnly 처리
      if (defaultTeacherId) {
        const defaultTeacher = teachers.find(t => t.id === defaultTeacherId);
        return {
          ...field,
          options: defaultTeacher ? [{ value: defaultTeacher.id, label: defaultTeacher.name }] : [],
          readOnly: true,
        };
      }
      
      // 선택된 요일에 출근하는 선생님만 필터링
      const selectedSchedule = formData.schedule || editingClass?.schedule || selectedDay;
      let availableTeachers = teachers;
      
      if (selectedSchedule) {
        availableTeachers = teachers.filter(teacher => {
          if (!teacher.work_days) return false;
          // work_days가 쉼표로 구분된 문자열인 경우 (예: "월,화,수")
          const workDaysArray = teacher.work_days.split(',').map(d => d.trim());
          return workDaysArray.includes(selectedSchedule);
        });
      }
      
      return {
        ...field,
        options: availableTeachers.map(t => ({ value: t.id, label: t.name })),
      };
    } else if (field.name === 'schedule') {
      // defaultTeacherId가 있으면 해당 선생님의 출근 요일만 표시
      let availableDays = days;
      
      if (defaultTeacherId) {
        const defaultTeacher = teachers.find(t => t.id === defaultTeacherId);
        if (defaultTeacher && defaultTeacher.work_days) {
          // work_days가 쉼표로 구분된 문자열인 경우 (예: "월,화,수")
          const workDaysArray = defaultTeacher.work_days.split(',').map(d => d.trim());
          if (workDaysArray.length > 0) {
            availableDays = days.filter(d => workDaysArray.includes(d));
          }
        }
      }
      
      return {
        ...field,
        options: availableDays.map(d => ({ value: d, label: d })),
      };
    } else if (field.name === 'class_type') {
      // 수업 유형 선택 옵션 (설정 페이지에서 로드한 데이터 사용)
      return {
        ...field,
        options: classTypes.length > 0
          ? classTypes.map(type => {
              const typeName = typeof type === 'string' ? type : type.name;
              return { value: typeName, label: typeName };
            })
          : [
              { value: '단체반', label: '단체반' },
              { value: '2대1레슨', label: '2대1레슨' },
              { value: '개인 레슨', label: '개인 레슨' },
            ],
      };
    } else if (field.name === 'end_time') {
      return {
        ...field,
        type: 'custom',
        render: ({ formData: fd, onChange, setField }) => {
          // 선택된 요일 가져오기 (schedule 필드에서)
          const selectedSchedule = fd.schedule || selectedDay;
          
          // 해당 요일의 운영 시간 설정 가져오기
          const daySettings = dayTimeSettings[selectedSchedule] || {};
          const endTimeStr = daySettings.endTime || daySettings.end_time || '오후 10:00';
          
          // 운영 시간을 분 단위로 변환
          const operatingEndMinutes = parseTime(endTimeStr);
          
          // 시작 시간 가져오기
          const startTime = fd.start_time || editingClass?.start_time || '00:00';
          const [startHour, startMinute] = startTime.split(':').map(Number);
          const startMinutes = startHour * 60 + startMinute;
          
          // 운영 시간 범위 내의 시간만 선택 가능하도록 필터링
          const getAvailableHours = () => {
            const hours = [];
            // 시작 시간보다 이후 시간만 선택 가능 (같은 시간대는 분으로 처리)
            // 운영 종료 시간까지
            const maxHour = Math.floor(operatingEndMinutes / 60);
            // 시작 시간과 같은 시간대에서 시작 분 이후의 분이 있으면 시작 시간도 포함
            // 그렇지 않으면 시작 시간 + 1시간부터 시작
            const minHour = startMinute < 55 ? startHour : startHour + 1;
            for (let h = minHour; h <= maxHour && h < 24; h++) {
              hours.push(String(h).padStart(2, '0'));
            }
            // 최소한 시작 시간 + 1시간은 포함 (시작 시간이 운영 종료 시간을 넘으면 시작 시간 + 1시간만)
            if (hours.length === 0) {
              const fallbackHour = startHour + 1;
              if (fallbackHour < 24) {
                hours.push(String(fallbackHour).padStart(2, '0'));
              } else {
                // 24시를 넘으면 운영 종료 시간으로 제한
                hours.push(String(maxHour).padStart(2, '0'));
              }
            }
            return hours;
          };
          
          const availableHours = getAvailableHours();
          
          // 같은 시간대일 때 선택 가능한 분 옵션 필터링 함수
          const getAvailableMinutes = (selectedHour) => {
            const allMinutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
            
            // 선택한 시간이 시작 시간과 같으면, 시작 시간의 분보다 이후 분만 선택 가능
            if (Number(selectedHour) === startHour) {
              return allMinutes.filter(min => Number(min) > startMinute);
            }
            // 시작 시간보다 이후 시간이면 모든 분 선택 가능
            return allMinutes;
          };

          // 종료 시간 계산: 시작 시간을 기준으로 항상 계산된 값 사용
          let calculatedEndTime = null;
          if (fd.start_time) {
            calculatedEndTime = calculateEndTime(fd.start_time);
            
            // 계산된 종료 시간이 운영 종료 시간을 넘으면 운영 종료 시간으로 제한
            if (calculatedEndTime) {
              const [calcHour, calcMinute] = calculatedEndTime.split(':').map(Number);
              const calcEndMinutes = calcHour * 60 + calcMinute;
              
              // 운영 종료 시간을 넘으면 운영 종료 시간으로 제한
              if (calcEndMinutes > operatingEndMinutes) {
                const opEndHour = Math.floor(operatingEndMinutes / 60);
                const opEndMin = operatingEndMinutes % 60;
                calculatedEndTime = `${String(opEndHour).padStart(2, '0')}:${String(opEndMin).padStart(2, '0')}`;
              }
            }
          }
          
          // 현재 표시할 종료 시간 결정
          let displayEndTime = null;
          if (calculatedEndTime) {
            // 시작 시간이 있으면 항상 계산된 값 사용
            displayEndTime = calculatedEndTime;
            // formData에 자동으로 반영
            if (!fd.end_time || fd.end_time !== calculatedEndTime) {
              onChange('end_time', calculatedEndTime);
            }
          } else if (fd.end_time) {
            // 시작 시간이 없고 종료 시간이 있으면 기존 값 사용 (수정 모드)
            displayEndTime = fd.end_time;
          } else if (editingClass?.end_time) {
            // 수정 모드에서 기존 종료 시간 사용
            displayEndTime = editingClass.end_time;
          } else {
            // 기본값: 시작 시간 + 1시간 (최소값)
            const minEndHour = startHour + 1;
            displayEndTime = `${String(minEndHour >= 24 ? 23 : minEndHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;
          }

          // 종료 시간 파싱 및 검증
          const [displayHourRaw, displayMinuteRaw] = displayEndTime.split(':').map(Number);
          const displayEndMinutes = displayHourRaw * 60 + displayMinuteRaw;
          
          // 종료 시간이 시작 시간보다 작거나 같으면 무조건 계산된 값 사용
          let finalHour = displayHourRaw;
          let finalMinute = displayMinuteRaw;
          
          if (fd.start_time) {
            if (displayEndMinutes <= startMinutes) {
              // 종료 시간이 시작 시간보다 작거나 같으면 계산된 값 사용
              if (calculatedEndTime) {
                const [calcHour, calcMinute] = calculatedEndTime.split(':').map(Number);
                finalHour = calcHour;
                finalMinute = calcMinute;
                // formData 강제 업데이트
                onChange('end_time', calculatedEndTime);
              } else {
                // 계산 실패 시 시작 시간 + 1시간 (최소값)
                finalHour = startHour + 1;
                finalMinute = startMinute;
                if (finalHour >= 24) {
                  finalHour = 23;
                  finalMinute = 59;
                }
              }
            }
          }
          
          // 종료 시간이 운영 종료 시간을 넘으면 운영 종료 시간으로 제한
          const finalEndMinutes = finalHour * 60 + finalMinute;
          if (finalEndMinutes > operatingEndMinutes) {
            finalHour = Math.floor(operatingEndMinutes / 60);
            finalMinute = operatingEndMinutes % 60;
            const limitedEndTime = `${String(finalHour).padStart(2, '0')}:${String(finalMinute).padStart(2, '0')}`;
            onChange('end_time', limitedEndTime);
          }
          
          // currentHour가 availableHours에 포함되는지 확인
          // 포함되지 않으면 계산된 종료 시간의 시간을 사용
          let displayHour = finalHour;
          if (!availableHours.includes(String(finalHour).padStart(2, '0'))) {
            if (calculatedEndTime) {
              const [calcHour] = calculatedEndTime.split(':').map(Number);
              displayHour = calcHour;
            } else {
              // 계산된 값이 없으면 availableHours의 첫 번째 값 사용
              displayHour = Number(availableHours[0] || String(startHour + 1));
            }
          }
          
          const currentHour = String(displayHour).padStart(2, '0');
          const currentMinute = String(finalMinute).padStart(2, '0');

          // 분 옵션 (5분 단위) - 시작 시간과 같은 시간대면 시작 분보다 이후만 선택 가능
          const minuteOptions = getAvailableMinutes(currentHour);
          
          // currentMinute가 minuteOptions에 포함되지 않으면 첫 번째 옵션 사용
          const displayMinute = minuteOptions.includes(currentMinute) ? currentMinute : (minuteOptions[0] || '00');

          const handleHourChange = (e) => {
            const newHour = e.target.value;
            const newHourNum = Number(newHour);
            
            // 시작 시간보다 작은 시간은 선택 불가 (안전장치)
            if (newHourNum < startHour || (newHourNum === startHour && startMinute >= 55)) {
              // 잘못된 선택이면 계산된 종료 시간으로 복원
              if (calculatedEndTime) {
                onChange('end_time', calculatedEndTime);
                return;
              }
            }
            
            const availableMins = getAvailableMinutes(newHour);
            // 시간이 변경되면 해당 시간대에 유효한 첫 번째 분으로 자동 설정
            const newMinute = availableMins.length > 0 ? availableMins[0] : '00';
            const newTime = `${newHour}:${newMinute}`;
            
            // 최종 검증: 선택한 시간이 시작 시간보다 작으면 계산된 값 사용
            const [newHourNum2, newMinuteNum] = newTime.split(':').map(Number);
            const newTimeMinutes = newHourNum2 * 60 + newMinuteNum;
            if (newTimeMinutes <= startMinutes) {
              // 잘못된 선택이면 계산된 종료 시간으로 복원
              if (calculatedEndTime) {
                onChange('end_time', calculatedEndTime);
                return;
              }
            }
            
            onChange('end_time', newTime);
          };

          const handleMinuteChange = (e) => {
            const newMinute = e.target.value;
            const newTime = `${currentHour}:${newMinute}`;
            
            // 최종 검증: 선택한 시간이 시작 시간보다 작거나 같으면 계산된 값 사용
            const [newHourNum, newMinuteNum] = newTime.split(':').map(Number);
            const newTimeMinutes = newHourNum * 60 + newMinuteNum;
            if (newTimeMinutes <= startMinutes) {
              // 잘못된 선택이면 계산된 종료 시간으로 복원
              if (calculatedEndTime) {
                onChange('end_time', calculatedEndTime);
                return;
              }
            }
            
            onChange('end_time', newTime);
          };

          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select
                id={`${field.name}_hour`}
                className="form-control"
                value={currentHour}
                onChange={handleHourChange}
                style={{ maxWidth: '80px' }}
                aria-label="종료 시"
              >
                {availableHours.map((h) => {
                  // 시작 시간과 같은 시간대는 시작 분 이후의 분이 있을 때만 표시
                  if (Number(h) === startHour) {
                    const availableMins = getAvailableMinutes(h);
                    if (availableMins.length === 0) {
                      return null; // 선택 가능한 분이 없으면 표시하지 않음
                    }
                  }
                  return (
                    <option key={h} value={h}>
                      {`${h}시`}
                    </option>
                  );
                }).filter(Boolean)}
              </select>
              <span>:</span>
              <select
                id={`${field.name}_minute`}
                className="form-control"
                value={displayMinute}
                onChange={handleMinuteChange}
                style={{ maxWidth: '80px' }}
                aria-label="종료 분"
              >
                {minuteOptions.map((m) => (
                  <option key={m} value={m}>
                    {`${m}분`}
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '0.85rem', color: '#666', marginLeft: '8px' }}>
                (설정값: {timeInterval} 기준 자동 계산, 수정 가능)
              </span>
            </div>
          );
        },
      };
    } else if (field.name === 'max_students') {
      const currentClassType = formData.class_type || editingClass?.class_type || '';
      let isReadOnly = false;
      
      if (currentClassType && classTypes.length > 0) {
        // 설정 페이지에서 설정한 수업 유형 정보 찾기
        const classTypeInfo = classTypes.find(ct => {
          const ctName = typeof ct === 'string' ? ct : ct.name;
          return ctName === currentClassType;
        });
        
        if (classTypeInfo && typeof classTypeInfo === 'object' && classTypeInfo.maxStudents !== null) {
          // 설정 페이지에서 고정 정원이 설정된 경우 읽기 전용
          isReadOnly = true;
        } else {
          // 설정 페이지에 없는 경우 기존 하드코딩된 로직 사용 (하위 호환성)
          const classTypeLower = currentClassType.toLowerCase();
          isReadOnly = classTypeLower.includes('2대1') || classTypeLower.includes('2:1') || 
                       classTypeLower.includes('3대1') || classTypeLower.includes('3:1') || 
                       classTypeLower.includes('개인');
        }
      }
      
      return {
        ...field,
        readOnly: isReadOnly,
      };
    } else if (field.name === 'classroom_id') {
      return {
        ...field,
        options: classrooms.map(c => ({
          value: c.id,
          label: c.name,
        })),
      };
    } else if (field.name === 'start_time') {
      return {
        ...field,
        type: 'custom',
        render: ({ formData: fd, onChange, setField }) => {
          const timeList = availableTimeSlots.length > 0 ? availableTimeSlots : timeSlots;

          if (!timeList || timeList.length === 0) {
            return <div style={{ padding: '10px', color: '#999' }}>사용 가능한 시간대가 없습니다. 시간표 설정을 확인해주세요.</div>;
          }

          // 선택된 요일 가져오기 (schedule 필드에서)
          const selectedSchedule = fd.schedule || selectedDay;
          
          // 해당 요일의 운영 시간 설정 가져오기
          const daySettings = dayTimeSettings[selectedSchedule] || {};
          const startTimeStr = daySettings.startTime || daySettings.start_time || '오전 08:00';
          const endTimeStr = daySettings.endTime || daySettings.end_time || '오후 08:00';
          
          // 운영 시간을 분 단위로 변환
          const operatingStartMinutes = parseTime(startTimeStr);
          const operatingEndMinutes = parseTime(endTimeStr);
          
          // 운영 시간 범위 내의 시간만 선택 가능하도록 필터링
          const getAvailableHours = () => {
            const hours = [];
            for (let h = 0; h < 24; h++) {
              const hourMinutes = h * 60;
              // 해당 시간대의 시작(00분)이 운영 시간 내에 있는지 확인
              if (hourMinutes >= operatingStartMinutes && hourMinutes < operatingEndMinutes) {
                hours.push(String(h).padStart(2, '0'));
              }
            }
            return hours.length > 0 ? hours : Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')); // 기본값: 모든 시간
          };
          
          const availableHours = getAvailableHours();

          const currentValue =
            fd.start_time ||
            editingClass?.start_time ||
            selectedTimeSlot ||
            timeList[0];

          const [currentHourRaw, currentMinuteRaw] = (currentValue || '00:00').split(':');
          const currentHour = currentHourRaw || '00';
          const currentMinute = currentMinuteRaw || '00';

          // 분 옵션 (5분 단위)
          const minuteOptions = Array.from({ length: 12 }, (_, i) =>
            String(i * 5).padStart(2, '0')
          );

          const handleHourChange = (e) => {
            const newHour = e.target.value;
            const newTime = `${newHour}:${currentMinute}`;
            // 종료 시간 자동 계산 (현재 timeInterval 사용)
            const calculatedEndTime = calculateEndTime(newTime);
            
            // 시작 시간과 종료 시간을 함께 업데이트
            const updatedFormData = { ...fd, start_time: newTime };
            if (calculatedEndTime) {
              updatedFormData.end_time = calculatedEndTime;
            }
            
            // onChange를 통해 상태 업데이트
            onChange('start_time', newTime);
            if (calculatedEndTime) {
              setTimeout(() => {
                onChange('end_time', calculatedEndTime);
              }, 0);
            }
          };

          const handleMinuteChange = (e) => {
            const newMinute = e.target.value;
            const newTime = `${currentHour}:${newMinute}`;
            // 종료 시간 자동 계산 (현재 timeInterval 사용)
            const calculatedEndTime = calculateEndTime(newTime);
            
            // 시작 시간과 종료 시간을 함께 업데이트
            const updatedFormData = { ...fd, start_time: newTime };
            if (calculatedEndTime) {
              updatedFormData.end_time = calculatedEndTime;
            }
            
            // onChange를 통해 상태 업데이트
            onChange('start_time', newTime);
            if (calculatedEndTime) {
              setTimeout(() => {
                onChange('end_time', calculatedEndTime);
              }, 0);
            }
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
                {availableHours.map((h) => (
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
  }), [formData, editingClass, selectedDay, defaultTeacherId, teachers, subjects, classTypes, classrooms, availableTimeSlots, timeSlots, selectedTimeSlot, dayTimeSettings, timeInterval, calculateEndTime]);

  // 초기 데이터 설정
  const getInitialData = () => {
    if (formData && Object.keys(formData).length > 0) {
      return formData;
    }
    if (editingClass) {
      return editingClass;
    }
    // 새 수업 등록 시 기본값
    const defaultStartTime = selectedTimeSlot || availableTimeSlots[0] || timeSlots[0];
    const defaultEndTime = defaultStartTime ? calculateEndTime(defaultStartTime) : null;
    return {
      schedule: selectedDay,
      classroom_id: selectedClassroom,
      start_time: defaultStartTime,
      end_time: defaultEndTime,
      teacher_id: defaultTeacherId || '',
    };
  };

  // 버튼 형식으로 렌더링할 필드들
  const renderButtonField = (label, options, selectedValue, onChange, disabledOptions = []) => {
    return (
      <div className="form-group" style={{ marginBottom: '20px' }}>
        <label className="form-label" style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#2c3e50' }}>
          {label} <span className="required" style={{ color: '#e74c3c' }}>*</span>
        </label>
        <div className="button-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {options.map((option) => {
            const isSelected = selectedValue === option.value;
            const isDisabled = disabledOptions.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => !isDisabled && onChange(option.value)}
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
                  opacity: isDisabled ? 0.5 : 1,
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
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // 필터링된 옵션들
  const getAvailableDays = () => {
    let availableDays = days;
    if (defaultTeacherId) {
      const defaultTeacher = teachers.find(t => t.id === defaultTeacherId);
      if (defaultTeacher && defaultTeacher.work_days) {
        const workDaysArray = defaultTeacher.work_days.split(',').map(d => d.trim());
        if (workDaysArray.length > 0) {
          availableDays = days.filter(d => workDaysArray.includes(d));
        }
      }
    }
    return availableDays.map(d => ({ value: d, label: d }));
  };

  const getAvailableTeachers = () => {
    if (defaultTeacherId) {
      const defaultTeacher = teachers.find(t => t.id === defaultTeacherId);
      return defaultTeacher ? [{ value: defaultTeacher.id, label: defaultTeacher.name }] : [];
    }
    const selectedSchedule = formData.schedule || editingClass?.schedule || selectedDay;
    let availableTeachers = teachers;
    if (selectedSchedule) {
      availableTeachers = teachers.filter(teacher => {
        if (!teacher.work_days) return false;
        const workDaysArray = teacher.work_days.split(',').map(d => d.trim());
        return workDaysArray.includes(selectedSchedule);
      });
    }
    return availableTeachers.map(t => ({ value: t.id, label: t.name }));
  };

  const getAvailableSubjects = () => {
    const selectedTeacherId = formData.teacher_id || editingClass?.teacher_id || defaultTeacherId || null;
    let availableSubjects = subjects;
    if (selectedTeacherId) {
      const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);
      if (selectedTeacher) {
        const teacherSubjectIds = selectedTeacher.subject_ids && selectedTeacher.subject_ids.length > 0
          ? selectedTeacher.subject_ids
          : selectedTeacher.subject_id
            ? [selectedTeacher.subject_id]
            : [];
        if (teacherSubjectIds.length > 0) {
          availableSubjects = subjects.filter(s => teacherSubjectIds.includes(s.id));
        }
      }
    }
    return availableSubjects.map(s => ({ value: s.id, label: s.name }));
  };

  const getAvailableClassTypes = () => {
    return classTypes.length > 0
      ? classTypes.map(type => {
          const typeName = typeof type === 'string' ? type : type.name;
          return { value: typeName, label: typeName };
        })
      : [
          { value: '단체반', label: '단체반' },
          { value: '2대1레슨', label: '2대1레슨' },
          { value: '개인 레슨', label: '개인 레슨' },
        ];
  };

  const getAvailableClassrooms = () => {
    return classrooms.map(c => ({ value: c.id, label: c.name }));
  };

  // 현재 formData 계산 (항상 최신 상태 유지)
  const currentFormData = useMemo(() => {
    const initial = getInitialData();
    return { ...initial, ...formData };
  }, [formData, editingClass, selectedTimeSlot, selectedDay, selectedClassroom, defaultTeacherId, availableTimeSlots, timeSlots]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setFormData({});
      }}
      title={editingClass ? '수업 수정' : '수업 등록하기'}
    >
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(currentFormData);
      }} style={{ padding: '0' }}>
        {/* 요일 선택 버튼 */}
        {renderButtonField(
          '요일',
          getAvailableDays(),
          currentFormData.schedule,
          (value) => {
            const newData = { ...currentFormData, schedule: value };
            if (!defaultTeacherId) {
              const currentTeacherId = newData.teacher_id;
              if (currentTeacherId) {
                const currentTeacher = teachers.find(t => t.id === currentTeacherId);
                if (currentTeacher && currentTeacher.work_days) {
                  const workDaysArray = currentTeacher.work_days.split(',').map(d => d.trim());
                  if (!workDaysArray.includes(value)) {
                    newData.teacher_id = '';
                    newData.subject_id = '';
                  }
                }
              }
            }
            handleFormChange('schedule', value, newData);
          }
        )}

        {/* 선생님 선택 버튼 */}
        {renderButtonField(
          '선생님',
          getAvailableTeachers(),
          currentFormData.teacher_id,
          (value) => {
            const newData = { ...currentFormData, teacher_id: value };
            if (newData.subject_id) {
              const selectedTeacher = teachers.find(t => t.id === value);
              if (selectedTeacher) {
                const teacherSubjectIds = selectedTeacher.subject_ids && selectedTeacher.subject_ids.length > 0
                  ? selectedTeacher.subject_ids
                  : selectedTeacher.subject_id
                    ? [selectedTeacher.subject_id]
                    : [];
                if (teacherSubjectIds.length > 0 && !teacherSubjectIds.includes(newData.subject_id)) {
                  newData.subject_id = '';
                }
              } else {
                newData.subject_id = '';
              }
            }
            handleFormChange('teacher_id', value, newData);
          },
          defaultTeacherId ? [] : []
        )}

        {/* 과목 선택 버튼 */}
        {renderButtonField(
          '과목',
          getAvailableSubjects(),
          currentFormData.subject_id,
          (value) => {
            handleFormChange('subject_id', value, { ...currentFormData, subject_id: value });
          }
        )}

        {/* 수업 유형 선택 버튼 */}
        {renderButtonField(
          '수업 유형',
          getAvailableClassTypes(),
          currentFormData.class_type,
          (value) => {
            handleFormChange('class_type', value, { ...currentFormData, class_type: value });
          }
        )}

        {/* 강의실 선택 버튼 */}
        {renderButtonField(
          '강의실',
          getAvailableClassrooms(),
          currentFormData.classroom_id,
          (value) => {
            handleFormChange('classroom_id', value, { ...currentFormData, classroom_id: value });
          }
        )}

        {/* 나머지 필드들은 Form 컴포넌트 사용 (form 태그 없이) */}
        <div>
          {processedFields
            .filter(field => !['schedule', 'teacher_id', 'subject_id', 'class_type', 'classroom_id'].includes(field.name))
            .map(field => {
              const fieldValue = currentFormData[field.name] || '';
              if (field.type === 'custom' && field.render) {
                // 항상 최신 formData 사용
                const latestFormData = { ...getInitialData(), ...formData };
                return (
                  <div key={`${field.name}-${latestFormData.start_time || ''}-${latestFormData.end_time || ''}`} className="form-group" style={{ marginBottom: '20px' }}>
                    <label className="form-label" style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#2c3e50' }}>
                      {field.label} {field.required && <span className="required" style={{ color: '#e74c3c' }}>*</span>}
                    </label>
                    {field.render({
                      formData: latestFormData,
                      onChange: (name, value) => {
                        setFormData(prevFormData => {
                          const baseData = { ...getInitialData(), ...prevFormData };
                          const newData = { ...baseData, [name]: value };
                          if (name === 'start_time' && value) {
                            const calculatedEndTime = calculateEndTime(value);
                            if (calculatedEndTime) {
                              newData.end_time = calculatedEndTime;
                            }
                          }
                          handleFormChange(name, value, newData);
                          return newData;
                        });
                      },
                      setField: (name, value) => {
                        setFormData(prevFormData => {
                          const baseData = { ...getInitialData(), ...prevFormData };
                          const newData = { ...baseData, [name]: value };
                          handleFormChange(name, value, newData);
                          return newData;
                        });
                      }
                    })}
                  </div>
                );
              } else if (field.type === 'number') {
                return (
                  <div key={field.name} className="form-group" style={{ marginBottom: '20px' }}>
                    <label className="form-label" style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#2c3e50' }}>
                      {field.label} {field.required && <span className="required" style={{ color: '#e74c3c' }}>*</span>}
                    </label>
                    <input
                      type="number"
                      name={field.name}
                      className="form-control"
                      value={fieldValue}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleFormChange(field.name, value, { ...currentFormData, [field.name]: value });
                      }}
                      required={field.required}
                      readOnly={field.readOnly}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        fontSize: '0.95rem',
                      }}
                    />
                  </div>
                );
              } else {
                return (
                  <div key={field.name} className="form-group" style={{ marginBottom: '20px' }}>
                    <label className="form-label" style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#2c3e50' }}>
                      {field.label} {field.required && <span className="required" style={{ color: '#e74c3c' }}>*</span>}
                    </label>
                    <input
                      type="text"
                      name={field.name}
                      className="form-control"
                      value={fieldValue}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleFormChange(field.name, value, { ...currentFormData, [field.name]: value });
                      }}
                      required={field.required}
                      maxLength={field.maxLength}
                      placeholder={field.placeholder}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        fontSize: '0.95rem',
                      }}
                    />
                  </div>
                );
              }
            })}
        </div>
        <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e0e0e0' }}>
          <button
            type="button"
            onClick={() => {
              onClose();
              setFormData({});
            }}
            className="btn btn-secondary"
            style={{
              padding: '10px 24px',
              background: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.background = '#7f8c8d'}
            onMouseLeave={(e) => e.target.style.background = '#95a5a6'}
          >
            취소
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(102, 126, 234, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 4px rgba(102, 126, 234, 0.3)';
            }}
          >
            {editingClass ? '수정' : '등록하기'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ClassFormModal;

