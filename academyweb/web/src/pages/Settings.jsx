import { useState, useEffect } from 'react';
import { academyService } from '../services/academyService';
import { subjectService } from '../services/subjectService';
import { classroomService } from '../services/classroomService';
import { timetableSettingsService } from '../services/timetableSettingsService';
import { tuitionFeeService } from '../services/tuitionFeeService';
import { useAcademy } from '../contexts/AcademyContext';
import { authService } from '../services/authService';
import './Settings.css';

const Settings = () => {
  const { updateAcademy } = useAcademy();
  
  // 편집 모드 상태 (각 섹션별로 관리)
  const [isEditMode, setIsEditMode] = useState(false); // 학원 정보
  const [isSubjectEditMode, setIsSubjectEditMode] = useState(false); // 과목 관리
  const [isTimetableEditMode, setIsTimetableEditMode] = useState(false); // 시간표 설정
  const [isTuitionFeeEditMode, setIsTuitionFeeEditMode] = useState(false); // 수강료 관리
  const [isPasswordEditMode, setIsPasswordEditMode] = useState(false); // 비밀번호 변경
  
  // 학원 정보 상태
  const [academyName, setAcademyName] = useState('');
  const [academyAddress, setAcademyAddress] = useState('');
  const [academyFloor, setAcademyFloor] = useState('');
  const [academyLogo, setAcademyLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [academyCode, setAcademyCode] = useState('');

  // 색상 옵션 정의
  const colorOptions = [
    { name: 'red', label: '빨강', value: '#FF0000' },
    { name: 'orange', label: '주황', value: '#FF8C00' },
    { name: 'yellow', label: '노랑', value: '#FFD700' },
    { name: 'green', label: '초록', value: '#008000' },
    { name: 'blue', label: '파랑', value: '#0000FF' },
    { name: 'navy', label: '네이비', value: '#000080' },
    { name: 'violet', label: '보라', value: '#8A2BE2' },
    { name: 'gray', label: '회색', value: '#808080' },
    { name: 'silver', label: '은색', value: '#C0C0C0' },
    { name: 'gold', label: '금색', value: '#FFD700' },
    { name: 'skyblue', label: '하늘색', value: '#87CEEB' },
    { name: 'lightgreen', label: '연두색', value: '#90EE90' },
    { name: 'pink', label: '분홍', value: '#FFC0CB' },
  ];
  
  // 과목 관리 상태
  const [subjectName, setSubjectName] = useState('');
  const [subjectColor, setSubjectColor] = useState(colorOptions[0].value); // 첫 번째 색상(빨강)을 기본값으로
  const [subjectDescription, setSubjectDescription] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [editSubjectName, setEditSubjectName] = useState('');
  const [editSubjectColor, setEditSubjectColor] = useState('');
  const [editSubjectDescription, setEditSubjectDescription] = useState('');
  // 학원 정보 저장 기능 임시 비활성화 - 테스트용 하드코딩 academy_id 사용
  // 테스트용: 아래 주석을 해제하고 실제 학원 ID를 입력하면 학원이 없어도 테스트 가능
  // const [selectedAcademy, setSelectedAcademy] = useState('your-academy-id-here');
  const [selectedAcademy, setSelectedAcademy] = useState('');

  // 시간표 설정 상태
  const [operatingDays, setOperatingDays] = useState(['월', '화', '수', '목', '금']);
  const [timeInterval, setTimeInterval] = useState('1시간');
  const [dayTimeSettings, setDayTimeSettings] = useState({
    '월': { startTime: '오전 09:00', endTime: '오후 10:00' },
    '화': { startTime: '오전 09:00', endTime: '오후 10:00' },
    '수': { startTime: '오전 09:00', endTime: '오후 10:00' },
    '목': { startTime: '오전 09:00', endTime: '오후 10:00' },
    '금': { startTime: '오전 09:00', endTime: '오후 10:00' },
    '토': { startTime: '오전 09:00', endTime: '오후 10:00' },
    '일': { startTime: '오전 09:00', endTime: '오후 10:00' },
  });
  const [timetableName, setTimetableName] = useState('');
  const [classrooms, setClassrooms] = useState(['']); // 이름만 저장 (UI용) - 처음에는 하나만
  const [availableClassrooms, setAvailableClassrooms] = useState([]); // DB에서 로드한 전체 강의실 목록
  const [selectedClassroomIds, setSelectedClassroomIds] = useState([null]); // 선택된 강의실 ID 배열 - 처음에는 하나만

  // 수강료 관리 상태
  const [tuitionFees, setTuitionFees] = useState([]);
  const [newFeeAmount, setNewFeeAmount] = useState('');
  const [newFeeClassType, setNewFeeClassType] = useState('');
  const [newFeePaymentMethod, setNewFeePaymentMethod] = useState('');
  const [editingFeeId, setEditingFeeId] = useState(null);
  const [editFeeAmount, setEditFeeAmount] = useState('');
  const [editFeeClassType, setEditFeeClassType] = useState('');
  const [editFeePaymentMethod, setEditFeePaymentMethod] = useState('');
  
  // 수업 유형 관리 상태
  const [classTypes, setClassTypes] = useState([]);
  const [newClassType, setNewClassType] = useState('');
  const [newClassTypeMaxStudents, setNewClassTypeMaxStudents] = useState('');
  const [editingClassType, setEditingClassType] = useState(null);
  const [editClassType, setEditClassType] = useState('');
  const [editClassTypeMaxStudents, setEditClassTypeMaxStudents] = useState('');
  
  // 결제 방법 관리 상태
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  
  // 수업 유형과 결제 방법 로드
  useEffect(() => {
    loadClassTypes();
    loadPaymentMethods();
  }, []);
  
  const loadClassTypes = () => {
    try {
      const saved = localStorage.getItem('classTypes');
      if (saved) {
        const parsed = JSON.parse(saved);
        // 기존 문자열 배열 형식인 경우 객체 배열로 마이그레이션
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
          const migrated = parsed.map(type => {
            // 기존 하드코딩된 로직에 따라 기본값 설정
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
          localStorage.setItem('classTypes', JSON.stringify(migrated));
        } else {
          setClassTypes(parsed);
        }
      } else {
        // 기본값 설정 (객체 배열 형식)
        const defaultTypes = [
          { name: '개인레슨', maxStudents: 1 },
          { name: '그룹레슨', maxStudents: null },
          { name: '정기반', maxStudents: null },
          { name: '특별반', maxStudents: null },
          { name: '일반', maxStudents: null }
        ];
        setClassTypes(defaultTypes);
        localStorage.setItem('classTypes', JSON.stringify(defaultTypes));
      }
    } catch (error) {
      console.error('수업 유형 로드 실패:', error);
      setClassTypes([
        { name: '개인레슨', maxStudents: 1 },
        { name: '그룹레슨', maxStudents: null },
        { name: '정기반', maxStudents: null },
        { name: '특별반', maxStudents: null },
        { name: '일반', maxStudents: null }
      ]);
    }
  };
  
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
  
  const handleAddClassType = () => {
    if (!newClassType.trim()) {
      alert('수업 유형을 입력해주세요.');
      return;
    }
    
    // 중복 체크 (객체 배열 형식)
    const isDuplicate = classTypes.some(type => 
      (typeof type === 'string' ? type : type.name) === newClassType.trim()
    );
    
    if (isDuplicate) {
      alert('이미 존재하는 수업 유형입니다.');
      return;
    }
    
    // 고정 정원 값 처리 (빈 문자열이면 null)
    const maxStudents = newClassTypeMaxStudents.trim() === '' 
      ? null 
      : parseInt(newClassTypeMaxStudents.trim(), 10);
    
    if (newClassTypeMaxStudents.trim() !== '' && (isNaN(maxStudents) || maxStudents < 1)) {
      alert('고정 정원은 1 이상의 숫자로 입력해주세요.');
      return;
    }
    
    const newType = {
      name: newClassType.trim(),
      maxStudents: maxStudents
    };
    
    const updated = [...classTypes, newType];
    setClassTypes(updated);
    localStorage.setItem('classTypes', JSON.stringify(updated));
    setNewClassType('');
    setNewClassTypeMaxStudents('');
  };
  
  const handleDeleteClassType = (type) => {
    const typeName = typeof type === 'string' ? type : type.name;
    if (!window.confirm(`"${typeName}" 수업 유형을 삭제하시겠습니까?`)) return;
    
    const updated = classTypes.filter(t => {
      const tName = typeof t === 'string' ? t : t.name;
      return tName !== typeName;
    });
    setClassTypes(updated);
    localStorage.setItem('classTypes', JSON.stringify(updated));
  };

  const handleEditClassType = (type) => {
    setEditingClassType(type);
    const typeName = typeof type === 'string' ? type : type.name;
    const typeMaxStudents = typeof type === 'string' ? null : type.maxStudents;
    setEditClassType(typeName);
    setEditClassTypeMaxStudents(typeMaxStudents ? typeMaxStudents.toString() : '');
  };

  const handleSaveClassType = () => {
    if (!editClassType.trim()) {
      alert('수업 유형을 입력해주세요.');
      return;
    }
    
    const oldTypeName = typeof editingClassType === 'string' ? editingClassType : editingClassType.name;
    
    // 중복 체크 (자기 자신 제외)
    const isDuplicate = classTypes.some(t => {
      const tName = typeof t === 'string' ? t : t.name;
      return tName === editClassType.trim() && tName !== oldTypeName;
    });
    
    if (isDuplicate) {
      alert('이미 존재하는 수업 유형입니다.');
      return;
    }
    
    // 고정 정원 값 처리 (빈 문자열이면 null)
    const maxStudents = editClassTypeMaxStudents.trim() === '' 
      ? null 
      : parseInt(editClassTypeMaxStudents.trim(), 10);
    
    if (editClassTypeMaxStudents.trim() !== '' && (isNaN(maxStudents) || maxStudents < 1)) {
      alert('고정 정원은 1 이상의 숫자로 입력해주세요.');
      return;
    }
    
    const updated = classTypes.map(t => {
      const tName = typeof t === 'string' ? t : t.name;
      if (tName === oldTypeName) {
        return {
          name: editClassType.trim(),
          maxStudents: maxStudents
        };
      }
      return t;
    });
    
    setClassTypes(updated);
    localStorage.setItem('classTypes', JSON.stringify(updated));
    setEditingClassType(null);
    setEditClassType('');
    setEditClassTypeMaxStudents('');
  };

  const handleCancelEditClassType = () => {
    setEditingClassType(null);
    setEditClassType('');
    setEditClassTypeMaxStudents('');
  };
  
  const handleAddPaymentMethod = () => {
    if (!newPaymentMethod.trim()) {
      alert('결제 방법을 입력해주세요.');
      return;
    }
    
    if (paymentMethods.includes(newPaymentMethod.trim())) {
      alert('이미 존재하는 결제 방법입니다.');
      return;
    }
    
    const updated = [...paymentMethods, newPaymentMethod.trim()];
    setPaymentMethods(updated);
    localStorage.setItem('paymentMethods', JSON.stringify(updated));
    setNewPaymentMethod('');
  };
  
  const handleDeletePaymentMethod = (method) => {
    if (!window.confirm(`"${method}" 결제 방법을 삭제하시겠습니까?`)) return;
    
    const updated = paymentMethods.filter(m => m !== method);
    setPaymentMethods(updated);
    localStorage.setItem('paymentMethods', JSON.stringify(updated));
  };

  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const timeIntervals = ['30분', '40분', '50분', '1시간', '1시간 30분', '2시간'];

  useEffect(() => {
    loadAcademy();
  }, []);

  // selectedAcademy가 변경될 때마다 과목, 강의실, 시간표 설정, 수강료 로드
  useEffect(() => {
    if (selectedAcademy) {
      loadSubjects();
      loadClassrooms();
      loadTimetableSettings();
      loadTuitionFees();
    }
  }, [selectedAcademy]);

  const generateAcademyCode = () => {
    // 영문자와 숫자 조합으로 8자리 코드 생성
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const loadAcademy = async () => {
    try {
      const response = await academyService.getAll();
      const academies = response.data.academies || [];
      if (academies.length > 0) {
        const academy = academies[0];
        console.log('학원 정보 로드 성공:', academy);
        setAcademyName(academy.name || '');
        setAcademyAddress(academy.address || '');
        setAcademyFloor(academy.floor || '');
        setLogoPreview(academy.logo_url || '');
        setAcademyCode(academy.code || '');
        setSelectedAcademy(academy.id);
      } else {
        console.log('학원 정보가 없습니다. 새 코드 생성');
        // 학원이 없으면 새 코드 생성 (다른 필드는 유지)
        if (!academyCode) {
          setAcademyCode(generateAcademyCode());
        }
      }
    } catch (error) {
      console.error('학원 정보 로드 실패:', error);
      console.error('에러 상세:', error.response?.data || error.message);
      // 에러 발생 시에도 기존 데이터는 유지하고, 코드만 생성 (코드가 없는 경우)
      if (!academyCode) {
        setAcademyCode(generateAcademyCode());
      }
    }
  };

  const handleGenerateCode = () => {
    const newCode = generateAcademyCode();
    setAcademyCode(newCode);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(academyCode);
      alert('학원 코드가 클립보드에 복사되었습니다.');
    } catch (error) {
      console.error('복사 실패:', error);
      // 폴백: 텍스트 영역 사용
      const textArea = document.createElement('textarea');
      textArea.value = academyCode;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert('학원 코드가 클립보드에 복사되었습니다.');
      } catch (err) {
        alert('복사에 실패했습니다. 코드를 직접 복사해주세요.');
      }
      document.body.removeChild(textArea);
    }
  };

  const loadTimetableSettings = async () => {
    if (!selectedAcademy) {
      console.log('학원 ID가 없어서 시간표 설정을 불러올 수 없습니다.');
      return;
    }
    
    try {
      const response = await timetableSettingsService.get(selectedAcademy);
      if (response.settings) {
        const settings = response.settings;
        console.log('📖 시간표 설정 로드:', settings);
        
        if (settings.time_interval) {
          setTimeInterval(settings.time_interval);
        }
        if (settings.day_time_settings) {
          setDayTimeSettings(settings.day_time_settings);
        }
        if (settings.operating_days && Array.isArray(settings.operating_days)) {
          setOperatingDays(settings.operating_days);
        }
        if (settings.timetable_name) {
          setTimetableName(settings.timetable_name);
        }
        if (settings.classroom_ids && Array.isArray(settings.classroom_ids) && settings.classroom_ids.length > 0) {
          setSelectedClassroomIds(settings.classroom_ids);
          console.log('✅ 시간표 설정에서 강의실 ID 로드:', settings.classroom_ids);
          
          // 강의실 ID에 맞는 이름도 로드
          try {
            const classroomsResponse = await classroomService.getAll(selectedAcademy);
            const allClassrooms = classroomsResponse.data.classrooms || [];
            const classroomNames = settings.classroom_ids.map(id => {
              const found = allClassrooms.find(c => c.id === id);
              return found ? found.name : '';
            }).filter(name => name);
            
            if (classroomNames.length > 0) {
              // 실제 저장된 강의실 개수만큼만 표시 (빈 문자열로 채우지 않음)
              setClassrooms(classroomNames);
              console.log('✅ 강의실 이름 로드:', classroomNames);
            } else {
              // 강의실이 없으면 최소 하나의 빈 입력창 표시
              setClassrooms(['']);
              setSelectedClassroomIds([null]);
            }
          } catch (classroomError) {
            console.warn('강의실 이름 로드 실패:', classroomError);
          }
        }
        // 저장된 설정을 불러온 경우에는 기본적으로 읽기 전용 모드로 시작
        setIsTimetableEditMode(false);
      } else {
        // DB에 설정이 없으면 로컬 스토리지에서 로드 (마이그레이션 지원)
        const saved = localStorage.getItem('timetableSettings');
        if (saved) {
          const localSettings = JSON.parse(saved);
          if (localSettings.timeInterval) {
            setTimeInterval(localSettings.timeInterval);
          }
          if (localSettings.dayTimeSettings) {
            setDayTimeSettings(localSettings.dayTimeSettings);
          }
          if (localSettings.operatingDays) {
            setOperatingDays(localSettings.operatingDays);
          }
          if (localSettings.timetableName) {
            setTimetableName(localSettings.timetableName);
          }
          if (localSettings.classroomIds && Array.isArray(localSettings.classroomIds) && localSettings.classroomIds.length > 0) {
            setSelectedClassroomIds(localSettings.classroomIds);
            console.log('✅ localStorage에서 강의실 ID 로드:', localSettings.classroomIds);
            
            // 강의실 이름도 로드
            if (localSettings.classrooms && Array.isArray(localSettings.classrooms)) {
              // 실제 저장된 강의실 개수만큼만 표시 (빈 문자열로 채우지 않음)
              const validClassrooms = localSettings.classrooms.filter(c => c && c.trim());
              if (validClassrooms.length > 0) {
                setClassrooms(validClassrooms);
              } else {
                // 강의실이 없으면 최소 하나의 빈 입력창 표시
                setClassrooms(['']);
                setSelectedClassroomIds([null]);
              }
              console.log('✅ localStorage에서 강의실 이름 로드:', localSettings.classrooms);
            }
          }
        }
        // 로컬 스토리지에서 설정을 불러온 경우에도 읽기 전용 모드로 시작
        setIsTimetableEditMode(false);
      }
    } catch (error) {
      console.error('시간표 설정 로드 실패:', error);
      // 에러 발생 시 로컬 스토리지에서 로드 (폴백)
      try {
        const saved = localStorage.getItem('timetableSettings');
        if (saved) {
          const settings = JSON.parse(saved);
          if (settings.timeInterval) setTimeInterval(settings.timeInterval);
          if (settings.dayTimeSettings) setDayTimeSettings(settings.dayTimeSettings);
          if (settings.operatingDays) setOperatingDays(settings.operatingDays);
          if (settings.timetableName) setTimetableName(settings.timetableName);
          if (settings.classroomIds && Array.isArray(settings.classroomIds)) {
            setSelectedClassroomIds(settings.classroomIds);
          }
          if (settings.classrooms && Array.isArray(settings.classrooms)) {
            // 실제 저장된 강의실 개수만큼만 표시 (빈 문자열로 채우지 않음)
            const validClassrooms = settings.classrooms.filter(c => c && c.trim());
            if (validClassrooms.length > 0) {
              setClassrooms(validClassrooms);
            } else {
              // 강의실이 없으면 최소 하나의 빈 입력창 표시
              setClassrooms(['']);
              setSelectedClassroomIds([null]);
            }
          }
          // 폴백으로 로컬 설정을 불러온 경우에도 읽기 전용 모드로 시작
          setIsTimetableEditMode(false);
        }
      } catch (localError) {
        console.error('로컬 스토리지 로드 실패:', localError);
      }
    }
  };

  const loadTuitionFees = async (academyId = null) => {
    const targetAcademyId = academyId || selectedAcademy;
    
    if (!targetAcademyId) {
      console.log('학원 ID가 없어서 수강료를 불러올 수 없습니다.');
      // 기본 수강료 목록 설정
      const defaultFees = [
        { id: '1', amount: '100,000원', value: '100000' },
        { id: '2', amount: '150,000원', value: '150000' },
        { id: '3', amount: '200,000원', value: '200000' },
        { id: '4', amount: '250,000원', value: '250000' },
        { id: '5', amount: '300,000원', value: '300000' },
      ];
      setTuitionFees(defaultFees);
      return;
    }
    
    try {
      console.log('수강료 목록 로드 시도 - academy_id:', targetAcademyId);
      const response = await tuitionFeeService.getAll(targetAcademyId);
      console.log('수강료 목록 응답:', response);
      
      // 응답 구조 확인 (fees 또는 data.fees)
      const fees = response.fees || response.data?.fees || [];
      
      if (fees && fees.length > 0) {
        const formattedFees = fees.map(fee => ({
          id: fee.id,
          amount: fee.amount,
          value: fee.value ? fee.value.toString() : String(fee.value || '0'),
          class_type: fee.class_type || null,
          payment_method: fee.payment_method || null
        }));
        console.log('포맷된 수강료 목록:', formattedFees);
        setTuitionFees(formattedFees);
      } else {
        console.log('DB에 수강료가 없습니다. 기존 상태를 유지합니다.');
        // 빈 배열이면 기존 상태 유지 (덮어쓰지 않음)
        // setTuitionFees를 호출하지 않아서 기존 상태 유지
      }
    } catch (error) {
      console.error('수강료 목록 로드 실패:', error);
      console.error('에러 상세:', error.response?.data);
      // 에러 발생 시 로컬 스토리지에서 로드 (폴백)
      try {
        const saved = localStorage.getItem('tuitionFees');
        if (saved) {
          setTuitionFees(JSON.parse(saved));
        } else {
          const defaultFees = [
            { id: '1', amount: '100,000원', value: '100000' },
            { id: '2', amount: '150,000원', value: '150000' },
            { id: '3', amount: '200,000원', value: '200000' },
            { id: '4', amount: '250,000원', value: '250000' },
            { id: '5', amount: '300,000원', value: '300000' },
          ];
          setTuitionFees(defaultFees);
        }
      } catch (localError) {
        console.error('로컬 스토리지 로드 실패:', localError);
      }
    }
  };

  const handleAddFee = async () => {
    if (!newFeeClassType) {
      alert('수업 유형을 선택해주세요.');
      return;
    }
    
    if (!newFeePaymentMethod) {
      alert('결제 방법을 선택해주세요.');
      return;
    }
    
    if (!newFeeAmount.trim()) {
      alert('수강료 금액을 입력해주세요.');
      return;
    }

    const amount = parseInt(newFeeAmount.replace(/,/g, ''));
    if (isNaN(amount) || amount <= 0) {
      alert('올바른 금액을 입력해주세요.');
      return;
    }

    // selectedAcademy가 없으면 자동으로 학원 로드 시도
    let academyId = selectedAcademy;
    let shouldSetAcademy = false;
    if (!academyId) {
      console.log('⚠️ selectedAcademy가 없습니다. 학원 목록을 로드합니다...');
      try {
        const response = await academyService.getAll();
        const academies = response.data.academies || [];
        if (academies.length > 0) {
          academyId = academies[0].id;
          console.log('✅ 학원 자동 선택:', academyId);
          shouldSetAcademy = true;
        } else {
          alert('등록된 학원이 없습니다. 먼저 학원을 등록해주세요.');
          return;
        }
      } catch (error) {
        console.error('❌ 학원 목록 로드 실패:', error);
        alert('학원 정보를 불러올 수 없습니다. 네트워크 연결을 확인해주세요.');
        return;
      }
    }

    try {
      const formattedAmount = amount.toLocaleString('ko-KR') + '원';
      
      const response = await tuitionFeeService.create({
        academy_id: academyId,
        amount: formattedAmount,
        value: amount,
        class_type: newFeeClassType,
        payment_method: newFeePaymentMethod
      });

      console.log('수강료 추가 응답:', response);

      // 응답에서 추가된 수강료 정보 가져오기
      console.log('전체 응답:', response);
      console.log('response.fee:', response.fee);
      console.log('response.data:', response.data);
      
      const feeData = response.fee || response.data?.fee;
      
      if (feeData && feeData.id) {
        const newFee = {
          id: feeData.id,
          amount: feeData.amount || formattedAmount,
          value: feeData.value ? feeData.value.toString() : amount.toString(),
          class_type: feeData.class_type || newFeeClassType,
          payment_method: feeData.payment_method || newFeePaymentMethod
        };
        
        console.log('추가된 수강료:', newFee);
        console.log('수강료 ID 확인:', newFee.id);
        console.log('UUID 형식 확인:', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(newFee.id));
        
        // 상태에 직접 추가 (즉시 반영) - loadTuitionFees 호출하지 않음
        setTuitionFees(prev => {
          // 중복 체크
          const exists = prev.find(f => f.id === newFee.id);
          if (exists) {
            console.log('이미 존재하는 수강료입니다.');
            return prev;
          }
          const updated = [...prev, newFee];
          console.log('업데이트된 수강료 목록:', updated);
          return updated;
        });
      } else {
        // 응답에 fee가 없으면 서버에서 목록 가져오기
        console.log('응답에 fee가 없어서 서버에서 목록을 가져옵니다.');
        await loadTuitionFees(academyId);
      }
      
      // selectedAcademy 설정 (useEffect 트리거 방지를 위해 마지막에 설정)
      if (shouldSetAcademy) {
        setSelectedAcademy(academyId);
      }
      
      setNewFeeAmount('');
      setNewFeeClassType('');
      setNewFeePaymentMethod('');
      alert(`수강료 "${formattedAmount}"이(가) 추가되었습니다.`);
    } catch (error) {
      console.error('수강료 추가 실패:', error);
      console.error('에러 상세:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.message || '수강료 추가에 실패했습니다.';
      alert(`수강료 추가에 실패했습니다: ${errorMessage}`);
    }
  };

  const handleDeleteFee = async (feeId) => {
    if (!window.confirm('정말 이 수강료를 삭제하시겠습니까?')) return;

    console.log('수강료 삭제 시도 - feeId:', feeId);
    console.log('현재 수강료 목록:', tuitionFees);

    try {
      // UUID 형식인지 확인 (DB에서 로드한 수강료)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(feeId));
      
      console.log('UUID 형식 확인:', isUUID);
      
      if (isUUID) {
        // DB에서 로드한 수강료는 서버에서 삭제
        console.log('서버에서 수강료 삭제 시도:', feeId);
        await tuitionFeeService.delete(feeId);
        console.log('서버 삭제 성공');
        setTuitionFees(prev => {
          const updated = prev.filter(fee => fee.id !== feeId);
          console.log('삭제 후 수강료 목록:', updated);
          return updated;
        });
        alert('수강료가 삭제되었습니다.');
      } else {
        // localStorage에서 로드한 수강료는 localStorage에서만 삭제
        console.log('localStorage에서 수강료 삭제');
        const saved = localStorage.getItem('tuitionFees');
        if (saved) {
          const fees = JSON.parse(saved);
          const updatedFees = fees.filter(fee => fee.id !== feeId);
          localStorage.setItem('tuitionFees', JSON.stringify(updatedFees));
          setTuitionFees(updatedFees);
          alert('수강료가 삭제되었습니다.');
        } else {
          // localStorage에도 없으면 상태에서만 제거
          setTuitionFees(prev => prev.filter(fee => fee.id !== feeId));
          alert('수강료가 삭제되었습니다.');
        }
      }
    } catch (error) {
      console.error('수강료 삭제 실패:', error);
      console.error('에러 상세:', error.response?.data);
      console.error('요청한 feeId:', feeId);
      
      // 에러 메시지 추출
      let errorMessage = '수강료 삭제에 실패했습니다.';
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
      
      alert(`수강료 삭제에 실패했습니다: ${errorMessage}\n\n콘솔 로그를 확인해주세요.`);
    }
  };

  const handleEditFee = (fee) => {
    setEditingFeeId(fee.id);
    // 금액에서 숫자만 추출
    const amountValue = fee.value || fee.amount.replace(/[^0-9]/g, '');
    setEditFeeAmount(amountValue);
    setEditFeeClassType(fee.class_type || '');
    setEditFeePaymentMethod(fee.payment_method || '');
  };

  const handleCancelEdit = () => {
    setEditingFeeId(null);
    setEditFeeAmount('');
    setEditFeeClassType('');
    setEditFeePaymentMethod('');
  };

  const handleSaveEdit = async () => {
    if (!editFeeClassType) {
      alert('수업 유형을 선택해주세요.');
      return;
    }
    
    if (!editFeePaymentMethod) {
      alert('결제 방법을 선택해주세요.');
      return;
    }
    
    if (!editFeeAmount.trim()) {
      alert('수강료 금액을 입력해주세요.');
      return;
    }

    const amount = parseInt(editFeeAmount.replace(/,/g, ''));
    if (isNaN(amount) || amount <= 0) {
      alert('올바른 금액을 입력해주세요.');
      return;
    }

    try {
      const formattedAmount = amount.toLocaleString('ko-KR') + '원';
      
      // UUID 형식인지 확인 (DB에서 로드한 수강료)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(editingFeeId));
      
      if (isUUID) {
        // DB에서 로드한 수강료는 서버에서 수정
        console.log('서버에서 수강료 수정 시도:', editingFeeId);
        const response = await tuitionFeeService.update(editingFeeId, {
          amount: formattedAmount,
          value: amount,
          class_type: editFeeClassType,
          payment_method: editFeePaymentMethod
        });

        console.log('수강료 수정 응답:', response);

        const feeData = response.fee || response.data?.fee;
        
        if (feeData) {
          // 상태 업데이트 (자동 적용)
          setTuitionFees(prev => prev.map(fee => 
            fee.id === editingFeeId 
              ? {
                  ...fee,
                  amount: feeData.amount || formattedAmount,
                  value: feeData.value ? feeData.value.toString() : amount.toString(),
                  class_type: feeData.class_type || editFeeClassType,
                  payment_method: feeData.payment_method || editFeePaymentMethod
                }
              : fee
          ));
        } else {
          // 응답에 fee가 없으면 서버에서 목록 가져오기
          await loadTuitionFees(selectedAcademy);
        }
      } else {
        // localStorage에서 로드한 수강료는 localStorage에서만 수정
        console.log('localStorage에서 수강료 수정');
        const saved = localStorage.getItem('tuitionFees');
        if (saved) {
          const fees = JSON.parse(saved);
          const updatedFees = fees.map(fee => 
            fee.id === editingFeeId 
              ? {
                  ...fee,
                  amount: formattedAmount,
                  value: amount.toString(),
                  class_type: editFeeClassType,
                  payment_method: editFeePaymentMethod
                }
              : fee
          );
          localStorage.setItem('tuitionFees', JSON.stringify(updatedFees));
          setTuitionFees(updatedFees);
        } else {
          // localStorage에도 없으면 상태에서만 수정
          setTuitionFees(prev => prev.map(fee => 
            fee.id === editingFeeId 
              ? {
                  ...fee,
                  amount: formattedAmount,
                  value: amount.toString(),
                  class_type: editFeeClassType,
                  payment_method: editFeePaymentMethod
                }
              : fee
          ));
        }
      }
      
      handleCancelEdit();
      alert(`수강료가 수정되었습니다.`);
    } catch (error) {
      console.error('수강료 수정 실패:', error);
      const errorMessage = error.response?.data?.error || error.message || '수강료 수정에 실패했습니다.';
      alert(`수강료 수정에 실패했습니다: ${errorMessage}`);
    }
  };

  const loadSubjects = async () => {
    if (!selectedAcademy) {
      console.log('학원 ID가 없어서 과목을 불러올 수 없습니다.');
      setSubjects([]); // 빈 배열로 초기화
      return;
    }
    
    try {
      console.log('과목 목록 로드 시도 - academy_id:', selectedAcademy);
      const response = await subjectService.getAll(selectedAcademy);
      console.log('과목 목록 응답:', response.data);
      
      const subjectsList = response.data.subjects || response.data || [];
      console.log('로드된 과목 개수:', subjectsList.length);
      
      // DB에서 로드한 과목만 표시 (빈 배열이어도 빈 배열로 설정)
      setSubjects(subjectsList);
    } catch (error) {
      console.error('과목 목록 로드 실패:', error);
      console.error('에러 상세:', error.response?.data);
      setSubjects([]); // 에러 발생 시 빈 배열로 설정
    }
  };

  const loadClassrooms = async () => {
    if (!selectedAcademy) return;
    try {
      const response = await classroomService.getAll(selectedAcademy);
      const classroomList = response.data.classrooms || [];
      setAvailableClassrooms(classroomList);
      
      // 1단계: DB의 시간표 설정(classroom_ids) 우선 사용
      try {
        const settingsResponse = await timetableSettingsService.get(selectedAcademy);
        const settings = settingsResponse.settings;
        if (settings && Array.isArray(settings.classroom_ids) && settings.classroom_ids.length > 0) {
          const selectedNames = settings.classroom_ids
            .map(id => {
              const found = classroomList.find(c => c.id === id);
              return found ? found.name : '';
            })
            .filter(name => name);
          
          if (selectedNames.length > 0) {
            console.log('✅ DB 시간표 설정에서 강의실 로드 (Settings):', selectedNames);
            setClassrooms(selectedNames);
            // 이름으로 다시 ID 매칭 (혹시 일부 ID가 빠졌을 수 있으므로)
            const ids = selectedNames.map(name => {
              const found = classroomList.find(c => c.name === name);
              return found ? found.id : null;
            });
            setSelectedClassroomIds(ids);
            return;
          }
        }
      } catch (settingsError) {
        console.warn('시간표 설정 로드 실패(무시) - localStorage로 폴백 예정:', settingsError);
      }
      
      // 2단계: localStorage - "강의실 이름"을 먼저 사용
      try {
        const saved = localStorage.getItem('timetableSettings');
        if (saved) {
          const localSettings = JSON.parse(saved);
          
          // 우선 classrooms(이름 배열)를 사용
          if (Array.isArray(localSettings.classrooms) && localSettings.classrooms.length > 0) {
            const names = localSettings.classrooms;
            console.log('✅ localStorage에서 강의실 이름 로드 (Settings):', names);
            setClassrooms(names);
            
            // 이름을 DB 강의실과 매칭해서 ID 설정 (없으면 null)
            const ids = names.map(name => {
              const found = classroomList.find(c => c.name === name);
              return found ? found.id : null;
            });
            setSelectedClassroomIds(ids);
            return;
          }
          
          // classrooms가 없고 classroomIds만 있는 오래된 데이터인 경우: ID로 이름 매칭
          if (Array.isArray(localSettings.classroomIds) && localSettings.classroomIds.length > 0) {
            const selectedNames = localSettings.classroomIds
              .map(id => {
                const found = classroomList.find(c => c.id === id);
                return found ? found.name : '';
              })
              .filter(name => name);
            
            if (selectedNames.length > 0) {
              console.log('✅ localStorage에서 강의실 ID 로드 (Settings):', selectedNames);
              setClassrooms(selectedNames);
              const ids = selectedNames.map(name => {
                const found = classroomList.find(c => c.name === name);
                return found ? found.id : null;
              });
              setSelectedClassroomIds(ids);
              return;
            }
          }
        }
      } catch (e) {
        console.warn('localStorage 시간표 설정 파싱 실패:', e);
      }
      
      // 3단계: 아무 설정도 없으면 기본값 하나만 표시
      setClassrooms(['']);
      setSelectedClassroomIds([null]);
    } catch (error) {
      console.error('강의실 목록 로드 실패:', error);
    }
  };


  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAcademyLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setAcademyLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 학원 정보 저장 기능
  const handleSaveAcademy = async () => {
    try {
      // 학원 이름 검증
      if (!academyName || !academyName.trim()) {
        alert('학원 이름을 입력해주세요.');
        return;
      }

      // 기존 코드 유지 (재생성 불가)
      // 코드가 없을 때만 새로 생성 (최초 생성 시에만)
      let codeToSave = academyCode;
      if (!codeToSave || !codeToSave.trim()) {
        codeToSave = generateAcademyCode();
        setAcademyCode(codeToSave);
      }
      // 이미 코드가 있으면 기존 코드 유지 (재생성 불가)

      // 빈 문자열을 null로 변환
      const data = {
        name: academyName.trim(),
        address: academyAddress && academyAddress.trim() ? academyAddress.trim() : null,
        floor: academyFloor && academyFloor.trim() ? academyFloor.trim() : null,
        logo_url: logoPreview && logoPreview.trim() ? logoPreview.trim() : null,
        code: codeToSave && codeToSave.trim() ? codeToSave.trim() : null,
      };

      console.log('전송할 학원 데이터:', data); // 디버깅용
      console.log('현재 selectedAcademy:', selectedAcademy);

      let savedAcademy;
      const isNewAcademy = !selectedAcademy;
      
      if (selectedAcademy) {
        console.log('기존 학원 업데이트 시도:', selectedAcademy);
        const updateResponse = await academyService.update(selectedAcademy, data);
        console.log('업데이트 응답:', updateResponse.data);
        savedAcademy = updateResponse.data.academy;
      } else {
        console.log('새 학원 생성 시도');
        const createResponse = await academyService.create(data);
        console.log('생성 응답:', createResponse.data);
        savedAcademy = createResponse.data.academy;
        
        if (!savedAcademy || !savedAcademy.id) {
          throw new Error('학원 생성 후 응답 데이터가 올바르지 않습니다.');
        }
      }
      
      // 저장된 데이터로 즉시 상태 업데이트
      if (savedAcademy && savedAcademy.id) {
        console.log('✅ 저장 성공! 저장된 학원 정보:', savedAcademy);
        console.log('학원 ID:', savedAcademy.id);
        
        // 상태 업데이트
        setAcademyName(savedAcademy.name || '');
        setAcademyAddress(savedAcademy.address || '');
        setAcademyFloor(savedAcademy.floor || '');
        setLogoPreview(savedAcademy.logo_url || '');
        setAcademyCode(savedAcademy.code || '');
        setSelectedAcademy(savedAcademy.id);
        
        console.log('상태 업데이트 완료. selectedAcademy:', savedAcademy.id);
        
        // 전역 Context 업데이트 (네비게이션바 자동 업데이트)
        updateAcademy(savedAcademy);
        console.log('네비게이션바 업데이트 완료');
        
        // 학원이 새로 생성되었거나 업데이트된 경우, 관련 데이터 로드
        try {
          await loadSubjects();
          await loadClassrooms();
          console.log('과목/강의실 로드 완료');
        } catch (error) {
          console.warn('과목/강의실 로드 실패:', error);
        }
        
        alert(`학원 정보가 ${isNewAcademy ? '등록' : '저장'}되었습니다.`);
        
        // 저장 후 편집 모드 종료
        setIsEditMode(false);
      } else {
        throw new Error('저장된 학원 데이터가 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('학원 정보 저장 실패:', error);
      console.error('에러 응답 전체:', error.response?.data);
      console.error('에러 상태 코드:', error.response?.status);
      console.error('에러 메시지:', error.message);
      
      // 에러 메시지 추출
      let errorMessage = '저장에 실패했습니다.';
      if (error.response?.data) {
        // 에러 응답의 모든 내용을 로깅
        console.error('에러 응답 상세:', JSON.stringify(error.response.data, null, 2));
        
        if (typeof error.response.data.error === 'string') {
          errorMessage = error.response.data.error;
        } else if (error.response.data.error?.message) {
          errorMessage = error.response.data.error.message;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          // 에러 객체 전체를 문자열로 변환
          errorMessage = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`저장에 실패했습니다: ${errorMessage}`);
    }
  };

  const handleAddSubject = async () => {
    if (!subjectName.trim()) {
      alert('과목명을 입력해주세요.');
      return;
    }

    // selectedAcademy가 없으면 자동으로 학원 로드 시도
    let academyId = selectedAcademy;
    if (!academyId) {
      console.log('⚠️ selectedAcademy가 없습니다. 학원 목록을 로드합니다...');
      try {
        const response = await academyService.getAll();
        const academies = response.data.academies || [];
        if (academies.length > 0) {
          academyId = academies[0].id;
          console.log('✅ 학원 자동 선택:', academyId);
          setSelectedAcademy(academyId);
        } else {
          alert('등록된 학원이 없습니다. 테스트를 위해 Supabase에 학원을 먼저 생성해주세요.');
          console.error('❌ 등록된 학원이 없습니다.');
          return;
        }
      } catch (error) {
        console.error('❌ 학원 목록 로드 실패:', error);
        alert('학원 정보를 불러올 수 없습니다. 네트워크 연결을 확인해주세요.');
        return;
      }
    }

    try {
      const data = {
        name: subjectName.trim(),
        color: subjectColor,
        description: subjectDescription.trim() || null,
        academy_id: academyId, // 자동으로 로드한 academyId 사용
      };

      console.log('과목 추가 시도:', data);
      const response = await subjectService.create(data);
      console.log('과목 추가 응답:', response.data);
      
      // 응답에서 받은 과목을 즉시 목록에 추가
      if (response.data?.subject) {
        const newSubject = {
          id: response.data.subject.id,
          name: response.data.subject.name,
          color: response.data.subject.color || subjectColor,
          description: response.data.subject.description || subjectDescription.trim() || '',
          academy_id: response.data.subject.academy_id || academyId
        };
        console.log('✅ 새로 추가된 과목:', newSubject);
        
        // 기존 목록에 추가 (중복 방지)
        setSubjects(prevSubjects => {
          // prevSubjects가 배열이 아닌 경우 배열로 변환
          const currentSubjects = Array.isArray(prevSubjects) ? prevSubjects : [];
          
          // 이미 존재하는지 확인
          const exists = currentSubjects.some(s => s.id === newSubject.id);
          if (exists) {
            console.log('⚠️ 과목이 이미 목록에 있습니다. 업데이트합니다.');
            return currentSubjects.map(s => s.id === newSubject.id ? newSubject : s);
          }
          console.log('✅ 과목을 목록에 추가합니다. 현재 개수:', currentSubjects.length, '→', currentSubjects.length + 1);
          return [...currentSubjects, newSubject];
        });
      } else {
        console.warn('⚠️ 응답에 subject 데이터가 없습니다. 목록 새로고침을 시도합니다.');
        // 응답에 데이터가 없으면 목록 새로고침
        setTimeout(async () => {
          await loadSubjects();
        }, 500);
      }
      
      // 폼 초기화
      const addedSubjectName = subjectName.trim();
      setSubjectName('');
      setSubjectColor(colorOptions[0].value); // 첫 번째 색상(빨강)으로 초기화
      setSubjectDescription('');
      
      alert(`과목 "${addedSubjectName}"이(가) 추가되었습니다.`);
    } catch (error) {
      console.error('과목 추가 실패:', error);
      const errorMessage = error.response?.data?.error || error.message || '과목 추가에 실패했습니다.';
      alert(`과목 추가에 실패했습니다: ${errorMessage}`);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      console.log('🗑️ 과목 삭제 시도 - ID:', subjectId);
      const response = await subjectService.delete(subjectId);
      console.log('✅ 과목 삭제 성공:', response.data);
      alert('과목이 삭제되었습니다.');
      
      // 삭제된 과목을 목록에서 제거
      setSubjects(prevSubjects => {
        const currentSubjects = Array.isArray(prevSubjects) ? prevSubjects : [];
        return currentSubjects.filter(s => s.id !== subjectId);
      });
      
      // 목록 새로고침 (백업)
      setTimeout(async () => {
        await loadSubjects();
      }, 300);
    } catch (error) {
      console.error('❌ 과목 삭제 실패:', error);
      console.error('에러 상세:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      const errorMessage = error.response?.data?.error || error.message || '과목 삭제에 실패했습니다.';
      alert(`과목 삭제에 실패했습니다: ${errorMessage}`);
    }
  };

  const handleEditSubject = (subject) => {
    setEditingSubjectId(subject.id);
    setEditSubjectName(subject.name);
    setEditSubjectColor(subject.color || colorOptions[0].value);
    setEditSubjectDescription(subject.description || '');
  };

  const handleSaveSubject = async () => {
    if (!editSubjectName.trim()) {
      alert('과목명을 입력해주세요.');
      return;
    }

    if (!editingSubjectId) return;

    try {
      const data = {
        name: editSubjectName.trim(),
        color: editSubjectColor,
        description: editSubjectDescription.trim() || null,
      };

      console.log('과목 수정 시도:', data);
      const response = await subjectService.update(editingSubjectId, data);
      console.log('과목 수정 응답:', response.data);
      
      // 목록 업데이트
      setSubjects(prevSubjects => {
        const currentSubjects = Array.isArray(prevSubjects) ? prevSubjects : [];
        return currentSubjects.map(s => 
          s.id === editingSubjectId 
            ? {
                ...s,
                name: editSubjectName.trim(),
                color: editSubjectColor,
                description: editSubjectDescription.trim() || ''
              }
            : s
        );
      });
      
      // 목록 새로고침 (백업)
      setTimeout(async () => {
        await loadSubjects();
      }, 300);
      
      handleCancelEditSubject();
      alert(`과목 "${editSubjectName.trim()}"이(가) 수정되었습니다.`);
    } catch (error) {
      console.error('과목 수정 실패:', error);
      const errorMessage = error.response?.data?.error || error.message || '과목 수정에 실패했습니다.';
      alert(`과목 수정에 실패했습니다: ${errorMessage}`);
    }
  };

  const handleCancelEditSubject = () => {
    setEditingSubjectId(null);
    setEditSubjectName('');
    setEditSubjectColor('');
    setEditSubjectDescription('');
  };

  const toggleDay = (day) => {
    if (!isTimetableEditMode) return;
    setOperatingDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleDayTimeChange = (day, field, value) => {
    if (!isTimetableEditMode) return;
    setDayTimeSettings(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleClassroomChange = async (index, value) => {
    if (!isTimetableEditMode) return;
    const newClassrooms = [...classrooms];
    newClassrooms[index] = value;
    setClassrooms(newClassrooms);
    
    // 입력한 이름으로 강의실 찾기
    if (value.trim()) {
      const foundClassroom = availableClassrooms.find(c => c.name === value.trim());
      if (foundClassroom) {
        // 강의실을 찾았으면 ID 저장
        const newIds = [...selectedClassroomIds];
        newIds[index] = foundClassroom.id;
        setSelectedClassroomIds(newIds);
        console.log('✅ 강의실 선택:', foundClassroom.id, foundClassroom.name);
      } else {
        // 강의실을 찾지 못했으면 ID 제거
        const newIds = [...selectedClassroomIds];
        newIds[index] = null;
        setSelectedClassroomIds(newIds);
        console.warn('⚠️ 강의실을 찾을 수 없습니다:', value);
      }
    } else {
      // 빈 값이면 ID 제거
      const newIds = [...selectedClassroomIds];
      newIds[index] = null;
      setSelectedClassroomIds(newIds);
    }
  };

  const handleDeleteClassroom = async (index) => {
    if (!isTimetableEditMode) return;
    
    const classroomIdToRemove = selectedClassroomIds[index];
    const classroomName = classrooms[index];
    
    // 해당 강의실을 사용하는 수업이 있는지 확인
    if (classroomIdToRemove && classroomName && classroomName.trim()) {
      const confirmMessage = `"${classroomName}" 강의실을 삭제하시겠습니까?\n\n이 강의실을 사용하는 수업이 있다면 시간표에서 표시되지 않을 수 있습니다.\n\n저장하면 이 강의실이 시간표 설정에서 제거됩니다.`;
      if (!window.confirm(confirmMessage)) {
        return;
      }
    } else if (classroomName && classroomName.trim()) {
      // ID는 없지만 이름이 있는 경우 (아직 저장되지 않은 강의실)
      if (!window.confirm(`"${classroomName}" 강의실 입력을 삭제하시겠습니까?`)) {
        return;
      }
    }
    
    // 배열에서 완전히 제거 (빈 문자열로 남기지 않음)
    const newClassrooms = classrooms.filter((_, i) => i !== index);
    const newIds = selectedClassroomIds.filter((_, i) => i !== index);
    
    // 모든 강의실이 삭제되면 최소 하나의 빈 입력창은 유지
    if (newClassrooms.length === 0) {
      setClassrooms(['']);
      setSelectedClassroomIds([null]);
    } else {
      setClassrooms(newClassrooms);
      setSelectedClassroomIds(newIds);
    }
    
    console.log('✅ 강의실 삭제 완료:', { 
      삭제된강의실: classroomName,
      남은강의실수: newClassrooms.length || 1 // 빈 입력창 하나는 항상 있음
    });
  };

  const handleAddClassroom = () => {
    if (!isTimetableEditMode) return;
    if (classrooms.length < 10) {
      setClassrooms([...classrooms, '']);
      setSelectedClassroomIds([...selectedClassroomIds, null]);
    }
  };

  const handleSaveTimetable = async () => {
    // selectedAcademy가 없으면 자동으로 학원 로드 시도
    let academyId = selectedAcademy;
    if (!academyId) {
      console.log('⚠️ selectedAcademy가 없습니다. 학원 목록을 로드합니다...');
      try {
        const response = await academyService.getAll();
        const academies = response.data.academies || [];
        if (academies.length > 0) {
          academyId = academies[0].id;
          console.log('✅ 학원 자동 선택:', academyId);
          setSelectedAcademy(academyId);
        } else {
          alert('등록된 학원이 없습니다. 먼저 학원을 등록해주세요.');
          console.error('❌ 등록된 학원이 없습니다.');
          return;
        }
      } catch (error) {
        console.error('❌ 학원 목록 로드 실패:', error);
        alert('학원 정보를 불러올 수 없습니다. 네트워크 연결을 확인해주세요.');
        return;
      }
    }

    try {
      // 강의실 저장 및 ID 수집
      // 실제 입력된 강의실만 처리 (빈 문자열 제외)
      const validClassroomIds = [];
      const validClassroomNames = [];
      
      // 먼저 모든 강의실 목록 가져오기
      const allClassroomsResponse = await classroomService.getAll(academyId);
      const allClassrooms = allClassroomsResponse.data.classrooms || [];
      
      console.log('📝 저장할 강의실 입력값:', classrooms);
      console.log('📝 저장된 강의실 ID:', selectedClassroomIds);
      
      // 각 강의실 입력 필드에 대해 처리 (인덱스 유지)
      for (let i = 0; i < classrooms.length; i++) {
        const name = classrooms[i]?.trim();
        if (!name) continue; // 빈 값은 건너뛰기
        
        const existingId = selectedClassroomIds[i];
        
        console.log(`🔍 강의실 처리 중 [${i}]:`, { name, existingId });
        
        // 이미 ID가 있고 해당 강의실이 존재하는지 확인
        if (existingId && allClassrooms.some(c => c.id === existingId)) {
          const existingClassroom = allClassrooms.find(c => c.id === existingId);
          // 이름이 일치하는지 확인
          if (existingClassroom.name === name) {
            validClassroomIds.push(existingId);
            validClassroomNames.push(name);
            console.log('✅ 기존 강의실 사용:', existingId, name);
            continue;
          } else {
            console.warn(`⚠️ ID는 있지만 이름이 다릅니다. 이름으로 다시 찾습니다.`, {
              저장된ID: existingId,
              저장된이름: existingClassroom.name,
              입력한이름: name
            });
          }
        }
        
        // 이름으로 강의실 찾기
        let foundClassroom = allClassrooms.find(c => c.name === name);
        
        if (!foundClassroom) {
          // 강의실이 없으면 생성
          try {
            console.log(`📝 강의실 생성 시도: ${name}`);
            const createResponse = await classroomService.create({
              name: name,
              academy_id: academyId,
              capacity: 20,
            });
            
            if (createResponse.data?.classroom) {
              foundClassroom = createResponse.data.classroom;
              console.log(`✅ 강의실 생성 완료: ${name}`, foundClassroom.id);
              // 생성 후 목록에 추가
              allClassrooms.push(foundClassroom);
            }
          } catch (classroomError) {
            console.warn(`⚠️ 강의실 생성 실패: ${name}`, classroomError);
            // 생성 실패해도 계속 진행
          }
        }
        
        if (foundClassroom && foundClassroom.id) {
          // UUID 형식 검증
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(foundClassroom.id)) {
            console.error(`❌ 잘못된 강의실 ID 형식: ${foundClassroom.id} (강의실: ${name})`);
            continue; // 잘못된 ID는 건너뛰기
          }
          
          validClassroomIds.push(foundClassroom.id);
          validClassroomNames.push(name);
          // selectedClassroomIds 업데이트 (원래 인덱스 유지)
          const newIds = [...selectedClassroomIds];
          newIds[i] = foundClassroom.id;
          setSelectedClassroomIds(newIds);
          console.log('✅ 강의실 ID 저장:', foundClassroom.id, name);
        } else {
          console.warn(`⚠️ 강의실을 찾거나 생성할 수 없습니다: ${name}`);
        }
      }
      
      console.log('✅ 최종 저장할 강의실:', {
        IDs: validClassroomIds,
        Names: validClassroomNames
      });

      // 기존 설정에서 제거된 강의실 확인 (기존 수업과의 충돌 방지)
      try {
        const existingSettings = await timetableSettingsService.get(academyId);
        if (existingSettings.settings && existingSettings.settings.classroom_ids) {
          const oldClassroomIds = existingSettings.settings.classroom_ids;
          const removedClassroomIds = oldClassroomIds.filter(id => !validClassroomIds.includes(id));
          
          if (removedClassroomIds.length > 0) {
            console.log('⚠️ 제거된 강의실 ID:', removedClassroomIds);
            // 제거된 강의실을 사용하는 수업이 있는지 확인하는 로직은 서버에서 처리
            // 여기서는 경고만 표시 (사용자에게는 강의실 "이름"만 보여주고, ID는 노출하지 않음)
            const removedNames = removedClassroomIds
              .map(id => {
                const found = allClassrooms.find(c => c.id === id);
                return found ? found.name : null; // 이름을 찾지 못하면 사용자에게는 표시하지 않음
              })
              .filter(Boolean);

            // 실제 이름을 찾은 강의실이 있을 때만 경고창을 띄움
            if (removedNames.length > 0) {
              const warningMessage =
                `다음 강의실 설정이 제거됩니다:\n` +
                `${removedNames.join(', ')}\n\n` +
                `이 강의실을 사용하는 수업이 있다면 시간표에서 표시되지 않을 수 있습니다.\n` +
                `계속하시겠습니까?`;

              if (!window.confirm(warningMessage)) {
                return;
              }
            }
          }
        }
      } catch (checkError) {
        console.warn('기존 설정 확인 실패:', checkError);
        // 확인 실패해도 계속 진행
      }

      // 시간표 설정을 DB에 저장 (강의실 ID 포함)
      console.log('📝 시간표 설정 저장 시도:', {
        academyId,
        timeInterval,
        operatingDays,
        timetableName,
        classroomIds: validClassroomIds,
        classroomsCount: validClassroomIds.length
      });
      
      const response = await timetableSettingsService.save({
        academy_id: academyId,
        operating_days: operatingDays,
        time_interval: timeInterval,
        day_time_settings: dayTimeSettings,
        timetable_name: timetableName || null,
        classroom_ids: validClassroomIds,
      });

      console.log('✅ 시간표 설정 저장 성공:', response);

      // ---- 프론트 상태를 사용자가 입력한 값으로 즉시 동기화 ----
      // DB까지 저장이 성공했으므로, 지금 화면의 강의실 입력칸에는
      // 방금 저장한 강의실 이름/ID를 그대로 보여주도록 고정한다.
      // 최소 하나의 입력창은 항상 유지
      if (validClassroomNames.length === 0) {
        setClassrooms(['']);
        setSelectedClassroomIds([null]);
      } else {
        setClassrooms(validClassroomNames);
        setSelectedClassroomIds(validClassroomIds);
      }
      // 저장 직후에는 시간표/강의실 섹션을 읽기 전용 모드로 전환
      setIsTimetableEditMode(false);

      // localStorage에도 저장 (마이그레이션 지원)
      try {
        const localSettings = {
          timeInterval,
          operatingDays,
          dayTimeSettings,
          timetableName,
          classroomIds: validClassroomIds,
          classrooms: validClassroomNames,
        };
        localStorage.setItem('timetableSettings', JSON.stringify(localSettings));
        console.log('✅ localStorage에도 저장 완료');
      } catch (localError) {
        console.warn('localStorage 저장 실패:', localError);
      }

      // 저장 후 DB에서 실제로 저장된 설정을 다시 읽어서 UI 업데이트
      try {
        console.log('🔄 저장된 설정 확인 및 UI 업데이트 중...');
        
        // 강의실 목록 새로고침 (최신 상태 확인)
        const refreshedClassrooms = await classroomService.getAll(academyId);
        const refreshedList = refreshedClassrooms.data.classrooms || [];
        setAvailableClassrooms(refreshedList);
        console.log('✅ 강의실 목록 새로고침 완료:', refreshedList.length, '개');
        
        // 저장된 설정 다시 읽기
        const savedSettings = await timetableSettingsService.get(academyId);
        const savedClassroomIds = savedSettings.settings?.classroom_ids || [];
        
        console.log('📋 DB에 실제 저장된 강의실 ID:', savedClassroomIds);
        console.log('📋 저장 시도한 강의실 ID:', validClassroomIds);
        
        // 저장된 ID로 실제 강의실 찾기
        const actualClassrooms = savedClassroomIds
          .map(id => refreshedList.find(c => c.id === id))
          .filter(Boolean);
        
        console.log('✅ 실제 DB에서 찾은 강의실:', actualClassrooms.map(c => ({ id: c.id, name: c.name })));
        
        if (actualClassrooms.length > 0) {
          // 저장된 강의실로 상태 업데이트 (실제 DB ID와 이름 사용)
          const updatedClassroomNames = actualClassrooms.map(c => c.name);
          const updatedClassroomIds = actualClassrooms.map(c => c.id);
          
          // 상태 업데이트 - 배열 길이를 맞춰서 업데이트
          setClassrooms(updatedClassroomNames);
          setSelectedClassroomIds(updatedClassroomIds);
          
          console.log('✅ 강의실 상태 업데이트 완료:', {
            classrooms: updatedClassroomNames,
            selectedClassroomIds: updatedClassroomIds,
            개수: updatedClassroomNames.length
          });
        } else {
          // 저장된 강의실이 없어도 최소 하나의 입력창은 유지
          console.warn('⚠️ 저장된 강의실을 찾을 수 없습니다. 빈 입력창을 표시합니다.');
          setClassrooms(['']);
          setSelectedClassroomIds([null]);
        }
        
        // 다른 설정도 다시 로드하여 UI 동기화
        if (savedSettings.settings) {
          const settings = savedSettings.settings;
          if (settings.time_interval) setTimeInterval(settings.time_interval);
          if (settings.day_time_settings) setDayTimeSettings(settings.day_time_settings);
          if (settings.operating_days && Array.isArray(settings.operating_days)) {
            setOperatingDays(settings.operating_days);
          }
          if (settings.timetable_name) setTimetableName(settings.timetable_name);
        }
        
        // 최종적으로 loadTimetableSettings를 호출하여 UI 완전히 새로고침
        console.log('🔄 설정 페이지 UI 새로고침 중...');
        await loadTimetableSettings();
        console.log('✅ 설정 페이지 UI 새로고침 완료');
        
      } catch (loadError) {
        console.error('❌ 저장 후 확인 실패:', loadError);
        // 실패해도 loadTimetableSettings 호출 시도
        try {
          console.log('🔄 설정 다시 로드 시도...');
          await loadTimetableSettings();
          console.log('✅ 설정 다시 로드 완료');
        } catch (err) {
          console.warn('설정 다시 로드 실패:', err);
        }
      }

      alert('시간표 설정이 저장되었습니다.');
    } catch (error) {
      console.error('시간표 설정 저장 실패:', error);
      const errorMessage = error.response?.data?.error || error.message || '시간표 설정 저장에 실패했습니다.';
      alert(`시간표 설정 저장에 실패했습니다: ${errorMessage}`);
    }
  };

  // 비밀번호 변경 섹션 컴포넌트
  const PasswordChangeSection = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
      current: false,
      new: false,
      confirm: false
    });

    const handlePasswordChange = async (e) => {
      e.preventDefault();
      setPasswordError('');
      setPasswordSuccess(false);
      setPasswordLoading(true);

      // 유효성 검증
      if (!currentPassword || !newPassword || !confirmPassword) {
        setPasswordError('모든 필드를 입력해주세요.');
        setPasswordLoading(false);
        return;
      }

      if (newPassword.length < 6) {
        setPasswordError('비밀번호는 최소 6자 이상이어야 합니다.');
        setPasswordLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
        setPasswordLoading(false);
        return;
      }

      if (currentPassword === newPassword) {
        setPasswordError('새 비밀번호는 현재 비밀번호와 달라야 합니다.');
        setPasswordLoading(false);
        return;
      }

      try {
        await authService.changePassword(currentPassword, newPassword);
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsPasswordEditMode(false);
        
        setTimeout(() => {
          setPasswordSuccess(false);
        }, 3000);
      } catch (err) {
        const errorMessage = err.response?.data?.error || err.message || '비밀번호 변경에 실패했습니다.';
        setPasswordError(errorMessage);
      } finally {
        setPasswordLoading(false);
      }
    };

    return (
      <div className="settings-section">
        <div className="section-header">
          <h2 className="section-title">비밀번호 변경</h2>
          {!isPasswordEditMode ? (
            <button 
              className="btn-edit"
              onClick={() => setIsPasswordEditMode(true)}
            >
              수정하기
            </button>
          ) : (
            <button 
              className="btn-cancel"
              onClick={handleCancelPasswordEdit}
            >
              취소
            </button>
          )}
        </div>
        
        {passwordSuccess && (
          <div className="success-message" style={{ marginBottom: '20px', padding: '12px', borderRadius: '6px', background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' }}>
            ✅ 비밀번호가 성공적으로 변경되었습니다.
          </div>
        )}

        {passwordError && (
          <div className="error-message" style={{ marginBottom: '20px', padding: '12px', borderRadius: '6px', background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' }}>
            ⚠️ {passwordError}
          </div>
        )}

        <form onSubmit={handlePasswordChange}>
          <div className="form-group">
            <label className="form-label">현재 비밀번호</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPasswords.current ? 'text' : 'password'}
                className="form-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="현재 비밀번호를 입력하세요"
                required
                disabled={passwordLoading || !isPasswordEditMode}
                readOnly={!isPasswordEditMode}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                tabIndex={-1}
              >
                {showPasswords.current ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">새 비밀번호</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPasswords.new ? 'text' : 'password'}
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호를 입력하세요 (최소 6자)"
                required
                minLength={6}
                disabled={passwordLoading || !isPasswordEditMode}
                readOnly={!isPasswordEditMode}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                tabIndex={-1}
              >
                {showPasswords.new ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">비밀번호 확인</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
                required
                disabled={passwordLoading || !isPasswordEditMode}
                readOnly={!isPasswordEditMode}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                tabIndex={-1}
              >
                {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {isPasswordEditMode && (
            <button 
              type="submit" 
              className="btn-save"
              disabled={passwordLoading}
              style={{ padding: '10px 24px', background: '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: passwordLoading ? 'not-allowed' : 'pointer', opacity: passwordLoading ? 0.6 : 1 }}
            >
              {passwordLoading ? '변경 중...' : '비밀번호 변경'}
            </button>
          )}
        </form>
      </div>
    );
  };

  return (
    <div className="settings-page">
      <h1 className="page-title">설정</h1>

      {/* 설정 섹션 */}
      <div className="settings-section">
        
        <div className="academy-info-section">
          <div className="academy-info-header">
            <h2 className="section-title">학원 정보</h2>
            {!isEditMode ? (
              <button 
                className="btn-edit"
                onClick={() => setIsEditMode(true)}
              >
                수정하기
              </button>
            ) : (
              <button 
                className="btn-cancel"
                onClick={() => {
                  if (window.confirm('수정을 취소하시겠습니까? 변경사항이 저장되지 않습니다.')) {
                    setIsEditMode(false);
                    // 원래 데이터로 복원
                    loadAcademy();
                  }
                }}
              >
                취소
              </button>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">학원 정보</label>
            <input
              type="text"
              className="form-input"
              placeholder="학원명을 입력하세요"
              value={academyName}
              onChange={(e) => setAcademyName(e.target.value)}
              disabled={!isEditMode}
              readOnly={!isEditMode}
            />
          </div>

          <div className="form-group">
            <label className="form-label">학원 로고</label>
            <div
              className={`logo-upload-area ${!isEditMode ? 'disabled' : ''}`}
              onDrop={isEditMode ? handleLogoDrop : undefined}
              onDragOver={isEditMode ? (e) => e.preventDefault() : undefined}
            >
              {logoPreview ? (
                <img src={logoPreview} alt="학원 로고" className="logo-preview" />
              ) : (
                <div className="upload-placeholder">
                  <span>파일을 이곳에 업로드하세요</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="file-input"
                onChange={handleLogoUpload}
                disabled={!isEditMode}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">학원 주소</label>
            <input
              type="text"
              className="form-input"
              placeholder="학원 주소를 입력하세요"
              value={academyAddress}
              onChange={(e) => setAcademyAddress(e.target.value)}
              disabled={!isEditMode}
              readOnly={!isEditMode}
            />
          </div>

          <div className="form-group">
            <label className="form-label">학원 층수</label>
            <input
              type="text"
              className="form-input"
              placeholder="학원 층수를 입력하세요 (예: 2층, 지하1층)"
              value={academyFloor}
              onChange={(e) => setAcademyFloor(e.target.value)}
              disabled={!isEditMode}
              readOnly={!isEditMode}
            />
          </div>

          <div className="form-group">
            <label className="form-label">학원 코드</label>
            <div className="academy-code-wrapper">
              <input
                type="text"
                className="form-input academy-code-input"
                value={academyCode}
                readOnly
                placeholder="학원 코드가 자동으로 생성됩니다"
              />
              <button
                type="button"
                className="btn-copy-code"
                onClick={handleCopyCode}
                title="코드 복사"
                disabled={!academyCode}
              >
                복사
              </button>
            </div>
            <p className="code-description">
              학원 코드는 학생 등록 시 사용되는 고유 코드입니다. 한 번 생성된 코드는 변경할 수 없습니다.
            </p>
          </div>

          {isEditMode && (
            <button className="btn-save" onClick={handleSaveAcademy}>
              설정 저장
            </button>
          )}
        </div>
      </div>

      {/* 과목 관리 섹션 */}
      <div className="settings-section">
        <div className="section-header">
          <h2 className="section-title">과목 관리</h2>
          {!isSubjectEditMode ? (
            <button 
              className="btn-edit"
              onClick={() => setIsSubjectEditMode(true)}
            >
              수정하기
            </button>
          ) : (
            <button 
              className="btn-cancel"
              onClick={() => {
                if (window.confirm('수정을 취소하시겠습니까? 변경사항이 저장되지 않습니다.')) {
                  setIsSubjectEditMode(false);
                  setSubjectName('');
                  setSubjectColor(colorOptions[0].value);
                  setSubjectDescription('');
                  setEditingSubjectId(null);
                }
              }}
            >
              취소
            </button>
          )}
        </div>
        
        <div className="subject-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">과목명 <span className="required">*</span></label>
              <input
                type="text"
                className="form-input"
                placeholder="예: 국어, 수학, 영어, 과학"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                disabled={!isSubjectEditMode}
                readOnly={!isSubjectEditMode}
              />
            </div>
            <div className="form-group color-group">
              <label className="form-label">색상</label>
              <div className="color-chips-wrapper">
                {colorOptions.map((color) => (
                  <div
                    key={color.name}
                    className={`color-chip ${subjectColor === color.value ? 'selected' : ''} ${!isSubjectEditMode ? 'disabled' : ''}`}
                    style={{ 
                      backgroundColor: color.value,
                      cursor: isSubjectEditMode ? 'pointer' : 'default'
                    }}
                    onClick={() => {
                      if (isSubjectEditMode) {
                        console.log('색상 선택:', color.label, color.value);
                        setSubjectColor(color.value);
                      }
                    }}
                    title={color.label}
                  >
                    {subjectColor === color.value && (
                      <span className="color-check">✓</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">설명</label>
            <textarea
              className="form-textarea"
              placeholder="과목에 대한 상세한 설명을 입력하세요"
              value={subjectDescription}
              onChange={(e) => setSubjectDescription(e.target.value)}
              rows={4}
              disabled={!isSubjectEditMode}
              readOnly={!isSubjectEditMode}
            />
          </div>

          {isSubjectEditMode && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button className="btn-add-subject" onClick={handleAddSubject}>
                과목 추가
              </button>
              <button 
                className="btn-save" 
                onClick={() => {
                  // 과목 관리 섹션의 저장 (현재는 추가/수정/삭제가 즉시 반영되므로 확인만)
                  alert('과목 관리가 완료되었습니다.');
                  setIsSubjectEditMode(false);
                }}
                style={{ 
                  padding: '12px 24px', 
                  background: '#27ae60', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  fontSize: '1rem', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                저장 완료
              </button>
            </div>
          )}
        </div>

        <div className="subjects-list">
          {subjects.length === 0 ? (
            <div className="empty-state">등록된 과목이 없습니다.</div>
          ) : (
            <div className="subjects-grid">
              {subjects.map((subject) => (
                <div key={subject.id} className="subject-card">
                  {editingSubjectId === subject.id ? (
                    // 수정 모드
                    <div className="subject-edit-form">
                      <div className="form-group">
                        <label className="form-label">과목명 <span className="required">*</span></label>
                        <input
                          type="text"
                          className="form-input"
                          value={editSubjectName}
                          onChange={(e) => setEditSubjectName(e.target.value)}
                          placeholder="과목명을 입력하세요"
                        />
                      </div>
                      <div className="form-group color-group">
                        <label className="form-label">색상</label>
                        <div className="color-chips-wrapper">
                          {colorOptions.map((color) => (
                            <div
                              key={color.name}
                              className={`color-chip ${editSubjectColor === color.value ? 'selected' : ''}`}
                              style={{ backgroundColor: color.value }}
                              onClick={() => setEditSubjectColor(color.value)}
                              title={color.label}
                            >
                              {editSubjectColor === color.value && (
                                <span className="color-check">✓</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">설명</label>
                        <textarea
                          className="form-textarea"
                          value={editSubjectDescription}
                          onChange={(e) => setEditSubjectDescription(e.target.value)}
                          placeholder="과목에 대한 상세한 설명을 입력하세요"
                          rows={3}
                        />
                      </div>
                      <div className="subject-edit-actions">
                        <button
                          type="button"
                          className="btn-save-fee"
                          onClick={handleSaveSubject}
                        >
                          저장
                        </button>
                        <button
                          type="button"
                          className="btn-cancel-fee"
                          onClick={handleCancelEditSubject}
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 일반 모드
                    <>
                      <div
                        className="subject-color-badge"
                        style={{ backgroundColor: subject.color || '#3D62E4' }}
                      ></div>
                      <div className="subject-info">
                        <h3>{subject.name}</h3>
                        {subject.description && <p>{subject.description}</p>}
                      </div>
                      {isSubjectEditMode && (
                        <div className="subject-actions">
                          <button
                            className="btn-edit-subject"
                            onClick={() => handleEditSubject(subject)}
                          >
                            수정
                          </button>
                          <button
                            className="btn-delete-subject"
                            onClick={() => handleDeleteSubject(subject.id)}
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 시간표 설정 섹션 */}
      <div className="settings-section">
        <div className="section-header">
          <h2 className="section-title">시간표 설정</h2>
          {!isTimetableEditMode ? (
            <button
              type="button"
              className="btn-edit"
              onClick={() => setIsTimetableEditMode(true)}
            >
              수정하기
            </button>
          ) : (
            <button
              type="button"
              className="btn-cancel"
              onClick={async () => {
                if (window.confirm('시간표 설정 수정을 취소하시겠습니까? 저장되지 않은 변경사항은 사라집니다.')) {
                  // 마지막으로 저장된 설정으로 되돌리기
                  await loadTimetableSettings();
                  setIsTimetableEditMode(false);
                }
              }}
            >
              취소
            </button>
          )}
        </div>
        
        <div className="timetable-settings">
          <div className="form-group">
            <label className="form-label">운영 요일</label>
            <div className="days-buttons">
              {days.map((day) => (
                <button
                  key={day}
                  type="button"
                  className={`day-button ${operatingDays.includes(day) ? 'active' : ''} ${!isTimetableEditMode ? 'disabled' : ''}`}
                  onClick={isTimetableEditMode ? () => toggleDay(day) : undefined}
                  disabled={!isTimetableEditMode}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">시간 간격</label>
            <select
              className="form-select"
              value={timeInterval}
              onChange={(e) => setTimeInterval(e.target.value)}
              style={{ maxWidth: '200px' }}
              disabled={!isTimetableEditMode}
            >
              {timeIntervals.map(interval => (
                <option key={interval} value={interval}>{interval}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">요일별 시간 설정</label>
            <div className="day-time-settings">
              {operatingDays.map((day) => (
                <div key={day} className="day-time-row">
                  <div className="day-label">{day}</div>
                  <div className="day-time-inputs">
                    <select
                      className="form-select"
                      value={dayTimeSettings[day]?.startTime || '오전 08:00'}
                      onChange={(e) => handleDayTimeChange(day, 'startTime', e.target.value)}
                      disabled={!isTimetableEditMode}
                    >
                      <option value="오전 08:00">오전 08:00</option>
                      <option value="오전 09:00">오전 09:00</option>
                      <option value="오전 10:00">오전 10:00</option>
                      <option value="오전 11:00">오전 11:00</option>
                      <option value="오전 12:00">오전 12:00</option>
                      <option value="오후 01:00">오후 01:00</option>
                      <option value="오후 02:00">오후 02:00</option>
                    </select>
                    <span className="time-separator">~</span>
                    <select
                      className="form-select"
                      value={dayTimeSettings[day]?.endTime || '오후 08:00'}
                      onChange={(e) => handleDayTimeChange(day, 'endTime', e.target.value)}
                      disabled={!isTimetableEditMode}
                    >
                      <option value="오후 06:00">오후 06:00</option>
                      <option value="오후 07:00">오후 07:00</option>
                      <option value="오후 08:00">오후 08:00</option>
                      <option value="오후 09:00">오후 09:00</option>
                      <option value="오후 10:00">오후 10:00</option>
                      <option value="오후 11:00">오후 11:00</option>
                    </select>
                  </div>
                </div>
              ))}
              {operatingDays.length === 0 && (
                <div className="empty-day-message">운영 요일을 선택해주세요.</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">강의실 설정</label>
            <p className="form-description" style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>
              시간표에 표시할 강의실 이름을 직접 입력하세요. 필요하면 강의실 추가 버튼으로 더 추가할 수 있습니다.
            </p>
            <div className="classrooms-list">
              {classrooms.length === 0 ? (
                // 강의실이 없으면 최소 하나의 입력창 표시
                <div className="classroom-input-wrapper" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="강의실 1"
                    value=""
                    onChange={(e) => {
                      setClassrooms([e.target.value]);
                      setSelectedClassroomIds([null]);
                    }}
                    style={{ flex: 1 }}
                    readOnly={!isTimetableEditMode}
                    disabled={!isTimetableEditMode}
                  />
                </div>
              ) : (
                classrooms.map((classroom, index) => {
                  const selectedId = selectedClassroomIds[index];
                  const isMatched = selectedId && availableClassrooms.some(c => c.id === selectedId);
                  
                  // 수정 모드이면 항상 삭제 가능 (삭제 후 최소 하나의 빈 입력창은 자동으로 유지됨)
                  const canDelete = isTimetableEditMode;
                  
                  return (
                    <div key={index} className="classroom-input-wrapper" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={`강의실 ${index + 1}`}
                        value={classroom}
                        onChange={(e) => handleClassroomChange(index, e.target.value)}
                        style={{
                          borderColor: classroom && !isMatched ? '#ff6b6b' : undefined,
                          flex: 1
                        }}
                        readOnly={!isTimetableEditMode}
                        disabled={!isTimetableEditMode}
                      />
                      {isMatched && (
                        <span style={{ color: '#51cf66', fontSize: '1.2em' }} title="저장된 강의실">
                          ✓
                        </span>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          className="btn-delete-classroom"
                          onClick={() => handleDeleteClassroom(index)}
                          style={{ 
                            padding: '6px 12px', 
                            background: '#e74c3c', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: 'pointer',
                            fontSize: '0.9em',
                            fontWeight: '500',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.background = '#c0392b'}
                          onMouseOut={(e) => e.target.style.background = '#e74c3c'}
                          title={isMatched ? '저장된 강의실 삭제' : '강의실 입력 삭제'}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            {classrooms.length < 10 && isTimetableEditMode && (
              <button 
                className="btn-add-classroom" 
                onClick={handleAddClassroom}
                style={{ marginTop: '10px', padding: '8px 16px', background: '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                + 강의실 추가
              </button>
            )}
            {availableClassrooms.length === 0 && classrooms.some(c => c && c.trim()) && (
              <div style={{ marginTop: '10px', fontSize: '0.85em', color: '#666', padding: '8px', background: '#f8f9fa', borderRadius: '4px' }}>
                💡 강의실 이름을 입력하고 저장하면 자동으로 강의실이 생성됩니다.
              </div>
            )}
            {/* 사용 가능한 강의실 안내 텍스트는 제거 */}
          </div>

          {isTimetableEditMode && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e0e0e0' }}>
              <button 
                className="btn-save" 
                onClick={handleSaveTimetable}
                style={{ 
                  padding: '12px 24px', 
                  background: '#27ae60', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  fontSize: '1rem', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#229954'}
                onMouseOut={(e) => e.target.style.background = '#27ae60'}
              >
                저장 완료
              </button>
            </div>
          )}

          {isTimetableEditMode && (
            <button className="btn-save-timetable" onClick={handleSaveTimetable}>
              시간표 설정 저장
            </button>
          )}
        </div>
      </div>

      {/* 수업 유형 관리 섹션 */}
      <div className="settings-section">
        <h2 className="section-title">수업 유형 관리</h2>
        <div className="form-group">
          <label className="form-label">수업 유형 추가</label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label className="form-label" style={{ fontSize: '0.9rem', marginBottom: '4px' }}>수업 유형 이름</label>
              <input
                type="text"
                className="form-input"
                placeholder="예: 개인레슨, 그룹레슨 등"
                value={newClassType}
                onChange={(e) => setNewClassType(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddClassType();
                  }
                }}
              />
            </div>
            <div style={{ width: '150px' }}>
              <label className="form-label" style={{ fontSize: '0.9rem', marginBottom: '4px' }}>고정 정원 (선택)</label>
              <input
                type="number"
                className="form-input"
                placeholder="예: 1, 2, 3"
                min="1"
                value={newClassTypeMaxStudents}
                onChange={(e) => setNewClassTypeMaxStudents(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddClassType();
                  }
                }}
              />
            </div>
            <button type="button" className="btn-add" onClick={handleAddClassType} style={{ marginBottom: 0 }}>
              추가
            </button>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">등록된 수업 유형</label>
          {classTypes.length === 0 ? (
            <div className="empty-state">등록된 수업 유형이 없습니다.</div>
          ) : (
            <div className="items-list">
              {classTypes.map((type, index) => {
                const typeName = typeof type === 'string' ? type : type.name;
                const typeMaxStudents = typeof type === 'string' ? null : type.maxStudents;
                const typeKey = typeof type === 'string' ? type : `${type.name}-${index}`;
                
                return (
                  <div key={typeKey} className="item-row">
                    {editingClassType === type ? (
                      <>
                        <div style={{ display: 'flex', gap: '8px', flex: 1, alignItems: 'center' }}>
                          <input
                            type="text"
                            className="form-input"
                            value={editClassType}
                            onChange={(e) => setEditClassType(e.target.value)}
                            style={{ flex: 1 }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveClassType();
                              }
                            }}
                          />
                          <input
                            type="number"
                            className="form-input"
                            placeholder="고정 정원"
                            min="1"
                            value={editClassTypeMaxStudents}
                            onChange={(e) => setEditClassTypeMaxStudents(e.target.value)}
                            style={{ width: '120px' }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveClassType();
                              }
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          className="btn-save-fee"
                          onClick={handleSaveClassType}
                        >
                          저장
                        </button>
                        <button
                          type="button"
                          className="btn-cancel-fee"
                          onClick={handleCancelEditClassType}
                        >
                          취소
                        </button>
                      </>
                    ) : (
                      <>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
                          <span>{typeName}</span>
                          {typeMaxStudents !== null && (
                            <span style={{ fontSize: '0.9rem', color: '#666' }}>
                              (고정 정원: {typeMaxStudents}명)
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn-edit-small"
                            onClick={() => handleEditClassType(type)}
                          >
                            수정
                          </button>
                          <button
                            type="button"
                            className="btn-delete-small"
                            onClick={() => handleDeleteClassType(type)}
                          >
                            삭제
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 결제 방법 관리 섹션 */}
      <div className="settings-section">
        <h2 className="section-title">결제 방법 관리</h2>
        <div className="form-group">
          <label className="form-label">결제 방법 추가</label>
          <div className="input-wrapper">
            <input
              type="text"
              className="form-input"
              placeholder="예: 월납, 일시불 등"
              value={newPaymentMethod}
              onChange={(e) => setNewPaymentMethod(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddPaymentMethod();
                }
              }}
            />
            <button type="button" className="btn-add" onClick={handleAddPaymentMethod}>
              추가
            </button>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">등록된 결제 방법</label>
          {paymentMethods.length === 0 ? (
            <div className="empty-state">등록된 결제 방법이 없습니다.</div>
          ) : (
            <div className="items-list">
              {paymentMethods.map((method) => (
                <div key={method} className="item-row">
                  <span>{method}</span>
                  <button
                    type="button"
                    className="btn-delete-small"
                    onClick={() => handleDeletePaymentMethod(method)}
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 수강료 설정 섹션 */}
      <div className="settings-section">
        <div className="section-header">
          <h2 className="section-title">수강료 설정</h2>
          {!isTuitionFeeEditMode ? (
            <button 
              className="btn-edit"
              onClick={() => setIsTuitionFeeEditMode(true)}
            >
              수정하기
            </button>
          ) : (
            <button 
              className="btn-cancel"
              onClick={() => {
                if (window.confirm('수정을 취소하시겠습니까? 변경사항이 저장되지 않습니다.')) {
                  setIsTuitionFeeEditMode(false);
                  setNewFeeAmount('');
                  setNewFeeClassType('');
                  setNewFeePaymentMethod('');
                  setEditingFeeId(null);
                }
              }}
            >
              취소
            </button>
          )}
        </div>
        
        <div className="tuition-fees-settings">
          <div className="form-group">
            <label className="form-label">수강료 추가</label>
            <div className="fee-form">
              <div className="form-row">
                <div className="form-field">
                  <label className="field-label">수업 유형</label>
                  <select
                    className="form-select"
                    value={newFeeClassType}
                    onChange={(e) => setNewFeeClassType(e.target.value)}
                    disabled={!isTuitionFeeEditMode}
                  >
                    <option value="">선택하세요</option>
                    {classTypes.map((type, index) => {
                      const typeName = typeof type === 'string' ? type : type.name;
                      const typeKey = typeof type === 'string' ? type : `${type.name}-${index}`;
                      return (
                        <option key={typeKey} value={typeName}>
                          {typeName}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="form-field">
                  <label className="field-label">결제 방법</label>
                  <select
                    className="form-select"
                    value={newFeePaymentMethod}
                    onChange={(e) => setNewFeePaymentMethod(e.target.value)}
                    disabled={!isTuitionFeeEditMode}
                  >
                    <option value="">선택하세요</option>
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label className="field-label">금액</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="예: 100000 (원 단위로 입력)"
                      value={newFeeAmount}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setNewFeeAmount(value);
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFee();
                        }
                      }}
                      disabled={!isTuitionFeeEditMode}
                      readOnly={!isTuitionFeeEditMode}
                    />
                </div>
                {isTuitionFeeEditMode && (
                  <div className="form-field">
                    <button type="button" className="btn-add-fee" onClick={handleAddFee}>
                      추가
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">등록된 수강료 목록</label>
            {tuitionFees.length === 0 ? (
              <div className="empty-state">등록된 수강료가 없습니다.</div>
            ) : (
              <div className="fees-list">
                {tuitionFees.map((fee) => (
                  <div key={fee.id} className="fee-item">
                    {editingFeeId === fee.id ? (
                      <div className="fee-edit-form">
                        <div className="form-row">
                          <div className="form-field">
                            <label className="field-label">수업 유형</label>
                            <select
                              className="form-select"
                              value={editFeeClassType}
                              onChange={(e) => setEditFeeClassType(e.target.value)}
                            >
                              <option value="">선택하세요</option>
                              {classTypes.map((type, index) => {
                                const typeName = typeof type === 'string' ? type : type.name;
                                const typeKey = typeof type === 'string' ? type : `${type.name}-${index}`;
                                return (
                                  <option key={typeKey} value={typeName}>
                                    {typeName}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                          <div className="form-field">
                            <label className="field-label">결제 방법</label>
                            <select
                              className="form-select"
                              value={editFeePaymentMethod}
                              onChange={(e) => setEditFeePaymentMethod(e.target.value)}
                            >
                              <option value="">선택하세요</option>
                              {paymentMethods.map(method => (
                                <option key={method} value={method}>
                                  {method}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="form-field">
                            <label className="field-label">금액</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="예: 100000 (원)"
                              value={editFeeAmount}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                setEditFeeAmount(value);
                              }}
                            />
                          </div>
                          <div className="form-field">
                            <button
                              type="button"
                              className="btn-save-fee"
                              onClick={handleSaveEdit}
                            >
                              저장
                            </button>
                            <button
                              type="button"
                              className="btn-cancel-fee"
                              onClick={handleCancelEdit}
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="fee-info">
                          <span className="fee-class-type">{fee.class_type || '미설정'}</span>
                          <span className="fee-payment-method">{fee.payment_method || '미설정'}</span>
                          <span className="fee-amount">{fee.amount}</span>
                        </div>
                        {isTuitionFeeEditMode && (
                          <div className="fee-actions">
                            <button
                              type="button"
                              className="btn-edit-fee"
                              onClick={() => handleEditFee(fee)}
                            >
                              수정
                            </button>
                            <button
                              type="button"
                              className="btn-delete-fee"
                              onClick={() => handleDeleteFee(fee.id)}
                            >
                              삭제
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {isTuitionFeeEditMode && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e0e0e0' }}>
              <button 
                className="btn-save" 
                onClick={() => {
                  // 수강료 관리 섹션의 저장 (현재는 추가/수정/삭제가 즉시 반영되므로 확인만)
                  alert('수강료 관리가 완료되었습니다.');
                  setIsTuitionFeeEditMode(false);
                }}
                style={{ 
                  padding: '12px 24px', 
                  background: '#27ae60', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  fontSize: '1rem', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#229954'}
                onMouseOut={(e) => e.target.style.background = '#27ae60'}
              >
                저장 완료
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 비밀번호 변경 섹션 */}
      <PasswordChangeSection />
    </div>
  );
};

export default Settings;
