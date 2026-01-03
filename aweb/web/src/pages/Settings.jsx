import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subjectService } from '../services/subjectService';
import { classroomService } from '../services/classroomService';
import { timetableSettingsService } from '../services/timetableSettingsService';
import { tuitionFeeService } from '../services/tuitionFeeService';
import { useAuth } from '../contexts/AuthContext';
import { useAcademy } from '../contexts/AcademyContext';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { supabase } from '../config/supabase';
import { 
  FaUser, FaBuilding, FaClock, FaFileAlt, FaCheckCircle, 
  FaWonSign, FaCreditCard, FaLock, FaBell, FaGlobe, FaInfoCircle, 
  FaHeadset, FaCog, FaChevronRight, FaBook, FaClock as FaTimeClock
} from 'react-icons/fa';
import './Settings.css';

// 토글 스위치 컴포넌트
const ToggleSwitch = ({ checked, onChange, disabled = false }) => {
  return (
    <label className="toggle-switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="toggle-slider"></span>
    </label>
  );
};

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { academy, updateAcademy } = useAcademy();
  
  // 편집 모드 상태 (각 섹션별로 관리)
  const [isSubjectEditMode, setIsSubjectEditMode] = useState(false); // 과목 관리
  const [isTimetableEditMode, setIsTimetableEditMode] = useState(false); // 시간표 설정
  const [isTuitionFeeEditMode, setIsTuitionFeeEditMode] = useState(false); // 수강료 관리
  const [isPasswordEditMode, setIsPasswordEditMode] = useState(false); // 비밀번호 변경
  const [isAcademyEditMode, setIsAcademyEditMode] = useState(false); // 학원 설정
  
  // 계정 설정 상태
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(true);
  const [isEditingUserName, setIsEditingUserName] = useState(false);
  const [isEditingUserEmail, setIsEditingUserEmail] = useState(false);
  const [isEditingUserPhone, setIsEditingUserPhone] = useState(false);
  
  // 학원 설정 상태
  const [academyName, setAcademyName] = useState('');
  const [academyAddress, setAcademyAddress] = useState('');
  const [academyFloor, setAcademyFloor] = useState('');
  const [academyLogo, setAcademyLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [isLoadingAcademyInfo, setIsLoadingAcademyInfo] = useState(true);
  const [originalAcademyData, setOriginalAcademyData] = useState(null);
  
  // 이수 설정 상태
  const [completionCriteria, setCompletionCriteria] = useState(70);
  
  // 결제 방법 토글 상태
  const [paymentMethodToggles, setPaymentMethodToggles] = useState({
    cash: true,
    card: true,
    transfer: true,
    mobile: true
  });
  
  // 보안 설정 상태
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [passwordLastChanged, setPasswordLastChanged] = useState('2024년 11월 10일');
  
  // 알림 설정 상태
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [classNotifications, setClassNotifications] = useState(true);
  const [marketingNotifications, setMarketingNotifications] = useState(false);
  
  // 시스템 설정 상태
  const [language, setLanguage] = useState('한국어');
  const [timezone, setTimezone] = useState('서울 (GMT+9)');
  const [darkMode, setDarkMode] = useState(false);
  
  // 색상 옵션 정의 (이미지에 보이는 순서대로)
  const colorOptions = [
    { name: 'blue', label: '파랑', value: '#3498db' },
    { name: 'pink', label: '분홍', value: '#FFC0CB' },
    { name: 'red', label: '빨강', value: '#FF0000' },
    { name: 'orange', label: '주황', value: '#FF8C00' },
    { name: 'yellow', label: '노랑', value: '#FFD700' },
    { name: 'lightgreen', label: '연두', value: '#90EE90' },
    { name: 'green', label: '초록', value: '#008000' },
    { name: 'teal', label: '청록', value: '#008080' },
    { name: 'violet', label: '보라', value: '#8A2BE2' },
    { name: 'navy', label: '남색', value: '#000080' },
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
  // 관별 강의실 관리 구조: [{ id: 1, name: '1관', classrooms: ['강의실1'], classroomIds: [id1] }, ...]
  const [buildings, setBuildings] = useState([
    { id: 1, name: '1관', classrooms: [''], classroomIds: [null] }
  ]);
  const [availableClassrooms, setAvailableClassrooms] = useState([]); // DB에서 로드한 전체 강의실 목록

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

  // AcademyContext에서 학원 ID를 가져와서 selectedAcademy 초기화
  useEffect(() => {
    if (academy && academy.id) {
      console.log('✅ AcademyContext에서 학원 정보 로드:', {
        id: academy.id,
        name: academy.name,
        code: academy.code
      });
      setSelectedAcademy(academy.id);
    } else if (!academy && supabase) {
      // AcademyContext에 없으면 Supabase에서 직접 조회 시도
      console.log('⚠️ AcademyContext에 학원 정보가 없어 Supabase에서 로드 시도');
      const loadAcademyFromSupabase = async () => {
        try {
          const { data: academies, error } = await supabase
            .from('academies')
            .select('id')
            .limit(1);
          
          if (!error && academies && academies.length > 0) {
            console.log('✅ Supabase에서 학원 자동 선택:', academies[0].id);
            setSelectedAcademy(academies[0].id);
          } else {
            console.warn('⚠️ 등록된 학원이 없습니다.');
          }
        } catch (error) {
          console.error('❌ 학원 로드 실패:', error);
        }
      };
      loadAcademyFromSupabase();
    }
  }, [academy]);

  // selectedAcademy가 변경될 때마다 과목, 강의실, 시간표 설정, 수강료 로드
  useEffect(() => {
    if (selectedAcademy) {
      console.log('🔄 selectedAcademy 변경됨, 데이터 로드 시작:', selectedAcademy);
      loadSubjects();
      loadClassrooms();
      loadTimetableSettings();
      loadTuitionFees();
    }
  }, [selectedAcademy]);


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
        // 관별 강의실 로드
        try {
          const classroomsResponse = await classroomService.getAll(selectedAcademy);
          const allClassrooms = classroomsResponse.data.classrooms || [];
          
          console.log('📋 전체 강의실 목록:', allClassrooms.map(c => ({ id: c.id, name: c.name })));
          console.log('📋 설정 데이터:', {
            building_classrooms: settings.building_classrooms,
            building_names: settings.building_names,
            classroom_ids: settings.classroom_ids
          });
          
          let loadedBuildings = [];
          
          // building_classrooms가 있으면 관별 강의실 구조 사용
          if (settings.building_classrooms && typeof settings.building_classrooms === 'object') {
            const buildingNames = settings.building_names || [];
            const buildingNamesArray = Array.isArray(buildingNames) 
              ? buildingNames 
              : (buildingNames.building1 || buildingNames.building2 
                  ? [{ id: 1, name: buildingNames.building1 || '1관' }, ...(buildingNames.building2 ? [{ id: 2, name: buildingNames.building2 }] : [])]
                  : [{ id: 1, name: '1관' }]);
            
            console.log('📋 관 이름 배열:', buildingNamesArray);
            
            loadedBuildings = buildingNamesArray.map(building => {
              const classroomIds = settings.building_classrooms[building.id] || [];
              console.log(`📋 관 ${building.id} (${building.name})의 강의실 ID:`, classroomIds);
              
              const classrooms = classroomIds.map(id => {
                const found = allClassrooms.find(c => c.id === id);
                if (!found) {
                  console.warn(`⚠️ 강의실 ID ${id}를 찾을 수 없습니다.`);
                }
                return found ? found.name : '';
              }).filter(name => name);
              
              console.log(`📋 관 ${building.id} (${building.name})의 강의실 이름:`, classrooms);
              
              return {
                id: building.id,
                name: building.name,
                classrooms: classrooms.length > 0 ? classrooms : [''],
                classroomIds: classroomIds.length > 0 ? classroomIds : [null]
              };
            });
            
            // 모든 관의 강의실이 비어있거나 유효하지 않으면 초기화
            const hasValidClassrooms = loadedBuildings.some(b => 
              b.classrooms.some(c => c && c.trim()) || 
              b.classroomIds.some(id => id !== null)
            );
            
            if (!hasValidClassrooms) {
              console.log('⚠️ 저장된 강의실이 모두 비어있어 초기화합니다.');
              loadedBuildings = [
                { id: 1, name: '1관', classrooms: [''], classroomIds: [null] }
              ];
              // DB도 초기화
              try {
                await timetableSettingsService.save({
                  academy_id: selectedAcademy,
                  operating_days: settings.operating_days || [],
                  time_interval: settings.time_interval || '1시간',
                  day_time_settings: settings.day_time_settings || {},
                  timetable_name: settings.timetable_name || null,
                  classroom_ids: [],
                  building_names: [{ id: 1, name: '1관' }],
                  building_classrooms: { 1: [] }
                });
                console.log('✅ 강의실 설정 초기화 완료');
              } catch (initError) {
                console.warn('강의실 설정 초기화 실패:', initError);
              }
            }
          } 
          // 레거시: building_names와 classroom_ids만 있는 경우
          else if (settings.building_names && settings.classroom_ids) {
            const buildingNames = Array.isArray(settings.building_names) 
              ? settings.building_names 
              : (settings.building_names.building1 || settings.building_names.building2 
                  ? [{ id: 1, name: settings.building_names.building1 || '1관' }, ...(settings.building_names.building2 ? [{ id: 2, name: settings.building_names.building2 }] : [])]
                  : [{ id: 1, name: '1관' }]);
            
            const classroomIds = settings.classroom_ids || [];
            const classroomsPerBuilding = 6;
            
            loadedBuildings = buildingNames.map((building, index) => {
              const startIndex = index * classroomsPerBuilding;
              const endIndex = startIndex + classroomsPerBuilding;
              const buildingClassroomIds = classroomIds.slice(startIndex, endIndex);
              const buildingClassrooms = buildingClassroomIds.map(id => {
                const found = allClassrooms.find(c => c.id === id);
                return found ? found.name : '';
              }).filter(name => name);
              
              return {
                id: building.id,
                name: building.name,
                classrooms: buildingClassrooms.length > 0 ? buildingClassrooms : [''],
                classroomIds: buildingClassroomIds.length > 0 ? buildingClassroomIds : [null]
              };
            });
            
            // 모든 관의 강의실이 비어있거나 유효하지 않으면 초기화
            const hasValidClassrooms = loadedBuildings.some(b => 
              b.classrooms.some(c => c && c.trim()) || 
              b.classroomIds.some(id => id !== null)
            );
            
            if (!hasValidClassrooms) {
              console.log('⚠️ 저장된 강의실이 모두 비어있어 초기화합니다.');
              loadedBuildings = [
                { id: 1, name: '1관', classrooms: [''], classroomIds: [null] }
              ];
              // DB도 초기화
              try {
                await timetableSettingsService.save({
                  academy_id: selectedAcademy,
                  operating_days: settings.operating_days || [],
                  time_interval: settings.time_interval || '1시간',
                  day_time_settings: settings.day_time_settings || {},
                  timetable_name: settings.timetable_name || null,
                  classroom_ids: [],
                  building_names: [{ id: 1, name: '1관' }],
                  building_classrooms: { 1: [] }
                });
                console.log('✅ 강의실 설정 초기화 완료');
              } catch (initError) {
                console.warn('강의실 설정 초기화 실패:', initError);
              }
            }
          }
          // classroom_ids만 있고 building_classrooms가 없는 경우
          else if (settings.classroom_ids && Array.isArray(settings.classroom_ids) && settings.classroom_ids.length > 0) {
            console.log('📋 classroom_ids만 있는 경우 처리:', settings.classroom_ids);
            
            // classroom_ids로 강의실 찾기
            const foundClassrooms = settings.classroom_ids.map(id => {
              const found = allClassrooms.find(c => c.id === id);
              if (!found) {
                console.warn(`⚠️ 강의실 ID ${id}를 찾을 수 없습니다.`);
              }
              return found;
            }).filter(Boolean);
            
            console.log('📋 찾은 강의실:', foundClassrooms.map(c => ({ id: c.id, name: c.name })));
            
            if (foundClassrooms.length > 0) {
              // 기본 관 이름 사용
              const buildingName = settings.building_names && Array.isArray(settings.building_names) && settings.building_names.length > 0
                ? settings.building_names[0].name
                : (settings.building_names && settings.building_names.building1
                    ? settings.building_names.building1
                    : '1관');
              
              loadedBuildings = [{
                id: 1,
                name: buildingName,
                classrooms: foundClassrooms.map(c => c.name),
                classroomIds: foundClassrooms.map(c => c.id)
              }];
            } else {
              // 강의실을 찾지 못한 경우 기본값
              loadedBuildings = [
                { id: 1, name: '1관', classrooms: [''], classroomIds: [null] }
              ];
            }
          }
          // 기본값
          else {
            console.log('📋 기본값 사용 (설정이 없음)');
            loadedBuildings = [
              { id: 1, name: '1관', classrooms: [''], classroomIds: [null] }
            ];
          }
          
          if (loadedBuildings.length > 0) {
            setBuildings(loadedBuildings);
            console.log('✅ 관별 강의실 로드:', loadedBuildings);
          }
        } catch (classroomError) {
          console.warn('관별 강의실 로드 실패:', classroomError);
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
          // localStorage의 classroomIds와 classrooms는 buildings 구조로 마이그레이션되었으므로 무시
          // buildings는 위에서 이미 로드됨
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
          // localStorage의 classroomIds와 classrooms는 buildings 구조로 마이그레이션되었으므로 무시
          // buildings는 위에서 이미 로드됨
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
        // academy context에서 학원 ID 가져오기
        if (academy && academy.id) {
          academyId = academy.id;
          console.log('✅ academy context에서 학원 ID 가져옴:', academyId);
          shouldSetAcademy = true;
        } else if (supabase) {
          // Supabase에서 학원 목록 조회
          const { data: academies, error } = await supabase
            .from('academies')
            .select('id')
            .limit(1);
          
          if (!error && academies && academies.length > 0) {
            academyId = academies[0].id;
            console.log('✅ Supabase에서 학원 자동 선택:', academyId);
            shouldSetAcademy = true;
          } else {
            alert('등록된 학원이 없습니다. 먼저 학원을 등록해주세요.');
            return;
          }
        } else {
          alert('학원 정보를 불러올 수 없습니다.');
          console.error('❌ Supabase 클라이언트를 사용할 수 없습니다.');
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
      // buildings 구조는 loadTimetableSettings에서 처리하므로 여기서는 availableClassrooms만 업데이트
    } catch (error) {
      console.error('강의실 목록 로드 실패:', error);
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
        // academy context에서 학원 ID 가져오기
        if (academy && academy.id) {
          academyId = academy.id;
          console.log('✅ academy context에서 학원 ID 가져옴:', academyId);
          setSelectedAcademy(academyId);
        } else if (supabase) {
          // Supabase에서 학원 목록 조회
          const { data: academies, error } = await supabase
            .from('academies')
            .select('id')
            .limit(1);
          
          if (!error && academies && academies.length > 0) {
            academyId = academies[0].id;
            console.log('✅ Supabase에서 학원 자동 선택:', academyId);
            setSelectedAcademy(academyId);
          } else {
            alert('등록된 학원이 없습니다. 테스트를 위해 Supabase에 학원을 먼저 생성해주세요.');
            console.error('❌ 등록된 학원이 없습니다.');
            return;
          }
        } else {
          alert('학원 정보를 불러올 수 없습니다.');
          console.error('❌ Supabase 클라이언트를 사용할 수 없습니다.');
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
    
    // 요일 순서 정의 (월화수목금토일)
    const dayOrder = ['월', '화', '수', '목', '금', '토', '일'];
    
    setOperatingDays(prev => {
      const newDays = prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day];
      
      // 요일 순서대로 정렬
      return newDays.sort((a, b) => {
        const indexA = dayOrder.indexOf(a);
        const indexB = dayOrder.indexOf(b);
        return indexA - indexB;
      });
    });
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

  // 이전 버전의 handleClassroomChange, handleDeleteClassroom, handleAddClassroom 함수들은
  // buildings 구조로 변경되면서 handleBuildingClassroomChange, handleDeleteBuildingClassroom,
  // handleAddBuildingClassroom으로 대체되었습니다.

  const handleAddBuilding = () => {
    if (!isTimetableEditMode) return;
    const newId = buildings.length > 0 ? Math.max(...buildings.map(b => b.id)) + 1 : 1;
    setBuildings([...buildings, { id: newId, name: `${newId}관`, classrooms: [''], classroomIds: [null] }]);
  };

  const handleBuildingNameChange = (buildingIndex, value) => {
    if (!isTimetableEditMode) return;
    const updated = [...buildings];
    updated[buildingIndex] = { ...updated[buildingIndex], name: value };
    setBuildings(updated);
  };

  const handleDeleteBuilding = (buildingIndex) => {
    if (!isTimetableEditMode) return;
    if (buildings.length <= 1) {
      alert('최소 하나의 관은 유지해야 합니다.');
      return;
    }
    const updated = buildings.filter((_, i) => i !== buildingIndex);
    setBuildings(updated);
  };

  const handleBuildingClassroomChange = async (buildingIndex, classroomIndex, value) => {
    if (!isTimetableEditMode) return;
    const updated = [...buildings];
    const building = updated[buildingIndex];
    const newClassrooms = [...building.classrooms];
    const newClassroomIds = [...building.classroomIds];
    
    newClassrooms[classroomIndex] = value;
    
    // ID 기반 매칭: 이름으로 기존 강의실 찾기 (드롭다운에서 선택한 경우가 아닌 직접 입력한 경우)
    if (value.trim()) {
      const foundClassroom = availableClassrooms.find(c => c.name === value.trim());
      if (foundClassroom) {
        // 기존 강의실이 있으면 ID 저장
        newClassroomIds[classroomIndex] = foundClassroom.id;
        updated[buildingIndex] = { ...building, classrooms: newClassrooms, classroomIds: newClassroomIds };
        setBuildings(updated);
        console.log('✅ 강의실 선택 (ID 기반):', foundClassroom.id, foundClassroom.name);
      } else {
        // 새 강의실인 경우 ID는 null로 유지 (저장 시 생성)
        newClassroomIds[classroomIndex] = null;
        updated[buildingIndex] = { ...building, classrooms: newClassrooms, classroomIds: newClassroomIds };
        setBuildings(updated);
        console.log('📝 새 강의실 입력 (저장 시 생성됨):', value);
      }
    } else {
      newClassroomIds[classroomIndex] = null;
      updated[buildingIndex] = { ...building, classrooms: newClassrooms, classroomIds: newClassroomIds };
      setBuildings(updated);
    }
  };

  const handleAddBuildingClassroom = (buildingIndex) => {
    if (!isTimetableEditMode) return;
    const updated = [...buildings];
    const building = updated[buildingIndex];
    
    // 빈 강의실 입력 필드는 제외하고 실제 강의실 개수 확인 (ID가 있는 것만 카운트)
    const actualClassroomCount = building.classroomIds.filter(id => id !== null).length;
    
    if (actualClassroomCount >= 6) {
      alert('한 관당 최대 6개의 강의실만 추가할 수 있습니다.');
      return;
    }
    
    // 빈 선택 필드가 있으면 추가하지 않음 (드롭다운에서 선택하지 않은 경우)
    const hasUnselectedField = building.classrooms.some((c, idx) => {
      const id = building.classroomIds[idx];
      return !c || (!c.trim() && id === null);
    });
    if (hasUnselectedField) {
      alert('빈 강의실 선택 필드를 먼저 선택해주세요.');
      return;
    }
    
    // 새 드롭다운 필드 추가 (빈 값으로 시작)
    updated[buildingIndex] = {
      ...building,
      classrooms: [...building.classrooms, ''],
      classroomIds: [...building.classroomIds, null]
    };
    setBuildings(updated);
  };

  const handleDeleteBuildingClassroom = (buildingIndex, classroomIndex) => {
    if (!isTimetableEditMode) return;
    const updated = [...buildings];
    const building = updated[buildingIndex];
    
    const classroomIdToRemove = building.classroomIds[classroomIndex];
    const classroomName = building.classrooms[classroomIndex];
    
    // 확인 메시지
    if (classroomIdToRemove && classroomName && classroomName.trim()) {
      const confirmMessage = `"${classroomName}" 강의실을 삭제하시겠습니까?\n\n이 강의실을 사용하는 수업이 있다면 시간표에서 표시되지 않을 수 있습니다.`;
      if (!window.confirm(confirmMessage)) {
        return;
      }
    } else if (classroomName && classroomName.trim()) {
      if (!window.confirm(`"${classroomName}" 강의실 입력을 삭제하시겠습니까?`)) {
        return;
      }
    }
    
    const newClassrooms = building.classrooms.filter((_, i) => i !== classroomIndex);
    const newClassroomIds = building.classroomIds.filter((_, i) => i !== classroomIndex);
    
    // 모든 강의실이 삭제되면 최소 하나의 빈 입력창은 유지
    if (newClassrooms.length === 0) {
      updated[buildingIndex] = {
        ...building,
        classrooms: [''],
        classroomIds: [null]
      };
    } else {
      updated[buildingIndex] = {
        ...building,
        classrooms: newClassrooms,
        classroomIds: newClassroomIds
      };
    }
    setBuildings(updated);
  };

  const handleSaveTimetable = async () => {
    // selectedAcademy가 없으면 자동으로 학원 로드 시도
    let academyId = selectedAcademy;
    if (!academyId) {
      console.log('⚠️ selectedAcademy가 없습니다. 학원 목록을 로드합니다...');
      try {
        // academy context에서 학원 ID 가져오기
        if (academy && academy.id) {
          academyId = academy.id;
          console.log('✅ academy context에서 학원 ID 가져옴:', academyId);
          setSelectedAcademy(academyId);
        } else if (supabase) {
          // Supabase에서 학원 목록 조회
          const { data: academies, error } = await supabase
            .from('academies')
            .select('id')
            .limit(1);
          
          if (!error && academies && academies.length > 0) {
            academyId = academies[0].id;
            console.log('✅ Supabase에서 학원 자동 선택:', academyId);
            setSelectedAcademy(academyId);
          } else {
            alert('등록된 학원이 없습니다. 먼저 학원을 등록해주세요.');
            console.error('❌ 등록된 학원이 없습니다.');
            return;
          }
        } else {
          alert('학원 정보를 불러올 수 없습니다.');
          console.error('❌ Supabase 클라이언트를 사용할 수 없습니다.');
          return;
        }
      } catch (error) {
        console.error('❌ 학원 목록 로드 실패:', error);
        alert('학원 정보를 불러올 수 없습니다. 네트워크 연결을 확인해주세요.');
        return;
      }
    }

    try {
      // 관별 강의실 저장 및 ID 수집을 위한 초기화
      const processedBuildings = [];
      const allClassroomIds = [];
      
      // 먼저 모든 강의실 목록 가져오기
      const allClassroomsResponse = await classroomService.getAll(academyId);
      const allClassrooms = allClassroomsResponse.data.classrooms || [];
      
      console.log('📝 저장할 관별 강의실:', buildings);
      
      // 각 관에 대해 처리 (ID 기반으로만 처리)
      for (let buildingIndex = 0; buildingIndex < buildings.length; buildingIndex++) {
        const building = buildings[buildingIndex];
        const validClassroomIds = [];
        
        // 해당 관의 각 강의실에 대해 처리 (ID만 사용)
        for (let i = 0; i < building.classroomIds.length; i++) {
          const classroomId = building.classroomIds[i];
          
          // ID가 없으면 건너뛰기
          if (!classroomId) continue;
          
          console.log(`🔍 강의실 처리 중 [관${building.id}][${i}]:`, { classroomId });
          
          // ID로 강의실 찾기
          let foundClassroom = allClassrooms.find(c => c.id === classroomId);
          
          // ID가 있지만 DB에 없는 경우 (새로 생성된 강의실이거나 삭제된 경우)
          if (!foundClassroom) {
            const name = building.classrooms[i]?.trim();
            if (name) {
              // 새 강의실 생성 시도
              try {
                console.log(`📝 강의실 생성 시도: ${name} (ID: ${classroomId})`);
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
                  
                  // buildings 상태 업데이트 (생성된 ID로 교체)
                  const updatedBuildings = [...buildings];
                  const updatedIds = [...building.classroomIds];
                  updatedIds[i] = foundClassroom.id;
                  updatedBuildings[buildingIndex] = {
                    ...building,
                    classroomIds: updatedIds
                  };
                  setBuildings(updatedBuildings);
                }
              } catch (classroomError) {
                console.warn(`⚠️ 강의실 생성 실패: ${name}`, classroomError);
                // 생성 실패 시 해당 항목 건너뛰기
                continue;
              }
            } else {
              // 이름도 없으면 건너뛰기
              console.warn(`⚠️ 강의실 ID는 있지만 이름이 없습니다: ${classroomId}`);
              continue;
            }
          }
          
          if (foundClassroom && foundClassroom.id) {
            // UUID 형식 검증
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(foundClassroom.id)) {
              console.error(`❌ 잘못된 강의실 ID 형식: ${foundClassroom.id}`);
              continue; // 잘못된 ID는 건너뛰기
            }
            
            validClassroomIds.push(foundClassroom.id);
            allClassroomIds.push(foundClassroom.id);
            
            console.log('✅ 강의실 ID 저장:', foundClassroom.id, foundClassroom.name);
          } else {
            console.warn(`⚠️ 강의실을 찾거나 생성할 수 없습니다: ${classroomId}`);
          }
        }
        
        // 관별 강의실 정보 저장 (ID만 저장)
        processedBuildings.push({
          id: building.id,
          name: building.name,
          classroomIds: validClassroomIds
        });
        
        console.log(`✅ 관 ${building.id} (${building.name}) 강의실 처리 완료:`, {
          IDs: validClassroomIds,
          count: validClassroomIds.length
        });
      }
      
      console.log('✅ 최종 저장할 관별 강의실:', processedBuildings);
      console.log('✅ 전체 강의실 ID 목록:', allClassroomIds);

      // 모든 관의 강의실이 비어있으면 초기화 상태로 저장
      const hasAnyClassrooms = processedBuildings.some(b => 
        b.classroomIds && b.classroomIds.length > 0 && b.classroomIds.some(id => id !== null)
      );
      
      
      // 기존 설정에서 제거된 강의실 확인 (기존 수업과의 충돌 방지)
      try {
        const existingSettings = await timetableSettingsService.get(academyId);
        if (existingSettings.settings && existingSettings.settings.classroom_ids) {
          const oldClassroomIds = existingSettings.settings.classroom_ids;
          const removedClassroomIds = oldClassroomIds.filter(id => !allClassroomIds.includes(id));
          
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
        classroomIds: allClassroomIds,
        classroomsCount: allClassroomIds.length
      });
      
      const response = await timetableSettingsService.save({
        academy_id: academyId,
        operating_days: operatingDays,
        time_interval: timeInterval,
        day_time_settings: dayTimeSettings,
        timetable_name: timetableName || null,
        classroom_ids: allClassroomIds,
        building_names: processedBuildings.map(b => ({ id: b.id, name: b.name })),
        building_classrooms: processedBuildings.reduce((acc, b) => {
          acc[b.id] = b.classroomIds;
          return acc;
        }, {})
      });

      console.log('✅ 시간표 설정 저장 성공:', response);

      // ---- 프론트 상태를 사용자가 입력한 값으로 즉시 동기화 ----
      // DB까지 저장이 성공했으므로, 지금 화면의 관별 강의실 입력칸에는
      // 방금 저장한 강의실 이름/ID를 그대로 보여주도록 고정한다.
      const updatedBuildings = processedBuildings.map(b => ({
        id: b.id,
        name: b.name,
        classrooms: b.classrooms.length > 0 ? b.classrooms : [''],
        classroomIds: b.classroomIds.length > 0 ? b.classroomIds : [null]
      }));
      setBuildings(updatedBuildings);
      // 저장 직후에는 시간표/강의실 섹션을 읽기 전용 모드로 전환
      setIsTimetableEditMode(false);
      
      // 새로 생성된 강의실이 드롭다운에 나타나도록 강의실 목록 다시 로드
      await loadClassrooms();

      // localStorage에도 저장 (마이그레이션 지원) - ID만 저장
      try {
        const localSettings = {
          timeInterval,
          operatingDays,
          dayTimeSettings,
          timetableName,
          classroomIds: allClassroomIds,
        };
        localStorage.setItem('timetableSettings', JSON.stringify(localSettings));
        console.log('✅ localStorage에도 저장 완료 (ID만 저장)');
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
        console.log('📋 저장 시도한 강의실 ID:', allClassroomIds);
        
        // 저장된 ID로 실제 강의실 찾기
        const actualClassrooms = savedClassroomIds
          .map(id => refreshedList.find(c => c.id === id))
          .filter(Boolean);
        
        console.log('✅ 실제 DB에서 찾은 강의실:', actualClassrooms.map(c => ({ id: c.id, name: c.name })));
        
        // buildings 구조는 이미 위에서 업데이트했으므로 여기서는 로그만 출력
        console.log('✅ 강의실 상태 업데이트 완료:', {
          buildings: updatedBuildings,
          개수: allClassroomIds.length
        });
        
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

  // 사용자 정보 로드 (Supabase users 테이블에서 최신 정보 가져오기)
  useEffect(() => {
    const loadUserInfo = async () => {
      setIsLoadingUserInfo(true);
      
      // user가 없으면 기본값 설정
      if (!user) {
        setUserName('플라이 관리자');
        setUserEmail('');
        setUserPhone('');
        setIsLoadingUserInfo(false);
        return;
      }

      // user.id가 있으면 Supabase에서 직접 조회
      if (user.id) {
        try {
          console.log('📖 사용자 정보 로드 시작:', user.id);
          
          if (!supabase) {
            console.warn('Supabase 클라이언트를 사용할 수 없습니다. 로컬 정보 사용');
            setUserName(user.name || '플라이 관리자');
            setUserEmail(user.email || '');
            setUserPhone(user.phone || '');
            setIsLoadingUserInfo(false);
            return;
          }

          // Supabase에서 직접 조회
          const { data: userData, error } = await supabase
            .from('users')
            .select('id, name, email, phone, academy_code')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('사용자 정보 로드 실패:', error);
            // 에러 발생 시 로컬 user 정보 사용
            setUserName(user.name || '플라이 관리자');
            setUserEmail(user.email || '');
            setUserPhone(user.phone || '');
          } else if (userData) {
            console.log('✅ 사용자 정보 로드 성공:', userData);
            setUserName(userData.name || '플라이 관리자');
            setUserEmail(userData.email || '');
            setUserPhone(userData.phone || '');
            console.log('사용자 정보 설정 완료:', {
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              academy_code: userData.academy_code
            });
          } else {
            // 데이터가 없으면 로컬 user 정보 사용
            console.warn('DB에 사용자 정보가 없음, 로컬 정보 사용');
            setUserName(user.name || '플라이 관리자');
            setUserEmail(user.email || '');
            setUserPhone(user.phone || '');
          }
        } catch (error) {
          console.error('사용자 정보 로드 실패:', error);
          // 에러 발생 시 로컬 user 정보 사용
          setUserName(user.name || '플라이 관리자');
          setUserEmail(user.email || '');
          setUserPhone(user.phone || '');
        }
      } else {
        // user.id가 없는 경우 로컬 정보만 사용
        console.warn('user.id가 없음, 로컬 정보 사용');
        setUserName(user.name || '플라이 관리자');
        setUserEmail(user.email || '');
        setUserPhone(user.phone || '');
      }
      
      setIsLoadingUserInfo(false);
    };

    loadUserInfo();
  }, [user]);

  // 사용자 정보 업데이트 함수 (Supabase 직접 사용)
  const updateUserInfo = async (field, value) => {
    if (!user || !user.id) {
      alert('사용자 정보를 불러올 수 없습니다.');
      return;
    }

    if (!supabase) {
      alert('Supabase 클라이언트를 사용할 수 없습니다.');
      return;
    }

    try {
      console.log('📝 사용자 정보 업데이트 시도:', { userId: user.id, field, value });
      
      const updateData = { [field]: value };
      
      // Supabase에서 직접 업데이트
      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);

      if (updateError) {
        console.error('사용자 정보 업데이트 실패:', updateError);
        throw new Error(updateError.message || '정보 업데이트에 실패했습니다.');
      }

      // 업데이트 성공 후 별도로 업데이트된 데이터 조회
      const { data: updatedUser, error: selectError } = await supabase
        .from('users')
        .select('id, name, email, phone, academy_code, academy_id, role')
        .eq('id', user.id)
        .single();

      if (selectError) {
        console.error('업데이트된 사용자 정보 조회 실패:', selectError);
        // 업데이트는 성공했지만 조회에 실패한 경우, 로컬 상태만 업데이트
        console.log('⚠️ 업데이트는 성공했지만 조회에 실패했습니다. 로컬 상태만 업데이트합니다.');
        
        // 로컬 스토리지 업데이트 (부분 업데이트)
        const updatedUserData = { ...user, [field]: value };
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        
        // 상태 업데이트
        if (field === 'name') {
          setUserName(value);
        } else if (field === 'email') {
          setUserEmail(value);
        } else if (field === 'phone') {
          setUserPhone(value);
        }
        
        alert('정보가 성공적으로 업데이트되었습니다.');
        return;
      }

      if (updatedUser) {
        console.log('✅ 사용자 정보 업데이트 성공:', updatedUser);
        
        // 로컬 스토리지 업데이트
        const updatedUserData = { ...user, ...updatedUser };
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        
        // 상태 업데이트
        if (field === 'name') {
          setUserName(value);
        } else if (field === 'email') {
          setUserEmail(value);
        } else if (field === 'phone') {
          setUserPhone(value);
        }
        
        alert('정보가 성공적으로 업데이트되었습니다.');
      } else {
        // 업데이트는 성공했지만 조회 결과가 없는 경우, 로컬 상태만 업데이트
        console.log('⚠️ 업데이트는 성공했지만 조회 결과가 없습니다. 로컬 상태만 업데이트합니다.');
        
        const updatedUserData = { ...user, [field]: value };
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        
        if (field === 'name') {
          setUserName(value);
        } else if (field === 'email') {
          setUserEmail(value);
        } else if (field === 'phone') {
          setUserPhone(value);
        }
        
        alert('정보가 성공적으로 업데이트되었습니다.');
      }
    } catch (error) {
      console.error('사용자 정보 업데이트 실패:', error);
      const errorMessage = error.message || '정보 업데이트에 실패했습니다.';
      alert(`업데이트 실패: ${errorMessage}`);
    }
  };

  // 학원 정보 로드 및 Supabase Realtime 연동
  useEffect(() => {
    if (!academy || !academy.id) {
      setIsLoadingAcademyInfo(false);
      return;
    }

    if (!supabase) {
      console.error('Supabase 클라이언트를 사용할 수 없습니다.');
      setIsLoadingAcademyInfo(false);
      return;
    }

    let subscription = null;

    const loadAcademyInfo = async () => {
      setIsLoadingAcademyInfo(true);

      try {
        // Supabase에서 학원 정보 직접 조회
        const { data: academyData, error } = await supabase
          .from('academies')
          .select('id, name, address, floor, logo_url')
          .eq('id', academy.id)
          .single();

        if (error) {
          console.error('학원 정보 로드 실패:', error);
          // 에러 발생 시 academy context의 정보 사용
          const loadedData = {
            name: academy.name || '',
            address: academy.address || '',
            floor: academy.floor || '',
            logo_url: academy.logo_url || ''
          };
          setAcademyName(loadedData.name);
          setAcademyAddress(loadedData.address);
          setAcademyFloor(loadedData.floor);
          setLogoPreview(loadedData.logo_url || '');
          setOriginalAcademyData(loadedData);
        } else if (academyData) {
          const loadedData = {
            name: academyData.name || '',
            address: academyData.address || '',
            floor: academyData.floor || '',
            logo_url: academyData.logo_url || ''
          };
          console.log('✅ 학원 정보 로드 성공 (Supabase):', loadedData);
          setAcademyName(loadedData.name);
          setAcademyAddress(loadedData.address);
          setAcademyFloor(loadedData.floor);
          setLogoPreview(loadedData.logo_url || '');
          setOriginalAcademyData(loadedData);
        } else {
          // 데이터가 없으면 academy context의 정보 사용
          const loadedData = {
            name: academy.name || '',
            address: academy.address || '',
            floor: academy.floor || '',
            logo_url: academy.logo_url || ''
          };
          setAcademyName(loadedData.name);
          setAcademyAddress(loadedData.address);
          setAcademyFloor(loadedData.floor);
          setLogoPreview(loadedData.logo_url || '');
          setOriginalAcademyData(loadedData);
        }
      } catch (error) {
        console.error('학원 정보 로드 실패:', error);
        // 에러 발생 시 academy context의 정보 사용
        const loadedData = {
          name: academy.name || '',
          address: academy.address || '',
          floor: academy.floor || '',
          logo_url: academy.logo_url || ''
        };
        setAcademyName(loadedData.name);
        setAcademyAddress(loadedData.address);
        setAcademyFloor(loadedData.floor);
        setLogoPreview(loadedData.logo_url || '');
        setOriginalAcademyData(loadedData);
      } finally {
        setIsLoadingAcademyInfo(false);
      }
    };

    // 초기 로드
    loadAcademyInfo();

    // Supabase Realtime 구독 설정 (academies 테이블 변경사항 실시간 감지)
    subscription = supabase
      .channel(`academy-${academy.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE 모두 감지
          schema: 'public',
          table: 'academies',
          filter: `id=eq.${academy.id}`
        },
        (payload) => {
          console.log('🔄 학원 정보 변경 감지 (Realtime):', payload);
          
          if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedData = payload.new;
            const loadedData = {
              name: updatedData.name || '',
              address: updatedData.address || '',
              floor: updatedData.floor || '',
              logo_url: updatedData.logo_url || ''
            };
            
            console.log('✅ 학원 정보 실시간 업데이트:', loadedData);
            
            // 상태 업데이트 (편집 모드가 아닐 때만 자동 업데이트)
            if (!isAcademyEditMode) {
              setAcademyName(loadedData.name);
              setAcademyAddress(loadedData.address);
              setAcademyFloor(loadedData.floor);
              setLogoPreview(loadedData.logo_url || '');
            }
            
            // 원본 데이터는 항상 업데이트
            setOriginalAcademyData(loadedData);
            
            // AcademyContext도 업데이트
            updateAcademy({
              ...academy,
              ...loadedData
            });
          } else if (payload.eventType === 'DELETE') {
            console.warn('⚠️ 학원 정보가 삭제되었습니다.');
            // 삭제된 경우 기본값으로 설정
            setAcademyName('');
            setAcademyAddress('');
            setAcademyFloor('');
            setLogoPreview('');
            setOriginalAcademyData(null);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ 학원 정보 Realtime 구독 성공');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ 학원 정보 Realtime 구독 실패');
        }
      });

    // cleanup 함수: 컴포넌트 언마운트 시 구독 해제
    return () => {
      if (subscription) {
        console.log('🔌 학원 정보 Realtime 구독 해제');
        supabase.removeChannel(subscription);
      }
    };
  }, [academy?.id, supabase, isAcademyEditMode, updateAcademy]);

  // 학원 로고 업로드 핸들러
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 파일 크기 검증 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        return;
      }
      
      // 이미지 파일 검증
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }

      setAcademyLogo(file);
      
      // 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleLogoDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }

      setAcademyLogo(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 학원 정보 저장 (Supabase에 직접 저장)
  const handleSaveAcademy = async () => {
    if (!academy || !academy.id) {
      alert('학원 정보를 불러올 수 없습니다.');
      return;
    }

    if (!academyName.trim()) {
      alert('학원명을 입력해주세요.');
      return;
    }

    if (!supabase) {
      alert('Supabase 클라이언트를 사용할 수 없습니다.');
      return;
    }

    try {
      let logoUrl = logoPreview;
      
      // 새 로고 파일이 선택된 경우 (base64 데이터 URL인 경우) Supabase Storage에 업로드
      if (academyLogo && logoPreview && logoPreview.startsWith('data:')) {
        try {
          // 파일 확장자 추출
          const fileExt = academyLogo.name.split('.').pop() || 'png';
          const fileName = `academy-${academy.id}-${Date.now()}.${fileExt}`;
          const filePath = `academy-logos/${fileName}`;

          // Supabase Storage에 파일 업로드
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('academy-logos')
            .upload(filePath, academyLogo, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('로고 업로드 실패:', uploadError);
            // Storage 버킷이 없거나 권한 문제인 경우, 기존 로고 URL 유지
            if (uploadError.message?.includes('Bucket') || uploadError.message?.includes('bucket')) {
              console.warn('Storage 버킷이 없거나 접근할 수 없습니다. 기존 로고 URL을 유지합니다.');
              logoUrl = originalAcademyData?.logo_url || null;
            } else {
              // 다른 에러인 경우 기존 로고 URL 유지
              logoUrl = originalAcademyData?.logo_url || null;
            }
          } else {
            // 업로드 성공 시 Public URL 가져오기
            const { data: urlData } = supabase.storage
              .from('academy-logos')
              .getPublicUrl(filePath);
            
            if (urlData?.publicUrl) {
              logoUrl = urlData.publicUrl;
            } else {
              // Public URL을 가져올 수 없으면 기존 로고 URL 유지
              logoUrl = originalAcademyData?.logo_url || null;
            }
          }
        } catch (uploadErr) {
          console.error('로고 업로드 중 오류:', uploadErr);
          // 업로드 실패 시 기존 로고 URL 유지
          logoUrl = originalAcademyData?.logo_url || null;
        }
      } else if (logoPreview && !logoPreview.startsWith('data:')) {
        // 기존 URL인 경우 그대로 사용
        logoUrl = logoPreview;
      } else if (!logoPreview || logoPreview === '') {
        // 로고가 삭제된 경우 null로 설정
        logoUrl = null;
      }

      // Supabase에 학원 정보 업데이트
      const updateData = {
        name: academyName.trim(),
        address: academyAddress.trim() || null,
        floor: academyFloor.trim() || null,
        logo_url: logoUrl || null
      };

      console.log('📝 학원 정보 업데이트 시도:', {
        academyId: academy.id,
        updateData
      });

      // Supabase에서 학원 정보 업데이트
      const { error: updateError } = await supabase
        .from('academies')
        .update(updateData)
        .eq('id', academy.id);

      if (updateError) {
        console.error('❌ 학원 정보 업데이트 실패:', updateError);
        console.error('에러 상세:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        });
        throw new Error(updateError.message || '학원 정보 저장에 실패했습니다.');
      }

      // 업데이트 성공 후 별도로 업데이트된 데이터 조회
      const { data: updatedAcademy, error: selectError } = await supabase
        .from('academies')
        .select('id, name, address, floor, logo_url')
        .eq('id', academy.id)
        .single();

      if (selectError) {
        console.error('업데이트된 학원 정보 조회 실패:', selectError);
        // 업데이트는 성공했지만 조회에 실패한 경우, 업데이트한 데이터로 로컬 상태만 업데이트
        console.log('⚠️ 업데이트는 성공했지만 조회에 실패했습니다. 업데이트한 데이터로 로컬 상태를 업데이트합니다.');
        
        const savedData = {
          name: updateData.name || '',
          address: updateData.address || '',
          floor: updateData.floor || '',
          logo_url: updateData.logo_url || ''
        };
        
        // AcademyContext 업데이트
        updateAcademy({
          ...academy,
          ...savedData
        });
        
        // 원본 데이터 업데이트
        setOriginalAcademyData(savedData);
        
        // 상태 업데이트
        setAcademyName(savedData.name);
        setAcademyAddress(savedData.address);
        setAcademyFloor(savedData.floor);
        setLogoPreview(savedData.logo_url);
        
        // 업로드된 파일 초기화
        setAcademyLogo(null);
        
        alert('학원 정보가 성공적으로 저장되었습니다.');
        setIsAcademyEditMode(false);
        return;
      }

      if (updatedAcademy) {
        console.log('✅ 학원 정보 업데이트 성공:', updatedAcademy);
        
        // AcademyContext 업데이트
        updateAcademy({
          ...academy,
          ...updatedAcademy
        });
        
        // 원본 데이터 업데이트
        const savedData = {
          name: updatedAcademy.name || '',
          address: updatedAcademy.address || '',
          floor: updatedAcademy.floor || '',
          logo_url: updatedAcademy.logo_url || ''
        };
        setOriginalAcademyData(savedData);
        
        // 상태 업데이트
        setAcademyName(savedData.name);
        setAcademyAddress(savedData.address);
        setAcademyFloor(savedData.floor);
        setLogoPreview(savedData.logo_url);
        
        // 업로드된 파일 초기화
        setAcademyLogo(null);
        
        alert('학원 정보가 성공적으로 저장되었습니다.');
        setIsAcademyEditMode(false);
      } else {
        // 업데이트는 성공했지만 조회 결과가 없는 경우, 업데이트한 데이터로 로컬 상태만 업데이트
        console.log('⚠️ 업데이트는 성공했지만 조회 결과가 없습니다. 업데이트한 데이터로 로컬 상태를 업데이트합니다.');
        
        const savedData = {
          name: updateData.name || '',
          address: updateData.address || '',
          floor: updateData.floor || '',
          logo_url: updateData.logo_url || ''
        };
        
        // AcademyContext 업데이트
        updateAcademy({
          ...academy,
          ...savedData
        });
        
        // 원본 데이터 업데이트
        setOriginalAcademyData(savedData);
        
        // 상태 업데이트
        setAcademyName(savedData.name);
        setAcademyAddress(savedData.address);
        setAcademyFloor(savedData.floor);
        setLogoPreview(savedData.logo_url);
        
        // 업로드된 파일 초기화
        setAcademyLogo(null);
        
        alert('학원 정보가 성공적으로 저장되었습니다.');
        setIsAcademyEditMode(false);
      }
    } catch (error) {
      console.error('학원 정보 저장 실패:', error);
      const errorMessage = error.message || '학원 정보 저장에 실패했습니다.';
      alert(`저장 실패: ${errorMessage}`);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className="settings-header-content">
          <FaCog className="settings-header-icon" />
          <div>
            <h1 className="page-title">설정</h1>
            <p className="page-subtitle">계정 및 시스템 설정을 관리합니다</p>
          </div>
        </div>
      </div>

      {/* 계정 설정 섹션 */}
      <div className="settings-section">
        <div className="section-header-with-icon">
          <FaUser className="section-icon" />
          <h2 className="section-title">계정 설정</h2>
        </div>
        
        <div className="settings-item">
          <div className="settings-item-content">
            <span className="settings-item-label">사용자 이름</span>
            <span className="settings-item-value">
              {isLoadingUserInfo ? '로딩 중...' : (userName || '플라이 관리자')}
            </span>
          </div>
          <button 
            className="btn-modify"
            disabled={isLoadingUserInfo}
            onClick={async () => {
              const newName = prompt('사용자 이름을 입력하세요:', userName || '플라이 관리자');
              if (newName && newName.trim() && newName.trim() !== userName) {
                await updateUserInfo('name', newName.trim());
              }
            }}
          >
            수정
          </button>
        </div>
        
        <div className="settings-item">
          <div className="settings-item-content">
            <span className="settings-item-label">이메일</span>
            <span className="settings-item-value">
              {isLoadingUserInfo ? '로딩 중...' : (userEmail || '이메일이 없습니다')}
            </span>
          </div>
          <button 
            className="btn-modify"
            disabled={isLoadingUserInfo}
            onClick={async () => {
              const newEmail = prompt('이메일을 입력하세요:', userEmail || '');
              if (newEmail && newEmail.trim() && newEmail.trim() !== userEmail) {
                // 이메일 형식 검증
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(newEmail.trim())) {
                  alert('올바른 이메일 형식을 입력해주세요.');
                  return;
                }
                await updateUserInfo('email', newEmail.trim());
              }
            }}
          >
            변경
          </button>
        </div>
        
        <div className="settings-item">
          <div className="settings-item-content">
            <span className="settings-item-label">전화번호</span>
            <span className="settings-item-value">
              {isLoadingUserInfo ? '로딩 중...' : (userPhone || '전화번호가 없습니다')}
            </span>
          </div>
          <button 
            className="btn-modify"
            disabled={isLoadingUserInfo}
            onClick={async () => {
              const newPhone = prompt('전화번호를 입력하세요:', userPhone || '');
              if (newPhone && newPhone.trim() && newPhone.trim() !== userPhone) {
                await updateUserInfo('phone', newPhone.trim());
              }
            }}
          >
            변경
          </button>
        </div>
        
        <div className="settings-item">
          <div className="settings-item-content">
            <span className="settings-item-label">학원 코드</span>
            <span className="settings-item-value">
              {isLoadingUserInfo ? '로딩 중...' : (user?.academy_code || '학원 코드가 없습니다')}
            </span>
          </div>
          <span className="settings-item-readonly">수정 불가</span>
        </div>
      </div>

      {/* 학원 설정 섹션 */}
      <div className="settings-section">
        <div className="section-header-with-icon">
          <FaBook className="section-icon" />
          <h2 className="section-title">학원 설정</h2>
        </div>
        
        {!isAcademyEditMode ? (
          <>
            <div className="settings-item">
              <div className="settings-item-content">
                <span className="settings-item-label">학원명</span>
                <span className="settings-item-value">
                  {isLoadingAcademyInfo ? '로딩 중...' : (academyName || '학원명이 없습니다')}
                </span>
              </div>
              <button 
                className="btn-modify"
                disabled={isLoadingAcademyInfo}
                onClick={() => setIsAcademyEditMode(true)}
              >
                수정
              </button>
            </div>
            
            <div className="settings-item">
              <div className="settings-item-content">
                <span className="settings-item-label">학원 로고</span>
                <span className="settings-item-value">
                  {isLoadingAcademyInfo ? '로딩 중...' : (logoPreview ? '로고가 설정되어 있습니다' : '로고가 없습니다')}
                </span>
              </div>
              <button 
                className="btn-modify"
                disabled={isLoadingAcademyInfo}
                onClick={() => setIsAcademyEditMode(true)}
              >
                수정
              </button>
            </div>
            
            <div className="settings-item">
              <div className="settings-item-content">
                <span className="settings-item-label">학원 주소</span>
                <span className="settings-item-value">
                  {isLoadingAcademyInfo ? '로딩 중...' : (academyAddress || '주소가 없습니다')}
                </span>
              </div>
              <button 
                className="btn-modify"
                disabled={isLoadingAcademyInfo}
                onClick={() => setIsAcademyEditMode(true)}
              >
                수정
              </button>
            </div>
            
            <div className="settings-item">
              <div className="settings-item-content">
                <span className="settings-item-label">학원 층수</span>
                <span className="settings-item-value">
                  {isLoadingAcademyInfo ? '로딩 중...' : (academyFloor || '층수가 없습니다')}
                </span>
              </div>
              <button 
                className="btn-modify"
                disabled={isLoadingAcademyInfo}
                onClick={() => setIsAcademyEditMode(true)}
              >
                수정
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="settings-item">
              <div className="settings-item-content">
                <span className="settings-item-label">학원명</span>
                <input
                  type="text"
                  className="settings-input"
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                  placeholder="학원명을 입력하세요"
                />
              </div>
            </div>
            
            <div className="settings-item">
              <div className="settings-item-content">
                <span className="settings-item-label">학원 로고</span>
                <div className="logo-upload-area">
                  <div
                    className="logo-drop-zone"
                    onDrop={handleLogoDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => document.getElementById('logo-upload-input').click()}
                  >
                    {logoPreview ? (
                      <img src={logoPreview} alt="학원 로고" className="logo-preview" />
                    ) : (
                      <div className="logo-upload-placeholder">
                        <p>파일을 이곳에 업로드하세요</p>
                        <p className="logo-upload-hint">클릭하거나 드래그하여 파일을 업로드하세요</p>
                      </div>
                    )}
                  </div>
                  <input
                    id="logo-upload-input"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
            </div>
            
            <div className="settings-item">
              <div className="settings-item-content">
                <span className="settings-item-label">학원 주소</span>
                <input
                  type="text"
                  className="settings-input"
                  value={academyAddress}
                  onChange={(e) => setAcademyAddress(e.target.value)}
                  placeholder="학원 주소를 입력하세요"
                />
              </div>
            </div>
            
            <div className="settings-item">
              <div className="settings-item-content">
                <span className="settings-item-label">학원 층수</span>
                <input
                  type="text"
                  className="settings-input"
                  value={academyFloor}
                  onChange={(e) => setAcademyFloor(e.target.value)}
                  placeholder="학원 층수를 입력하세요 (예: 2층, 지하1층)"
                />
              </div>
            </div>
            
            <div className="settings-actions">
              <button 
                className="btn-cancel"
                onClick={() => {
                  setIsAcademyEditMode(false);
                  // 편집 모드 취소 시 원래 값으로 복원
                  if (originalAcademyData) {
                    setAcademyName(originalAcademyData.name);
                    setAcademyAddress(originalAcademyData.address);
                    setAcademyFloor(originalAcademyData.floor);
                    setLogoPreview(originalAcademyData.logo_url);
                    setAcademyLogo(null);
                  }
                }}
              >
                취소
              </button>
              <button 
                className="btn-save"
                onClick={handleSaveAcademy}
                disabled={isLoadingAcademyInfo}
              >
                설정 저장
              </button>
            </div>
          </>
        )}
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
          {!isTimetableEditMode && (
            <button
              type="button"
              className="btn-edit"
              onClick={() => setIsTimetableEditMode(true)}
            >
              수정하기
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

          {/* 관별 강의실 설정 */}
          <div className="form-group">
            <label className="form-label">강의실 설정</label>
            <p className="form-description" style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>
              각 관의 이름과 해당 관에 속한 강의실을 설정하세요.
            </p>
            <div className="buildings-list">
              {buildings.length === 0 ? (
                <div style={{ marginBottom: '20px', padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                  <div className="building-input-wrapper" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="예시: 1관"
                      value=""
                      onChange={(e) => {
                        setBuildings([{ id: 1, name: e.target.value, classrooms: [''], classroomIds: [null] }]);
                      }}
                      style={{ flex: 1 }}
                      readOnly={!isTimetableEditMode}
                      disabled={!isTimetableEditMode}
                    />
                  </div>
                </div>
              ) : (
                buildings.map((building, buildingIndex) => (
                  <div key={building.id} style={{ marginBottom: '24px', padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                    {/* 관 이름 입력 */}
                    <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{ minWidth: '60px', fontSize: '0.95em', fontWeight: 600, color: '#333' }}>
                        관 이름:
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={`${building.id}관`}
                        value={building.name}
                        onChange={(e) => handleBuildingNameChange(buildingIndex, e.target.value)}
                        style={{ flex: 1, maxWidth: '200px' }}
                        readOnly={!isTimetableEditMode}
                        disabled={!isTimetableEditMode}
                      />
                      {isTimetableEditMode && buildings.length > 1 && (
                        <button
                          type="button"
                          className="btn-delete-classroom"
                          onClick={() => handleDeleteBuilding(buildingIndex)}
                          style={{ 
                            padding: '6px 12px', 
                            background: '#e74c3c', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: 'pointer',
                            fontSize: '0.9em',
                            fontWeight: 500
                          }}
                          onMouseOver={(e) => e.target.style.background = '#c0392b'}
                          onMouseOut={(e) => e.target.style.background = '#e74c3c'}
                        >
                          관 삭제
                        </button>
                      )}
                    </div>
                    
                    {/* 해당 관의 강의실 입력 */}
                    <div style={{ marginLeft: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9em', color: '#666' }}>
                        강의실 목록:
                      </label>
                      <div className="classrooms-list">
                        {building.classrooms.length === 0 ? (
                          <div className="classroom-input-wrapper" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <select
                              className="form-select"
                              value=""
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '__NEW__') {
                                  // 새 강의실 추가 모드
                                  const updated = [...buildings];
                                  updated[buildingIndex] = { ...building, classrooms: [''], classroomIds: [null] };
                                  setBuildings(updated);
                                } else if (value) {
                                  // 기존 강의실 선택
                                  const selectedClassroom = availableClassrooms.find(c => c.id === value);
                                  if (selectedClassroom) {
                                    const updated = [...buildings];
                                    updated[buildingIndex] = { 
                                      ...building, 
                                      classrooms: [selectedClassroom.name], 
                                      classroomIds: [selectedClassroom.id] 
                                    };
                                    setBuildings(updated);
                                  }
                                }
                              }}
                              disabled={!isTimetableEditMode}
                              style={{ flex: 1 }}
                            >
                              <option value="">강의실 선택</option>
                              {availableClassrooms.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
                                </option>
                              ))}
                              <option value="__NEW__">+ 새 강의실 추가</option>
                            </select>
                          </div>
                        ) : (
                          building.classrooms.map((classroom, classroomIndex) => {
                            const selectedId = building.classroomIds[classroomIndex];
                            const isMatched = selectedId && availableClassrooms.some(c => c.id === selectedId);
                            const isNewClassroom = classroom && !isMatched;
                            
                            return (
                              <div key={classroomIndex} className="classroom-input-wrapper" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {isNewClassroom ? (
                                  // 새 강의실 입력 모드
                                  <input
                                    type="text"
                                    className="form-input"
                                    placeholder="새 강의실 이름 입력"
                                    value={classroom}
                                    onChange={(e) => handleBuildingClassroomChange(buildingIndex, classroomIndex, e.target.value)}
                                    style={{
                                      borderColor: '#3498db',
                                      flex: 1
                                    }}
                                    readOnly={!isTimetableEditMode}
                                    disabled={!isTimetableEditMode}
                                  />
                                ) : (
                                  // 기존 강의실 선택 모드
                                  <select
                                    className="form-select"
                                    value={selectedId || ''}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      if (value === '__NEW__') {
                                        // 새 강의실 추가 모드로 전환
                                        const updated = [...buildings];
                                        const newClassrooms = [...building.classrooms];
                                        const newClassroomIds = [...building.classroomIds];
                                        newClassrooms[classroomIndex] = '';
                                        newClassroomIds[classroomIndex] = null;
                                        updated[buildingIndex] = { ...building, classrooms: newClassrooms, classroomIds: newClassroomIds };
                                        setBuildings(updated);
                                      } else if (value) {
                                        // 기존 강의실 선택
                                        const selectedClassroom = availableClassrooms.find(c => c.id === value);
                                        if (selectedClassroom) {
                                          const updated = [...buildings];
                                          const newClassrooms = [...building.classrooms];
                                          const newClassroomIds = [...building.classroomIds];
                                          newClassrooms[classroomIndex] = selectedClassroom.name;
                                          newClassroomIds[classroomIndex] = selectedClassroom.id;
                                          updated[buildingIndex] = { ...building, classrooms: newClassrooms, classroomIds: newClassroomIds };
                                          setBuildings(updated);
                                        }
                                      }
                                    }}
                                    disabled={!isTimetableEditMode}
                                    style={{ flex: 1 }}
                                  >
                                    <option value="">강의실 선택</option>
                                    {availableClassrooms.map((c) => (
                                      <option key={c.id} value={c.id}>
                                        {c.name}
                                      </option>
                                    ))}
                                    <option value="__NEW__">+ 새 강의실 추가</option>
                                  </select>
                                )}
                                {isMatched && (
                                  <span style={{ color: '#51cf66', fontSize: '1.2em' }} title="저장된 강의실">
                                    ✓
                                  </span>
                                )}
                                {isTimetableEditMode && (
                                  <button
                                    type="button"
                                    className="btn-delete-classroom"
                                    onClick={() => handleDeleteBuildingClassroom(buildingIndex, classroomIndex)}
                                    style={{ 
                                      padding: '6px 12px', 
                                      background: '#e74c3c', 
                                      color: 'white', 
                                      border: 'none', 
                                      borderRadius: '4px', 
                                      cursor: 'pointer',
                                      fontSize: '0.9em',
                                      fontWeight: 500
                                    }}
                                    onMouseOver={(e) => e.target.style.background = '#c0392b'}
                                    onMouseOut={(e) => e.target.style.background = '#e74c3c'}
                                  >
                                    삭제
                                  </button>
                                )}
                              </div>
                            );
                          })
                        )}
                        {isTimetableEditMode && (
                          <button
                            type="button"
                            className="btn-add-classroom"
                            onClick={() => handleAddBuildingClassroom(buildingIndex)}
                            style={{
                              padding: '8px 16px',
                              background: '#3498db',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.9em',
                              fontWeight: 600,
                              marginTop: '8px'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#2980b9'}
                            onMouseOut={(e) => e.target.style.background = '#3498db'}
                          >
                            + 강의실 추가
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isTimetableEditMode && (
                <button
                  type="button"
                  className="btn-add-classroom"
                  onClick={handleAddBuilding}
                  style={{
                    padding: '10px 20px',
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.95em',
                    fontWeight: 600,
                    marginTop: '8px'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#2980b9'}
                  onMouseOut={(e) => e.target.style.background = '#3498db'}
                >
                  + 관 추가
                </button>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">요일별 시간 설정</label>
            <div className="day-time-settings">
              {['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'].map((day) => {
                const dayKey = day.replace('요일', '');
                // operatingDays에 포함된 요일만 표시
                if (!operatingDays.includes(dayKey)) return null;
                
                const timeSetting = dayTimeSettings[dayKey] || { startTime: '오전 09:00', endTime: '오후 10:00' };
                
                // 시작 시간 파싱
                const startPeriod = timeSetting.startTime?.includes('오전') ? '오전' : '오후';
                const startTime = timeSetting.startTime?.split(' ')[1] || '09:00';
                const startTimeParts = startTime.split(':');
                const startHour = startTimeParts[0] || '09';
                const startMinute = startTimeParts[1] || '00';
                
                // 종료 시간 파싱
                const endPeriod = timeSetting.endTime?.includes('오전') ? '오전' : '오후';
                const endTime = timeSetting.endTime?.split(' ')[1] || '10:00';
                const endTimeParts = endTime.split(':');
                const endHour = endTimeParts[0] || '10';
                const endMinute = endTimeParts[1] || '00';
                
                return (
                  <div key={day} className="day-time-row">
                    <span className="day-label">{day}</span>
                    <div className="day-time-inputs">
                      {/* 시작 시간 */}
                      <select
                        className="form-select period-select"
                        value={startPeriod}
                        onChange={(e) => {
                          const period = e.target.value;
                          handleDayTimeChange(dayKey, 'startTime', `${period} ${startHour}:${startMinute}`);
                        }}
                        disabled={!isTimetableEditMode}
                      >
                        <option value="오전">오전</option>
                        <option value="오후">오후</option>
                      </select>
                      <div className="time-input-wrapper">
                        <FaClock className="clock-icon" />
                        <input
                          type="number"
                          className="form-input hour-input"
                          value={startHour}
                          min="1"
                          max="12"
                          onChange={(e) => {
                            let value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 추출
                            if (value === '') {
                              handleDayTimeChange(dayKey, 'startTime', `${startPeriod} 00:${startMinute}`);
                              return;
                            }
                            const hourNum = parseInt(value);
                            if (hourNum < 1) {
                              handleDayTimeChange(dayKey, 'startTime', `${startPeriod} 01:${startMinute}`);
                            } else if (hourNum > 12) {
                              handleDayTimeChange(dayKey, 'startTime', `${startPeriod} 12:${startMinute}`);
                            } else {
                              const hour = String(hourNum).padStart(2, '0');
                              handleDayTimeChange(dayKey, 'startTime', `${startPeriod} ${hour}:${startMinute}`);
                            }
                          }}
                          onBlur={(e) => {
                            let value = e.target.value.replace(/[^0-9]/g, '');
                            let hour = '09';
                            if (value) {
                              const hourNum = parseInt(value);
                              if (hourNum < 1) {
                                hour = '01';
                              } else if (hourNum > 12) {
                                hour = '12';
                              } else {
                                hour = String(hourNum).padStart(2, '0');
                              }
                            }
                            handleDayTimeChange(dayKey, 'startTime', `${startPeriod} ${hour}:${startMinute}`);
                          }}
                          disabled={!isTimetableEditMode}
                          placeholder="09"
                          style={{ width: '60px', textAlign: 'center' }}
                        />
                        <span style={{ marginLeft: '4px', fontSize: '0.9em' }}>시</span>
                      </div>
                      <div className="time-input-wrapper">
                        <input
                          type="number"
                          className="form-input minute-input"
                          value={startMinute}
                          min="0"
                          max="59"
                          onChange={(e) => {
                            let value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 추출
                            if (value === '') {
                              handleDayTimeChange(dayKey, 'startTime', `${startPeriod} ${startHour}:00`);
                              return;
                            }
                            const minuteNum = parseInt(value);
                            if (minuteNum < 0) {
                              handleDayTimeChange(dayKey, 'startTime', `${startPeriod} ${startHour}:00`);
                            } else if (minuteNum > 59) {
                              handleDayTimeChange(dayKey, 'startTime', `${startPeriod} ${startHour}:59`);
                            } else {
                              const minute = String(minuteNum).padStart(2, '0');
                              handleDayTimeChange(dayKey, 'startTime', `${startPeriod} ${startHour}:${minute}`);
                            }
                          }}
                          onBlur={(e) => {
                            let value = e.target.value.replace(/[^0-9]/g, '');
                            let minute = '00';
                            if (value !== '') {
                              const minuteNum = parseInt(value);
                              if (minuteNum < 0) {
                                minute = '00';
                              } else if (minuteNum > 59) {
                                minute = '59';
                              } else {
                                minute = String(minuteNum).padStart(2, '0');
                              }
                            }
                            handleDayTimeChange(dayKey, 'startTime', `${startPeriod} ${startHour}:${minute}`);
                          }}
                          disabled={!isTimetableEditMode}
                          placeholder="00"
                          style={{ width: '60px', textAlign: 'center' }}
                        />
                        <span style={{ marginLeft: '4px', fontSize: '0.9em' }}>분</span>
                      </div>
                      
                      <span className="time-separator">-</span>
                      
                      {/* 종료 시간 */}
                      <select
                        className="form-select period-select"
                        value={endPeriod}
                        onChange={(e) => {
                          const period = e.target.value;
                          handleDayTimeChange(dayKey, 'endTime', `${period} ${endHour}:${endMinute}`);
                        }}
                        disabled={!isTimetableEditMode}
                      >
                        <option value="오전">오전</option>
                        <option value="오후">오후</option>
                      </select>
                      <div className="time-input-wrapper">
                        <FaClock className="clock-icon" />
                        <input
                          type="number"
                          className="form-input hour-input"
                          value={endHour}
                          min="1"
                          max="12"
                          onChange={(e) => {
                            let value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 추출
                            if (value === '') {
                              handleDayTimeChange(dayKey, 'endTime', `${endPeriod} 00:${endMinute}`);
                              return;
                            }
                            const hourNum = parseInt(value);
                            if (hourNum < 1) {
                              handleDayTimeChange(dayKey, 'endTime', `${endPeriod} 01:${endMinute}`);
                            } else if (hourNum > 12) {
                              handleDayTimeChange(dayKey, 'endTime', `${endPeriod} 12:${endMinute}`);
                            } else {
                              const hour = String(hourNum).padStart(2, '0');
                              handleDayTimeChange(dayKey, 'endTime', `${endPeriod} ${hour}:${endMinute}`);
                            }
                          }}
                          onBlur={(e) => {
                            let value = e.target.value.replace(/[^0-9]/g, '');
                            let hour = '10';
                            if (value) {
                              const hourNum = parseInt(value);
                              if (hourNum < 1) {
                                hour = '01';
                              } else if (hourNum > 12) {
                                hour = '12';
                              } else {
                                hour = String(hourNum).padStart(2, '0');
                              }
                            }
                            handleDayTimeChange(dayKey, 'endTime', `${endPeriod} ${hour}:${endMinute}`);
                          }}
                          disabled={!isTimetableEditMode}
                          placeholder="10"
                          style={{ width: '60px', textAlign: 'center' }}
                        />
                        <span style={{ marginLeft: '4px', fontSize: '0.9em' }}>시</span>
                      </div>
                      <div className="time-input-wrapper">
                        <input
                          type="number"
                          className="form-input minute-input"
                          value={endMinute}
                          min="0"
                          max="59"
                          onChange={(e) => {
                            let value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 추출
                            if (value === '') {
                              handleDayTimeChange(dayKey, 'endTime', `${endPeriod} ${endHour}:00`);
                              return;
                            }
                            const minuteNum = parseInt(value);
                            if (minuteNum < 0) {
                              handleDayTimeChange(dayKey, 'endTime', `${endPeriod} ${endHour}:00`);
                            } else if (minuteNum > 59) {
                              handleDayTimeChange(dayKey, 'endTime', `${endPeriod} ${endHour}:59`);
                            } else {
                              const minute = String(minuteNum).padStart(2, '0');
                              handleDayTimeChange(dayKey, 'endTime', `${endPeriod} ${endHour}:${minute}`);
                            }
                          }}
                          onBlur={(e) => {
                            let value = e.target.value.replace(/[^0-9]/g, '');
                            let minute = '00';
                            if (value !== '') {
                              const minuteNum = parseInt(value);
                              if (minuteNum < 0) {
                                minute = '00';
                              } else if (minuteNum > 59) {
                                minute = '59';
                              } else {
                                minute = String(minuteNum).padStart(2, '0');
                              }
                            }
                            handleDayTimeChange(dayKey, 'endTime', `${endPeriod} ${endHour}:${minute}`);
                          }}
                          disabled={!isTimetableEditMode}
                          placeholder="00"
                          style={{ width: '60px', textAlign: 'center' }}
                        />
                        <span style={{ marginLeft: '4px', fontSize: '0.9em' }}>분</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {isTimetableEditMode && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e0e0e0' }}>
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
                style={{
                  padding: '12px 24px',
                  background: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#7f8c8d'}
                onMouseOut={(e) => e.target.style.background = '#95a5a6'}
              >
                취소
              </button>
            </div>
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

      {/* 알림 설정 섹션 */}
      <div className="settings-section">
        <div className="section-header-with-icon">
          <FaBell className="section-icon" />
          <h2 className="section-title">알림 설정</h2>
        </div>
        <div className="settings-item">
          <div className="settings-item-content">
            <span className="settings-item-label">이메일 알림</span>
            <p className="settings-item-description">중요한 업데이트를 이메일로 받습니다</p>
          </div>
          <ToggleSwitch
            checked={emailNotifications}
            onChange={(e) => setEmailNotifications(e.target.checked)}
          />
        </div>
        <div className="settings-item">
          <div className="settings-item-content">
            <span className="settings-item-label">수업 알림</span>
            <p className="settings-item-description">수업 시작 전 알림을 받습니다</p>
          </div>
          <ToggleSwitch
            checked={classNotifications}
            onChange={(e) => setClassNotifications(e.target.checked)}
          />
        </div>
        <div className="settings-item">
          <div className="settings-item-content">
            <span className="settings-item-label">마케팅 알림</span>
            <p className="settings-item-description">프로모션 및 이벤트 정보를 받습니다</p>
          </div>
          <ToggleSwitch
            checked={marketingNotifications}
            onChange={(e) => setMarketingNotifications(e.target.checked)}
          />
        </div>
      </div>

      {/* 시스템 설정 섹션 */}
      <div className="settings-section">
        <div className="section-header-with-icon">
          <FaGlobe className="section-icon" />
          <h2 className="section-title">시스템 설정</h2>
        </div>
        <div className="settings-item">
          <div className="settings-item-content">
            <span className="settings-item-label">언어</span>
            <span className="settings-item-value">{language}</span>
          </div>
          <button className="btn-modify" onClick={() => {
            const newLang = prompt('언어를 입력하세요:', language);
            if (newLang) setLanguage(newLang);
          }}>
            변경
          </button>
        </div>
        <div className="settings-item">
          <div className="settings-item-content">
            <span className="settings-item-label">시간대</span>
            <span className="settings-item-value">{timezone}</span>
          </div>
          <button className="btn-modify" onClick={() => {
            const newTz = prompt('시간대를 입력하세요:', timezone);
            if (newTz) setTimezone(newTz);
          }}>
            변경
          </button>
        </div>
        <div className="settings-item">
          <div className="settings-item-content">
            <span className="settings-item-label">다크 모드</span>
            <p className="settings-item-description">어두운 테마를 사용합니다</p>
          </div>
          <ToggleSwitch
            checked={darkMode}
            onChange={(e) => setDarkMode(e.target.checked)}
          />
        </div>
      </div>

      {/* 지원 섹션 */}
      <div className="settings-section">
        <div className="section-header-with-icon">
          <FaHeadset className="section-icon" />
          <h2 className="section-title">지원</h2>
        </div>
        <div className="support-links">
          <a href="#" className="support-link">
            <span>문의하기</span>
            <FaChevronRight className="support-link-icon" />
          </a>
          <a href="#" className="support-link">
            <span>이용약관</span>
            <FaChevronRight className="support-link-icon" />
          </a>
          <a href="#" className="support-link">
            <span>개인정보처리방침</span>
            <FaChevronRight className="support-link-icon" />
          </a>
        </div>
      </div>

      {/* 비밀번호 변경 섹션 */}
      <PasswordChangeSection />

      {/* 홈으로 돌아가기 버튼 */}
      <button className="btn-home" onClick={() => navigate('/')}>
        홈으로 돌아가기
      </button>
    </div>
  );
};

export default Settings;
