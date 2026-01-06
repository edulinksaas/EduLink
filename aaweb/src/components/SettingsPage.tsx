import { Settings, User, Bell, Lock, Globe, HelpCircle, Info, Building2, BookOpen, CreditCard, DoorOpen, Clock, Edit, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { subjectApi, academyApi, classroomApi, timetableSettingsApi, getAcademyId } from '../utils/supabase/api';

interface SettingsPageProps {
  onBack: () => void;
  mainColor?: string;
  onMainColorChange?: (color: string) => void;
  zones?: { name: string; rooms: string[] }[];
  onZonesChange?: (zones: { name: string; rooms: string[] }[]) => void;
  operatingHours?: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
  onOperatingHoursChange?: (hours: SettingsPageProps['operatingHours']) => void;
  subjects?: { name: string; color: string }[];
  onSubjectsChange?: (subjects: { name: string; color: string }[]) => void;
  classInterval?: number;
  onClassIntervalChange?: (interval: number) => void;
  difficulties?: string[];
  onDifficultiesChange?: (difficulties: string[]) => void;
  classTypes?: string[];
  onClassTypesChange?: (classTypes: string[]) => void;
}

export function SettingsPage({ 
  onBack, 
  mainColor = '#3b82f6', 
  onMainColorChange, 
  zones: initialZones, 
  onZonesChange,
  operatingHours: initialOperatingHours,
  onOperatingHoursChange,
  subjects: initialSubjects,
  onSubjectsChange,
  classInterval: initialClassInterval,
  onClassIntervalChange,
  difficulties: initialDifficulties,
  onDifficultiesChange,
  classTypes: initialClassTypes,
  onClassTypesChange
}: SettingsPageProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedColor, setSelectedColor] = useState(mainColor);
  const [zones, setZones] = useState(initialZones || [
    { name: '1층', rooms: ['101호', '102호', '103호'] },
    { name: '2층', rooms: ['201호', '202호'] },
    { name: '3층', rooms: ['301호'] },
  ]);
  const [newZoneName, setNewZoneName] = useState('');
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [addingRoomToZone, setAddingRoomToZone] = useState<number | null>(null);
  const [newRoomInZone, setNewRoomInZone] = useState('');
  const [attendanceStatuses, setAttendanceStatuses] = useState({
    출석: true,
    결석: true,
    이월: true,
    지각: true,
    조퇴: true,
    병결: true,
    공결: true,
    보강: true
  });
  const [operatingHours, setOperatingHours] = useState(initialOperatingHours || {
    monday: { open: '09:00', close: '22:00', isOpen: true },
    tuesday: { open: '09:00', close: '22:00', isOpen: true },
    wednesday: { open: '09:00', close: '22:00', isOpen: true },
    thursday: { open: '09:00', close: '22:00', isOpen: true },
    friday: { open: '09:00', close: '22:00', isOpen: true },
    saturday: { open: '09:00', close: '22:00', isOpen: true },
    sunday: { open: '09:00', close: '22:00', isOpen: true }
  });
  const [classInterval, setClassInterval] = useState(initialClassInterval || 50); // 분 단위

  // classInterval prop 변경 시 상태 업데이트
  useEffect(() => {
    if (initialClassInterval !== undefined) {
      setClassInterval(initialClassInterval);
    }
  }, [initialClassInterval]);
  
  // 모달 상태
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isAcademyModalOpen, setIsAcademyModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isOperatingHoursModalOpen, setIsOperatingHoursModalOpen] = useState(false);
  const [isClassManagementModalOpen, setIsClassManagementModalOpen] = useState(false);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [isAddFrequencyModalOpen, setIsAddFrequencyModalOpen] = useState(false);
  const [isAddTuitionModalOpen, setIsAddTuitionModalOpen] = useState(false);
  const [isAddPaymentMethodModalOpen, setIsAddPaymentMethodModalOpen] = useState(false);
  const [isAddDifficultyModalOpen, setIsAddDifficultyModalOpen] = useState(false);
  const [isAddClassTypeModalOpen, setIsAddClassTypeModalOpen] = useState(false);
  
  // 계정 설정 데이터
  const [accountData, setAccountData] = useState({
    username: '',
    email: '',
    phone: ''
  });
  
  // 학원 설정 데이터
  const [academyData, setAcademyData] = useState({
    name: '',
    address: '',
    floors: ''
  });

  // 수업 관리 데이터
  const [subjects, setSubjects] = useState<{ name: string; color: string }[]>(initialSubjects || []);
  const [frequencies, setFrequencies] = useState<string[]>([]);
  const [tuitions, setTuitions] = useState<{ subject: string; amount: number }[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<{ name: string; enabled: boolean }[]>([]);
  const [difficulties, setDifficulties] = useState<string[]>(initialDifficulties || []);
  const [classTypes, setClassTypes] = useState<string[]>(initialClassTypes || []);

  // 새 항목 추가용 state
  const [newSubject, setNewSubject] = useState({ name: '', color: '#3b82f6' });
  const [newFrequency, setNewFrequency] = useState('');
  const [newTuition, setNewTuition] = useState({ subject: '', amount: '' });
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [newDifficulty, setNewDifficulty] = useState('');
  const [newClassType, setNewClassType] = useState('');

  const dayNames: Record<string, string> = {
    monday: '월요일',
    tuesday: '화요일',
    wednesday: '수요일',
    thursday: '목요일',
    friday: '금요일',
    saturday: '토요일',
    sunday: '일요일'
  };

  // 과목 목록 불러오기
  useEffect(() => {
    const loadSubjects = async () => {
      // props로 전달된 과목이 있으면 우선 사용
      if (initialSubjects && initialSubjects.length > 0) {
        setSubjects(initialSubjects);
        return;
      }

      try {
        const response = await subjectApi.getAll();
        const subjectsData = Array.isArray(response) ? response : (response.subjects || []);
        
        // API 응답을 { name, color } 형식으로 변환
        const formattedSubjects = subjectsData.map((subject: any) => ({
          name: subject.name || subject.subject_name || '',
          color: subject.color || '#3b82f6'
        })).filter((s: any) => s.name); // 이름이 있는 것만 필터링
        
        setSubjects(formattedSubjects);
        if (onSubjectsChange) {
          onSubjectsChange(formattedSubjects);
        }
      } catch (err) {
        console.error('과목 목록 로드 실패:', err);
        // 에러 발생 시 빈 배열 유지
        setSubjects([]);
      }
    };

    loadSubjects();
  }, [initialSubjects, onSubjectsChange]);

  const handleOperatingHourChange = (day: string, field: 'open' | 'close' | 'isOpen', value: string | boolean) => {
    const updated = {
      ...operatingHours,
      [day]: {
        ...operatingHours[day as keyof typeof operatingHours],
        [field]: value
      }
    };
    setOperatingHours(updated);
    if (onOperatingHoursChange) {
      onOperatingHoursChange(updated);
    }
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    if (onMainColorChange) {
      onMainColorChange(color);
    }
  };

  const handleAddZone = () => {
    if (newZoneName.trim()) {
      setZones([...zones, { name: newZoneName.trim(), rooms: [] }]);
      setNewZoneName('');
      setIsAddingZone(false);
    }
  };

  const handleDeleteZone = (index: number) => {
    setZones(zones.filter((_, i) => i !== index));
  };

  const handleAddRoomToZone = (zoneIndex: number) => {
    setAddingRoomToZone(zoneIndex);
  };

  const handleAddRoomInZone = () => {
    if (addingRoomToZone !== null && newRoomInZone.trim()) {
      const updatedZones = [...zones];
      updatedZones[addingRoomToZone].rooms.push(newRoomInZone.trim());
      setZones(updatedZones);
      setNewRoomInZone('');
      setAddingRoomToZone(null);
    }
  };

  const handleDeleteRoomInZone = (zoneIndex: number, roomIndex: number) => {
    const updatedZones = [...zones];
    updatedZones[zoneIndex].rooms = updatedZones[zoneIndex].rooms.filter((_, i) => i !== roomIndex);
    setZones(updatedZones);
  };

  // zones가 변경되면 부모 컴포넌트에 알림
  useEffect(() => {
    if (onZonesChange) {
      onZonesChange(zones);
    }
  }, [zones, onZonesChange]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-6 h-6 text-gray-700" />
            <h1 className="text-2xl text-gray-800">설정</h1>
          </div>
          <p className="text-sm text-gray-600">계정 및 시스템 설정을 관리합니다</p>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg text-gray-800">계정 설정</h2>
            </div>
            <button 
              onClick={() => setIsAccountModalOpen(true)}
              className="flex items-center gap-1 px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded transition-colors"
            >
              <Edit className="w-4 h-4" />
              수정하기
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="text-sm text-gray-800 mb-1">사용자 이름</div>
                <div className="text-sm text-gray-500">{accountData.username}</div>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="text-sm text-gray-800 mb-1">이메일</div>
                <div className="text-sm text-gray-500">{accountData.email}</div>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm text-gray-800 mb-1">전화번호</div>
                <div className="text-sm text-gray-500">{accountData.phone}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Academy Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg text-gray-800">학원 설정</h2>
            </div>
            <button 
              onClick={() => setIsAcademyModalOpen(true)}
              className="flex items-center gap-1 px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded transition-colors"
            >
              <Edit className="w-4 h-4" />
              수정하기
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="text-sm text-gray-800 mb-1">학원 이름</div>
                <div className="text-sm text-gray-500">{academyData.name}</div>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="text-sm text-gray-800 mb-1">학원 로고</div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-12 h-12 bg-slate-700 rounded flex items-center justify-center">
                    <span className="text-white">똑</span>
                  </div>
                  <span className="text-xs text-gray-500">현재 로고</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="text-sm text-gray-800 mb-1">학원 주소</div>
                <div className="text-sm text-gray-500">{academyData.address}</div>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="text-sm text-gray-800 mb-1">학원 층수</div>
                <div className="text-sm text-gray-500">{academyData.floors}</div>
              </div>
            </div>
            
            {/* 학원 메인 컬러 설정 */}
            <div className="py-3">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm text-gray-800 mb-1">학원 메인 컬러</div>
                  <div className="text-sm text-gray-500">버튼, 강조 색상 등에 적용됩니다</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-3">
                {[
                  { name: '파란색', color: '#3b82f6' },
                  { name: '보라색', color: '#8b5cf6' },
                  { name: '분홍색', color: '#ec4899' },
                  { name: '빨간색', color: '#ef4444' },
                  { name: '주황색', color: '#f97316' },
                  { name: '노란색', color: '#eab308' },
                  { name: '초록색', color: '#22c55e' },
                  { name: '청록색', color: '#14b8a6' },
                  { name: '남색', color: '#6366f1' },
                ].map((item) => (
                  <button
                    key={item.color}
                    onClick={() => handleColorChange(item.color)}
                    className={`relative w-16 h-16 rounded-lg transition-all hover:scale-110 ${
                      selectedColor === item.color ? 'ring-4 ring-offset-2 ring-gray-400' : ''
                    }`}
                    style={{ backgroundColor: item.color }}
                    title={item.name}
                  >
                    {selectedColor === item.color && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-3 p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">현재 선택된 컬러:</span>
                  <div 
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{ backgroundColor: selectedColor }}
                  ></div>
                  <span className="text-xs text-gray-700 font-mono">{selectedColor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 구역별 강의실 설정 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DoorOpen className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg text-gray-800">강의실 설정</h2>
            </div>
            <button 
              onClick={() => setIsRoomModalOpen(true)}
              className="flex items-center gap-1 px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded transition-colors"
            >
              <Edit className="w-4 h-4" />
              수정하기
            </button>
          </div>
          <div className="space-y-4">
            {/* 강의실 설정 */}
            <div className="py-3">
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <DoorOpen className="w-4 h-4 text-gray-600" />
                  <div className="text-sm text-gray-800">구역별 강의실 설정</div>
                </div>
                <div className="text-sm text-gray-500">구역을 만들고 각 구역에 강의실을 배치합니다</div>
              </div>
              
              {/* 구역별 강의실 목록 */}
              <div className="space-y-3 mt-3">
                {zones.map((zone, zoneIndex) => (
                  <div key={zoneIndex} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    {/* 구역 헤더 */}
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                      <Building2 className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-800">{zone.name}</span>
                      <span className="text-xs text-gray-500">({zone.rooms.length}개)</span>
                    </div>
                    
                    {/* 강의실 목록 */}
                    <div className="space-y-1">
                      {zone.rooms.length === 0 ? (
                        <div className="text-xs text-gray-400 text-center py-2">
                          강의실이 없습니다.
                        </div>
                      ) : (
                        zone.rooms.map((room, roomIndex) => (
                          <div key={roomIndex} className="flex items-center gap-2 p-2 bg-white rounded">
                            <DoorOpen className="w-3 h-3 text-blue-500" />
                            <span className="text-sm text-gray-700">{room}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
                
                {zones.length === 0 && (
                  <div className="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-300 rounded">
                    구역을 추가하여 강의실을 관리하세요
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 요일별 운영 시간 설정 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg text-gray-800">운영 시간</h2>
            </div>
            <button 
              onClick={() => setIsOperatingHoursModalOpen(true)}
              className="flex items-center gap-1 px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded transition-colors"
            >
              <Edit className="w-4 h-4" />
              수정하기
            </button>
          </div>
          <div className="space-y-4">
            <div className="py-3 border-b border-gray-100">
              <div className="mb-3">
                <div className="text-sm text-gray-800 mb-1">요일별 운영 시간</div>
                <div className="text-sm text-gray-500">학원의 요일별 운영 시간을 설정합니다</div>
              </div>
              <div className="space-y-2 mt-3">
                {Object.entries(operatingHours).map(([day, hours]) => {
                  const dayHours = hours as { open: string; close: string; isOpen: boolean };
                  return (
                    <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700 min-w-[60px]">{dayNames[day]}</span>
                      {dayHours.isOpen ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{dayHours.open} ~ {dayHours.close}</span>
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">운영</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">휴무</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* 수업 관리 설정 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg text-gray-800">수업 관리 설정</h2>
            </div>
            <button 
              onClick={() => setIsClassManagementModalOpen(true)}
              className="flex items-center gap-1 px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded transition-colors"
            >
              <Edit className="w-4 h-4" />
              수정하기
            </button>
          </div>
          <div className="space-y-4">
            <div className="py-3 border-b border-gray-100">
              <div className="mb-3">
                <div className="text-sm text-gray-800 mb-1">과목 설정</div>
                <div className="text-sm text-gray-500">수업에서 사용할 과목을 관리합니다</div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {subjects.map((subject, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 rounded-full text-xs"
                    style={{ 
                      backgroundColor: `${subject.color}20`,
                      color: subject.color
                    }}
                  >
                    {subject.name}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="py-3 border-b border-gray-100">
              <div className="mb-3">
                <div className="text-sm text-gray-800 mb-1">횟수 설정</div>
                <div className="text-sm text-gray-500">수업 횟수 옵션을 관리합니다</div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {frequencies.map((freq, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    {freq}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="py-3 border-b border-gray-100">
              <div className="mb-3">
                <div className="text-sm text-gray-800 mb-1">수강료 설정</div>
                <div className="text-sm text-gray-500">수강료를 관리합니다</div>
              </div>
              <div className="space-y-2 mt-2">
                {tuitions.map((tuition, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-xs text-gray-700">{tuition.subject}</span>
                    <span className="text-xs text-gray-900">₩{tuition.amount.toLocaleString()} / 월</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="py-3 border-b border-gray-100">
              <div className="mb-3">
                <div className="text-sm text-gray-800 mb-1">결제 방법 설정</div>
                <div className="text-sm text-gray-500">수강료 결제 방법을 관리합니다</div>
              </div>
              <div className="space-y-2 mt-2">
                {paymentMethods.map((method, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-600" />
                      <span className="text-xs text-gray-700">{method.name}</span>
                    </div>
                    <span className={`text-xs ${method.enabled ? 'text-blue-600 bg-blue-50' : 'text-gray-400 bg-gray-100'} px-2 py-1 rounded`}>
                      {method.enabled ? '사용 중' : '미사용'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="py-3 border-b border-gray-100">
              <div className="mb-3">
                <div className="text-sm text-gray-800 mb-1">수업 난이도 설정</div>
                <div className="text-sm text-gray-500">수업 난이도 옵션을 관리합니다</div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {difficulties.map((difficulty, index) => (
                  <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                    {difficulty}
                  </span>
                ))}
              </div>
            </div>

            <div className="py-3 border-b border-gray-100">
              <div className="mb-3">
                <div className="text-sm text-gray-800 mb-1">수업 유형 설정</div>
                <div className="text-sm text-gray-500">수업 유형 옵션을 관리합니다</div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {classTypes.map((type, index) => (
                  <span key={index} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div className="py-3">
              <div className="mb-3">
                <div className="text-sm text-gray-800 mb-1">정규 수업 시간 간격</div>
                <div className="text-sm text-gray-500">한 수업당 진행되는 시간을 설정합니다</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded mt-3">
                <span className="text-sm text-gray-700">수업 시간</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-900">{classInterval}분</span>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">1타임</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 출결 상태 설정 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg text-gray-800">출결 상태 설정</h2>
          </div>
          <div className="space-y-4">
            {/* 출결 상태 설정 */}
            <div className="py-3">
              <div className="text-sm text-gray-500 mb-3">수업 출결 처리 시 사용할 상태를 선택하세요</div>
              <div className="grid grid-cols-4 gap-3 mt-3">
                {[
                  { status: '출석', emoji: '😊', bgColor: 'bg-white', borderColor: 'border-gray-200' },
                  { status: '결석', emoji: '❌', bgColor: 'bg-white', borderColor: 'border-gray-200' },
                  { status: '이월', emoji: '💬', bgColor: 'bg-white', borderColor: 'border-gray-200' },
                  { status: '지각', emoji: '⏰', bgColor: 'bg-white', borderColor: 'border-gray-200' },
                  { status: '조퇴', emoji: '🏃', bgColor: 'bg-white', borderColor: 'border-gray-200' },
                  { status: '병결', emoji: '😷', bgColor: 'bg-white', borderColor: 'border-gray-200' },
                  { status: '공결', emoji: '📋', bgColor: 'bg-white', borderColor: 'border-gray-200' },
                  { status: '보강', emoji: '📝', bgColor: 'bg-green-100', borderColor: 'border-green-300' },
                ].map((item) => (
                  <div key={item.status} className="flex flex-col items-center gap-2">
                    <div className={`w-14 h-14 ${item.bgColor} border ${item.borderColor} rounded-lg flex items-center justify-center text-2xl shadow-sm`}>
                      {item.emoji}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-700">{item.status}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={attendanceStatuses[item.status as keyof typeof attendanceStatuses]}
                          onChange={(e) => {
                            setAttendanceStatuses(prev => ({
                              ...prev,
                              [item.status]: e.target.checked
                            }));
                          }}
                        />
                        <div className="w-7 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500"></div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-xs text-blue-700">
                  💡 선택된 출결 상태만 수업 모듈창에서 선택할 수 있습니다. 최소 1개 이상의 상태를 선택해주세요.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg text-gray-800">보안 설정</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="text-sm text-gray-800 mb-1">비밀번호</div>
                <div className="text-sm text-gray-500">마지막 변경: 2024년 11월 15일</div>
              </div>
              <button className="px-4 py-2 text-sm text-blue-500 hover:bg-blue-50 rounded transition-colors">
                변경
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm text-gray-800 mb-1">2단계 인증</div>
                <div className="text-sm text-gray-500">계정 보안을 강화합니다</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg text-gray-800">알림 설정</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="text-sm text-gray-800 mb-1">이메일 알림</div>
                <div className="text-sm text-gray-500">중요한 업데이트를 이메일로 받습니다</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="text-sm text-gray-800 mb-1">수업 알림</div>
                <div className="text-sm text-gray-500">수업 시작 전 알림을 받습니다</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm text-gray-800 mb-1">마케팅 알림</div>
                <div className="text-sm text-gray-500">프로모션 및 이벤트 정보를 받습니다</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg text-gray-800">시스템 설정</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="text-sm text-gray-800 mb-1">언어</div>
                <div className="text-sm text-gray-500">한국어</div>
              </div>
              <button className="px-4 py-2 text-sm text-blue-500 hover:bg-blue-50 rounded transition-colors">
                변경
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="text-sm text-gray-800 mb-1">시간대</div>
                <div className="text-sm text-gray-500">서울 (GMT+9)</div>
              </div>
              <button className="px-4 py-2 text-sm text-blue-500 hover:bg-blue-50 rounded transition-colors">
                변경
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm text-gray-800 mb-1">다크 모드</div>
                <div className="text-sm text-gray-500">어두운 테마를 사용합니다</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg text-gray-800">정보</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="text-sm text-gray-600">버전</div>
              <div className="text-sm text-gray-800">1.0.0</div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="text-sm text-gray-600">마지막 업데이트</div>
              <div className="text-sm text-gray-800">2024년 12월 29일</div>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg text-gray-800">지원</h2>
          </div>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded transition-colors">
              <span className="text-sm text-gray-700">도움말 센터</span>
              <span className="text-gray-400">→</span>
            </button>
            <button className="w-full flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded transition-colors">
              <span className="text-sm text-gray-700">문의하기</span>
              <span className="text-gray-400">→</span>
            </button>
            <button className="w-full flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded transition-colors">
              <span className="text-sm text-gray-700">이용약관</span>
              <span className="text-gray-400">→</span>
            </button>
            <button className="w-full flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded transition-colors">
              <span className="text-sm text-gray-700">개인정보 처리방침</span>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-full py-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          홈으로 돌아가기
        </button>
      </div>
      
      {/* 계정 설정 수정 모달 - 간단 버전으로 축약 */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg text-gray-800">계정 설정 수정</h3>
              <button 
                onClick={() => setIsAccountModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">사용자 이름</label>
                <input
                  type="text"
                  value={accountData.username}
                  onChange={(e) => setAccountData({ ...accountData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">이메일</label>
                <input
                  type="email"
                  value={accountData.email}
                  onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">전화번호</label>
                <input
                  type="tel"
                  value={accountData.phone}
                  onChange={(e) => setAccountData({ ...accountData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 p-6 border-t border-gray-200">
              <button
                onClick={() => setIsAccountModalOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => setIsAccountModalOpen(false)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 학원 설정 수정 모달 */}
      {isAcademyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-lg text-gray-800">학원 설정 수정</h3>
              <button 
                onClick={() => setIsAcademyModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">학원 이름</label>
                <input
                  type="text"
                  value={academyData.name}
                  onChange={(e) => setAcademyData({ ...academyData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">학원 주소</label>
                <input
                  type="text"
                  value={academyData.address}
                  onChange={(e) => setAcademyData({ ...academyData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">학원 층수</label>
                <input
                  type="text"
                  value={academyData.floors}
                  onChange={(e) => setAcademyData({ ...academyData, floors: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 3층"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">학원 로고</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-slate-700 rounded flex items-center justify-center">
                    <span className="text-white text-xl">똑</span>
                  </div>
                  <button className="px-4 py-2 text-sm text-blue-500 border border-blue-500 rounded hover:bg-blue-50 transition-colors">
                    로고 변경
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">PNG, JPG 파일 (최대 2MB)</p>
              </div>
              
              {/* 학원 메인 컬러 */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">학원 메인 컬러</label>
                <p className="text-xs text-gray-500 mb-3">버튼, 강조 색상 등에 적용됩니다</p>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { name: '파란색', color: '#3b82f6' },
                    { name: '보라색', color: '#8b5cf6' },
                    { name: '분홍색', color: '#ec4899' },
                    { name: '빨간색', color: '#ef4444' },
                    { name: '주황색', color: '#f97316' },
                    { name: '노란색', color: '#eab308' },
                    { name: '초록색', color: '#22c55e' },
                    { name: '청록색', color: '#14b8a6' },
                    { name: '남색', color: '#6366f1' },
                  ].map((item) => (
                    <button
                      key={item.color}
                      onClick={() => handleColorChange(item.color)}
                      className={`relative w-12 h-12 rounded-lg transition-all hover:scale-110 ${
                        selectedColor === item.color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                      }`}
                      style={{ backgroundColor: item.color }}
                      title={item.name}
                    >
                      {selectedColor === item.color && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-3 p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">현재 선택:</span>
                    <div 
                      className="w-5 h-5 rounded border border-gray-300"
                      style={{ backgroundColor: selectedColor }}
                    ></div>
                    <span className="text-xs text-gray-700 font-mono">{selectedColor}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
              <button
                onClick={() => setIsAcademyModalOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={async () => {
                  try {
                    const academyId = getAcademyId();
                    if (!academyId) {
                      alert('학원 ID가 없습니다. 다시 로그인해주세요.');
                      return;
                    }

                    // 학원 정보 업데이트
                    await academyApi.update(academyId, {
                      name: academyData.name,
                      address: academyData.address,
                      floor: academyData.floors
                    });

                    alert('학원 설정이 저장되었습니다.');
                    setIsAcademyModalOpen(false);
                  } catch (err) {
                    console.error('학원 설정 저장 실패:', err);
                    alert('학원 설정 저장에 실패했습니다.');
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 강의실 설정 수정 모달 */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-lg text-gray-800">강의실 설정</h3>
              <button 
                onClick={() => setIsRoomModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">구역을 만들고 각 구역에 강의실을 배치합니다</p>
                <button 
                  className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded transition-colors"
                  onClick={() => setIsAddingZone(true)}
                >
                  구역 추가
                </button>
              </div>
              
              {isAddingZone && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded border border-blue-200 mb-4">
                  <input
                    type="text"
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    placeholder="구역 이름 입력 (예: 1층, 2층, A동)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    autoFocus
                  />
                  <button
                    onClick={handleAddZone}
                    className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingZone(false);
                      setNewZoneName('');
                    }}
                    className="px-3 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors text-sm"
                  >
                    취소
                  </button>
                </div>
              )}
              
              <div className="space-y-4">
                {zones.map((zone, zoneIndex) => (
                  <div key={zoneIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-500" />
                        <span className="text-sm text-gray-800">{zone.name}</span>
                        <span className="text-xs text-gray-500">({zone.rooms.length}개)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAddRoomToZone(zoneIndex)}
                          className="px-3 py-1 text-sm text-blue-500 hover:bg-blue-50 rounded transition-colors"
                        >
                          강의실 추가
                        </button>
                        <button
                          onClick={() => handleDeleteZone(zoneIndex)}
                          className="px-3 py-1 text-sm text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          구역 삭제
                        </button>
                      </div>
                    </div>
                    
                    {addingRoomToZone === zoneIndex && (
                      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200 mb-3">
                        <input
                          type="text"
                          value={newRoomInZone}
                          onChange={(e) => setNewRoomInZone(e.target.value)}
                          placeholder="강의실 이름 입력"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          autoFocus
                        />
                        <button
                          onClick={handleAddRoomInZone}
                          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => {
                            setAddingRoomToZone(null);
                            setNewRoomInZone('');
                          }}
                          className="px-3 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors text-sm"
                        >
                          취소
                        </button>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      {zone.rooms.length === 0 ? (
                        <div className="text-sm text-gray-400 text-center py-3 border border-dashed border-gray-300 rounded bg-white">
                          강의실이 없습니다. 강의실을 추가해주세요.
                        </div>
                      ) : (
                        zone.rooms.map((room, roomIndex) => (
                          <div key={roomIndex} className="flex items-center justify-between p-3 bg-white rounded hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-2">
                              <DoorOpen className="w-4 h-4 text-blue-500" />
                              <span className="text-sm text-gray-700">{room}</span>
                            </div>
                            <button
                              onClick={() => handleDeleteRoomInZone(zoneIndex, roomIndex)}
                              className="text-sm text-red-500 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded transition-colors"
                            >
                              삭제
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
                
                {zones.length === 0 && (
                  <div className="text-sm text-gray-400 text-center py-6 border border-dashed border-gray-300 rounded">
                    구역을 추가하여 강의실을 관리하세요
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
              <button
                onClick={() => setIsRoomModalOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={async () => {
                  try {
                    const academyId = getAcademyId();
                    if (!academyId) {
                      alert('학원 ID가 없습니다. 다시 로그인해주세요.');
                      return;
                    }

                    // 모든 강의실을 구역별로 저장
                    const allRooms: { name: string; zone: string }[] = [];
                    zones.forEach(zone => {
                      zone.rooms.forEach(room => {
                        allRooms.push({ name: room, zone: zone.name });
                      });
                    });

                    // 기존 강의실 목록 가져오기
                    const existingClassrooms = await classroomApi.getAll();
                    const classroomsList = Array.isArray(existingClassrooms) 
                      ? existingClassrooms 
                      : (existingClassrooms.classrooms || []);

                    // 각 강의실 생성 또는 업데이트
                    const savedRooms: string[] = [];
                    for (const room of allRooms) {
                      const existing = classroomsList.find((c: any) => c.name === room.name);
                      if (existing && existing.id) {
                        // 기존 강의실 업데이트 (zone 정보는 timetable_settings에 저장)
                        await classroomApi.update(existing.id, { 
                          name: room.name, 
                          capacity: existing.capacity || 20 
                        });
                        savedRooms.push(existing.id);
                      } else {
                        // 새 강의실 생성 (capacity 필수)
                        const created = await classroomApi.create({ 
                          name: room.name, 
                          capacity: 20 // 기본 수용 인원
                        });
                        if (created.classroom?.id) {
                          savedRooms.push(created.classroom.id);
                        } else if (created.id) {
                          // 응답 형식이 다를 수 있음
                          savedRooms.push(created.id);
                        }
                      }
                    }

                    // 시간표 설정에 강의실 ID 및 zones 정보 저장 (JSON 문자열로 변환)
                    // ⚠️ PARTIAL UPDATE: day_time_settings, operating_days, time_interval은 포함하지 않음
                    // 이 필드들이 undefined로 전달되면 기존 값이 유지됨 (백엔드에서 처리)
                    const payload = {
                      classroom_ids: savedRooms,
                      zones: JSON.stringify(zones) // zones를 JSON 문자열로 저장
                      // day_time_settings, operating_days, time_interval은 명시적으로 제외
                    };
                    
                    // 📦 timetable-settings payload 디버깅 로그
                    console.log('📦 timetable-settings payload (강의실 저장):', {
                      classroom_ids: payload.classroom_ids,
                      classroom_ids_length: payload.classroom_ids.length,
                      classroom_ids_types: payload.classroom_ids.map(id => ({
                        id,
                        type: typeof id,
                        isString: typeof id === 'string',
                        isUndefined: id === undefined,
                        isNull: id === null,
                        isEmpty: id === ''
                      })),
                      zones: payload.zones,
                      excluded_fields: ['day_time_settings', 'operating_days', 'time_interval'] // 제외된 필드 명시
                    });
                    
                    await timetableSettingsApi.save(payload);

                    alert('강의실 설정이 저장되었습니다.');
                    setIsRoomModalOpen(false);
                    if (onZonesChange) {
                      onZonesChange(zones);
                    }
                    // 저장 후 zones가 변경되면 App.tsx의 useEffect에서 classrooms가 자동 업데이트됨
                  } catch (err: any) {
                    console.error('강의실 설정 저장 실패:', err);
                    // 에러 메시지 개선 ([object Object] 방지)
                    const errorMessage = 
                      err?.message || 
                      err?.data?.message ||
                      err?.data?.error ||
                      (err?.data ? JSON.stringify(err.data) : null) ||
                      '강의실 설정 저장에 실패했습니다.';
                    alert(errorMessage);
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 운영 시간 수정 모달 */}
      {isOperatingHoursModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-lg text-gray-800">운영 시간 설정</h3>
              <button 
                onClick={() => setIsOperatingHoursModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm text-gray-800 mb-3">요일별 운영 시간</h4>
                <p className="text-sm text-gray-500 mb-4">학원의 요일별 운영 시간을 설정합니다</p>
                <div className="space-y-3">
                  {Object.entries(operatingHours).map(([day, hours]) => {
                    const dayHours = hours as { open: string; close: string; isOpen: boolean };
                    return (
                      <div key={day} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-700 min-w-[60px]">{dayNames[day]}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={dayHours.isOpen}
                                onChange={(e) => handleOperatingHourChange(day, 'isOpen', e.target.checked)}
                              />
                              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                            </label>
                            <span className={`text-sm ${dayHours.isOpen ? 'text-blue-600' : 'text-gray-400'}`}>
                              {dayHours.isOpen ? '운영' : '휴무'}
                            </span>
                          </div>
                        </div>
                        {dayHours.isOpen && (
                          <div className="flex items-center gap-2 pl-[84px]">
                            <input
                              type="time"
                              value={dayHours.open}
                              onChange={(e) => handleOperatingHourChange(day, 'open', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-500">~</span>
                            <input
                              type="time"
                              value={dayHours.close}
                              onChange={(e) => handleOperatingHourChange(day, 'close', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
              <button
                onClick={() => setIsOperatingHoursModalOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={async () => {
                  try {
                    const academyId = getAcademyId();
                    if (!academyId) {
                      alert('학원 ID가 없습니다. 다시 로그인해주세요.');
                      return;
                    }

                    // 운영 요일 추출
                    const operatingDays: string[] = [];
                    Object.entries(operatingHours).forEach(([day, hours]) => {
                      if (hours.isOpen) {
                        const dayMap: { [key: string]: string } = {
                          monday: '월',
                          tuesday: '화',
                          wednesday: '수',
                          thursday: '목',
                          friday: '금',
                          saturday: '토',
                          sunday: '일'
                        };
                        operatingDays.push(dayMap[day] || day);
                      }
                    });

                    // 요일별 시간 설정
                    const dayTimeSettings: { [key: string]: { start: string; end: string } } = {};
                    Object.entries(operatingHours).forEach(([day, hours]) => {
                      if (hours.isOpen) {
                        dayTimeSettings[day] = {
                          start: hours.open,
                          end: hours.close
                        };
                      }
                    });

                    // 운영 시간 설정 저장 (PARTIAL UPDATE)
                    // ⚠️ time_interval, classroom_ids, zones 등은 포함하지 않음 (기존 값 유지)
                    await timetableSettingsApi.save({
                      operating_days: operatingDays,
                      day_time_settings: dayTimeSettings
                    });

                    // 저장 성공 후 timetable-settings 재조회 및 state 갱신
                    try {
                      const timetableResponse = await timetableSettingsApi.get();
                      
                      // settings 파싱 함수 (응답 래핑 차이 제거)
                      const settings = (timetableResponse as any)?.data?.data ?? (timetableResponse as any)?.data ?? timetableResponse?.settings ?? timetableResponse;
                      
                      // dayTimeSettings 파싱 (snake_case 우선, camelCase fallback)
                      const reloadedDayTimeSettings = settings?.day_time_settings ?? settings?.dayTimeSettings ?? null;
                      
                      console.log('[SettingsPage] FINAL day_time_settings', reloadedDayTimeSettings);
                      
                      if (reloadedDayTimeSettings !== null) {
                        const reloadedHours: typeof operatingHours = {
                          monday: { open: '09:00', close: '22:00', isOpen: false },
                          tuesday: { open: '09:00', close: '22:00', isOpen: false },
                          wednesday: { open: '09:00', close: '22:00', isOpen: false },
                          thursday: { open: '09:00', close: '22:00', isOpen: false },
                          friday: { open: '09:00', close: '22:00', isOpen: false },
                          saturday: { open: '10:00', close: '18:00', isOpen: false },
                          sunday: { open: '10:00', close: '18:00', isOpen: false }
                        };
                        
                        Object.entries(reloadedDayTimeSettings).forEach(([day, time]: [string, any]) => {
                          if (reloadedHours[day as keyof typeof reloadedHours]) {
                            reloadedHours[day as keyof typeof reloadedHours] = {
                              open: time.start || reloadedHours[day as keyof typeof reloadedHours].open,
                              close: time.end || reloadedHours[day as keyof typeof reloadedHours].close,
                              isOpen: true
                            };
                          }
                        });
                        
                        if (onOperatingHoursChange) {
                          onOperatingHoursChange(reloadedHours);
                        }
                      }
                      
                      // time_interval 재조회 및 적용 (snake_case 우선, camelCase fallback)
                      const reloadedTimeInterval = settings?.time_interval ?? settings?.timeInterval ?? null;
                      if (reloadedTimeInterval !== null) {
                        const intervalMatch = String(reloadedTimeInterval).match(/(\d+)/);
                        if (intervalMatch && onClassIntervalChange) {
                          onClassIntervalChange(parseInt(intervalMatch[1], 10));
                        }
                      }
                      
                      // difficulties, classTypes 재조회 및 적용
                      if (settings?.difficulties && Array.isArray(settings.difficulties) && onDifficultiesChange) {
                        onDifficultiesChange(settings.difficulties);
                      }
                      if (settings?.class_types && Array.isArray(settings.class_types) && onClassTypesChange) {
                        onClassTypesChange(settings.class_types);
                      }
                    } catch (reloadErr) {
                      console.error('[SettingsPage] timetable-settings 재조회 실패:', reloadErr);
                      // 재조회 실패해도 저장은 성공했으므로 로컬 state만 업데이트
                      if (onOperatingHoursChange) {
                        onOperatingHoursChange(operatingHours);
                      }
                      if (onClassIntervalChange) {
                        onClassIntervalChange(classInterval);
                      }
                      if (onDifficultiesChange) {
                        onDifficultiesChange(difficulties);
                      }
                      if (onClassTypesChange) {
                        onClassTypesChange(classTypes);
                      }
                    }

                    alert('운영 시간 설정이 저장되었습니다.');
                    setIsOperatingHoursModalOpen(false);
                  } catch (err) {
                    console.error('운영 시간 설정 저장 실패:', err);
                    alert('운영 시간 설정 저장에 실패했습니다.');
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 수업 관리 설정 수정 모달 - 간단 버전 */}
      {isClassManagementModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-lg text-gray-800">수업 관리 설정</h3>
              <button 
                onClick={() => setIsClassManagementModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* 과목 설정 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm text-gray-800 mb-1">과목 설정</h4>
                    <p className="text-sm text-gray-500">수업에서 사용할 과목을 관리합니다</p>
                  </div>
                  <button 
                    onClick={() => setIsAddSubjectModalOpen(true)}
                    className="px-3 py-1 text-sm text-blue-500 hover:bg-blue-50 rounded transition-colors"
                  >
                    추가
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((subject, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                      style={{ 
                        backgroundColor: `${subject.color}20`,
                        color: subject.color
                      }}
                    >
                      <span>{subject.name}</span>
                      <button 
                        onClick={async () => {
                          const subjectToDelete = subjects[index];
                          if (!subjectToDelete) return;
                          
                          // API에서 과목 삭제
                          try {
                            // 먼저 API에서 과목 ID 찾기
                            const response = await subjectApi.getAll();
                            const subjectsData = Array.isArray(response) ? response : (response.subjects || []);
                            const subjectToDeleteData = subjectsData.find((s: any) => 
                              (s.name || s.subject_name) === subjectToDelete.name
                            );
                            
                            if (subjectToDeleteData?.id) {
                              await subjectApi.delete(subjectToDeleteData.id);
                              // 성공 시 목록 다시 불러오기
                              const updatedResponse = await subjectApi.getAll();
                              const updatedSubjectsData = Array.isArray(updatedResponse) ? updatedResponse : (updatedResponse.subjects || []);
                              const formattedSubjects = updatedSubjectsData.map((subject: any) => ({
                                name: subject.name || subject.subject_name || '',
                                color: subject.color || '#3b82f6'
                              })).filter((s: any) => s.name);
                              setSubjects(formattedSubjects);
                              if (onSubjectsChange) {
                                onSubjectsChange(formattedSubjects);
                              }
                            } else {
                              // ID를 찾을 수 없으면 로컬에서만 삭제
                              setSubjects(subjects.filter((_, i) => i !== index));
                            }
                          } catch (err) {
                            console.error('과목 삭제 실패:', err);
                            alert('과목 삭제에 실패했습니다.');
                          }
                        }}
                        className="hover:opacity-70"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 횟수 설정 */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm text-gray-800 mb-1">횟수 설정</h4>
                    <p className="text-sm text-gray-500">수업 횟수 옵션을 관리합니다</p>
                  </div>
                  <button 
                    onClick={() => setIsAddFrequencyModalOpen(true)}
                    className="px-3 py-1 text-sm text-blue-500 hover:bg-blue-50 rounded transition-colors"
                  >
                    추가
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {frequencies.map((freq, index) => (
                    <div key={index} className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      <span>{freq}</span>
                      <button 
                        onClick={() => setFrequencies(frequencies.filter((_, i) => i !== index))}
                        className="hover:text-gray-900"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 수강료 설정 */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm text-gray-800 mb-1">수강료 설정</h4>
                    <p className="text-sm text-gray-500">과목별 수강료를 관리합니다</p>
                  </div>
                  <button 
                    onClick={() => setIsAddTuitionModalOpen(true)}
                    className="px-3 py-1 text-sm text-blue-500 hover:bg-blue-50 rounded transition-colors"
                  >
                    추가
                  </button>
                </div>
                <div className="space-y-2">
                  {tuitions.map((tuition, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{tuition.subject}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">₩{tuition.amount.toLocaleString()}</span>
                        <span className="text-sm text-gray-500">/ 월</span>
                        <button 
                          onClick={() => setTuitions(tuitions.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 결제 방법 설정 */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm text-gray-800 mb-1">결제 방법 설정</h4>
                    <p className="text-sm text-gray-500">수강료 결제 방법을 관리합니다</p>
                  </div>
                  <button 
                    onClick={() => setIsAddPaymentMethodModalOpen(true)}
                    className="px-3 py-1 text-sm text-blue-500 hover:bg-blue-50 rounded transition-colors"
                  >
                    추가
                  </button>
                </div>
                <div className="space-y-3">
                  {paymentMethods.map((method, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-700">{method.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={method.enabled}
                            onChange={(e) => {
                              const updated = [...paymentMethods];
                              updated[index].enabled = e.target.checked;
                              setPaymentMethods(updated);
                            }}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                        <button 
                          onClick={() => setPaymentMethods(paymentMethods.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-700 text-sm ml-2"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 난이도 설정 */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm text-gray-800 mb-1">수업 난이도 설정</h4>
                    <p className="text-sm text-gray-500">수업 난이도 옵션을 관리합니다</p>
                  </div>
                  <button 
                    onClick={() => setIsAddDifficultyModalOpen(true)}
                    className="px-3 py-1 text-sm text-blue-500 hover:bg-blue-50 rounded transition-colors"
                  >
                    추가
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {difficulties.map((difficulty, index) => (
                    <div key={index} className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      <span>{difficulty}</span>
                      <button 
                        onClick={() => setDifficulties(difficulties.filter((_, i) => i !== index))}
                        className="hover:text-purple-900"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 수업 유형 설정 */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm text-gray-800 mb-1">수업 유형 설정</h4>
                    <p className="text-sm text-gray-500">수업 유형 옵션을 관리합니다</p>
                  </div>
                  <button 
                    onClick={() => setIsAddClassTypeModalOpen(true)}
                    className="px-3 py-1 text-sm text-blue-500 hover:bg-blue-50 rounded transition-colors"
                  >
                    추가
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {classTypes.map((type, index) => (
                    <div key={index} className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                      <span>{type}</span>
                      <button 
                        onClick={() => {
                          const updatedClassTypes = classTypes.filter((_, i) => i !== index);
                          setClassTypes(updatedClassTypes);
                          if (onClassTypesChange) {
                            onClassTypesChange(updatedClassTypes);
                          }
                        }}
                        className="hover:text-orange-900"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 정규 수업 시간 간격 */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm text-gray-800 mb-3">정규 수업 시간 간격</h4>
                <p className="text-sm text-gray-500 mb-4">한 수업당 진행되는 시간을 설정합니다</p>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={classInterval}
                      onChange={(e) => setClassInterval(Number(e.target.value))}
                      min="10"
                      max="180"
                      step="5"
                      className="w-24 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">분</span>
                    <span className="text-xs text-gray-500">(1타임 기준)</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
              <button
                onClick={() => setIsClassManagementModalOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={async () => {
                  try {
                    const academyId = getAcademyId();
                    if (!academyId) {
                      alert('학원 ID를 찾을 수 없습니다. 다시 로그인해주세요.');
                      return;
                    }

                    // 수업 난이도, 수업 유형, 정규 수업 시간 간격 저장 (PARTIAL UPDATE)
                    // ⚠️ day_time_settings, operating_days, classroom_ids, zones 등은 포함하지 않음 (기존 값 유지)
                    await timetableSettingsApi.save({
                      difficulties: difficulties,
                      class_types: classTypes,
                      time_interval: `${classInterval}분`
                    });

                    alert('수업 관리 설정이 저장되었습니다.');
                    setIsClassManagementModalOpen(false);
                    if (onSubjectsChange) {
                      onSubjectsChange(subjects);
                    }
                    if (onDifficultiesChange) {
                      onDifficultiesChange(difficulties);
                    }
                    if (onClassTypesChange) {
                      onClassTypesChange(classTypes);
                    }
                    if (onClassIntervalChange) {
                      onClassIntervalChange(classInterval);
                    }
                  } catch (err) {
                    console.error('수업 관리 설정 저장 실패:', err);
                    alert('수업 관리 설정 저장에 실패했습니다.');
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 과목 추가 모달 */}
      {isAddSubjectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg text-gray-800">과목 추가</h3>
              <button 
                onClick={() => {
                  setIsAddSubjectModalOpen(false);
                  setNewSubject({ name: '', color: '#3b82f6' });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">과목명</label>
                <input
                  type="text"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  placeholder="예: 한국어 고급"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">과목 컬러</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#eab308',
                    '#ef4444', '#f97316', '#14b8a6', '#6366f1', '#84cc16'
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewSubject({ ...newSubject, color })}
                      className={`w-10 h-10 rounded-lg transition-all hover:scale-110 ${
                        newSubject.color === color ? 'ring-4 ring-offset-2 ring-gray-300' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {newSubject.color === color && (
                        <div className="flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsAddSubjectModalOpen(false);
                  setNewSubject({ name: '', color: '#3b82f6' });
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={async () => {
                  if (newSubject.name.trim()) {
                    try {
                      // API에 과목 추가
                      await subjectApi.create({
                        name: newSubject.name,
                        color: newSubject.color
                      });
                      // 성공 시 목록 다시 불러오기
                      const response = await subjectApi.getAll();
                      const subjectsData = Array.isArray(response) ? response : (response.subjects || []);
                      const formattedSubjects = subjectsData.map((subject: any) => ({
                        name: subject.name || subject.subject_name || '',
                        color: subject.color || '#3b82f6'
                      })).filter((s: any) => s.name);
                      setSubjects(formattedSubjects);
                      if (onSubjectsChange) {
                        onSubjectsChange(formattedSubjects);
                      }
                      setIsAddSubjectModalOpen(false);
                      setNewSubject({ name: '', color: '#3b82f6' });
                    } catch (err) {
                      console.error('과목 추가 실패:', err);
                      alert('과목 추가에 실패했습니다.');
                    }
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 횟수 추가 모달 */}
      {isAddFrequencyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg text-gray-800">횟수 추가</h3>
              <button 
                onClick={() => {
                  setIsAddFrequencyModalOpen(false);
                  setNewFrequency('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm text-gray-700 mb-2">횟수</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={newFrequency}
                  onChange={(e) => setNewFrequency(e.target.value)}
                  placeholder="예: 1, 2, 3..."
                  min="1"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">회</span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsAddFrequencyModalOpen(false);
                  setNewFrequency('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (newFrequency && !frequencies.includes(`${newFrequency}회`)) {
                    setFrequencies([...frequencies, `${newFrequency}회`]);
                    setIsAddFrequencyModalOpen(false);
                    setNewFrequency('');
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 수강료 추가 모달 */}
      {isAddTuitionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg text-gray-800">수강료 추가</h3>
              <button 
                onClick={() => {
                  setIsAddTuitionModalOpen(false);
                  setNewTuition({ subject: '', amount: '' });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">제목</label>
                <input
                  type="text"
                  value={newTuition.subject}
                  onChange={(e) => setNewTuition({ ...newTuition, subject: e.target.value })}
                  placeholder="예: 한국어 기초, 회화반 등"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">금액 (월)</label>
                <input
                  type="number"
                  value={newTuition.amount}
                  onChange={(e) => setNewTuition({ ...newTuition, amount: e.target.value })}
                  placeholder="200000"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsAddTuitionModalOpen(false);
                  setNewTuition({ subject: '', amount: '' });
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (newTuition.subject && newTuition.amount) {
                    setTuitions([...tuitions, { subject: newTuition.subject, amount: Number(newTuition.amount) }]);
                    setIsAddTuitionModalOpen(false);
                    setNewTuition({ subject: '', amount: '' });
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 결제 방법 추가 모달 */}
      {isAddPaymentMethodModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg text-gray-800">결제 방법 추가</h3>
              <button 
                onClick={() => {
                  setIsAddPaymentMethodModalOpen(false);
                  setNewPaymentMethod('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm text-gray-700 mb-2">결제 방법</label>
              <input
                type="text"
                value={newPaymentMethod}
                onChange={(e) => setNewPaymentMethod(e.target.value)}
                placeholder="예: 네이버페이, 카카오페이 등"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsAddPaymentMethodModalOpen(false);
                  setNewPaymentMethod('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (newPaymentMethod.trim() && !paymentMethods.find(m => m.name === newPaymentMethod.trim())) {
                    setPaymentMethods([...paymentMethods, { name: newPaymentMethod.trim(), enabled: true }]);
                    setIsAddPaymentMethodModalOpen(false);
                    setNewPaymentMethod('');
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 난이도 추가 모달 */}
      {isAddDifficultyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg text-gray-800">수업 난이도 추가</h3>
              <button 
                onClick={() => {
                  setIsAddDifficultyModalOpen(false);
                  setNewDifficulty('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm text-gray-700 mb-2">난이도</label>
              <input
                type="text"
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value)}
                placeholder="예: 입문, 기초, 중급 등"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsAddDifficultyModalOpen(false);
                  setNewDifficulty('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (newDifficulty.trim() && !difficulties.includes(newDifficulty.trim())) {
                    setDifficulties([...difficulties, newDifficulty.trim()]);
                    setIsAddDifficultyModalOpen(false);
                    setNewDifficulty('');
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 수업 유형 추가 모달 */}
      {isAddClassTypeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg text-gray-800">수업 유형 추가</h3>
              <button 
                onClick={() => {
                  setIsAddClassTypeModalOpen(false);
                  setNewClassType('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm text-gray-700 mb-2">수업 유형</label>
              <input
                type="text"
                value={newClassType}
                onChange={(e) => setNewClassType(e.target.value)}
                placeholder="예: 1:1 수업, 소그룹 수업 등"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsAddClassTypeModalOpen(false);
                  setNewClassType('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (newClassType.trim() && !classTypes.includes(newClassType.trim())) {
                    const updatedClassTypes = [...classTypes, newClassType.trim()];
                    setClassTypes(updatedClassTypes);
                    setIsAddClassTypeModalOpen(false);
                    setNewClassType('');
                    if (onClassTypesChange) {
                      onClassTypesChange(updatedClassTypes);
                    }
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

