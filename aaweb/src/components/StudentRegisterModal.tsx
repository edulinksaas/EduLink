import { X, Upload, Camera } from 'lucide-react';
import { useState, useRef } from 'react';

interface StudentRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects?: string[];
  teachers?: { id: string; name: string; workDays: string[] }[];
  classes?: { 
    id: string; 
    name: string; 
    subject: string; 
    days: string[]; 
    teacher: string;
  }[];
  sessionCounts?: string[];
  tuitionFees?: string[];
  paymentMethods?: string[];
}

export function StudentRegisterModal({ 
  isOpen, 
  onClose,
  subjects = ['한국어 문법', '한국어 회화', 'TOPIK 대비', '비즈니스 한국어'],
  teachers = [
    { id: '1', name: '김민수', workDays: ['월', '화', '수', '목', '금'] },
    { id: '2', name: '이지은', workDays: ['월', '수', '금'] },
    { id: '3', name: '박서준', workDays: ['화', '목', '토'] }
  ],
  classes = [
    { id: '1', name: '월,수 한국어 문법 초급', subject: '한국어 문법', days: ['월', '수'], teacher: '1' },
    { id: '2', name: '화,목 한국어 회화 중급', subject: '한국어 회화', days: ['화', '목'], teacher: '2' },
    { id: '3', name: '월,수,금 TOPIK 대비 고급', subject: 'TOPIK 대비', days: ['월', '수', '금'], teacher: '1' }
  ],
  sessionCounts = ['주 1회', '주 2회', '주 3회', '주 4회', '주 5회'],
  tuitionFees = ['100,000원', '150,000원', '200,000원', '250,000원', '300,000원'],
  paymentMethods = ['현금', '카드', '계좌이체', '무통장입금']
}: StudentRegisterModalProps) {
  const [studentName, setStudentName] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [parentContact, setParentContact] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>('');
  const [selectedSessionCount, setSelectedSessionCount] = useState('');
  const [selectedTuitionFee, setSelectedTuitionFee] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const days = ['월', '화', '수', '목', '금', '토', '일'];

  // 요일 토글
  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // 필터링된 수업 목록 (과목, 요일, 담당 선생님 조건에 맞는 수업)
  const filteredClasses = classes.filter(cls => {
    const subjectMatch = selectedSubject ? cls.subject === selectedSubject : true;
    const daysMatch = selectedDays.length > 0 
      ? selectedDays.every(day => cls.days.includes(day)) && cls.days.every(day => selectedDays.includes(day))
      : true;
    const teacherMatch = selectedTeacher ? cls.teacher === selectedTeacher : true;
    
    return subjectMatch && daysMatch && teacherMatch;
  });

  // 파일 선택 처리
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 파일 삭제
  const handleRemoveFile = () => {
    setReceiptFile(null);
    setReceiptPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  if (!isOpen) return null;

  const handleSubmit = () => {
    // 등록 로직
    console.log({
      studentName,
      selectedSubject,
      selectedDays,
      selectedTeacher,
      selectedClass,
      parentContact,
      receiptFile,
      selectedSessionCount,
      selectedTuitionFee,
      selectedPaymentMethod
    });
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[59]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-[60] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg text-gray-800">학생 등록</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4">
          {/* 학생 이름 */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">
              학생 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="학생 이름을 입력하세요"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 과목 */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">
              과목 <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => (
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

          {/* 요일 */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">
              요일 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-7 gap-2">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-2 rounded border transition-colors ${
                    selectedDays.includes(day)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            {selectedDays.length > 0 && (
              <p className="text-xs text-blue-600 mt-2">
                선택된 요일: {selectedDays.join(', ')}
              </p>
            )}
          </div>

          {/* 담당 선생님 */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">
              담당 선생님 <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {teachers.map((teacher) => (
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
              ))}
            </div>
          </div>

          {/* 수업 이름 */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">
              수업 이름 <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">조건에 맞는 수업을 선택하세요</option>
              {filteredClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
            {(selectedSubject || selectedDays.length > 0 || selectedTeacher) && filteredClasses.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                선택한 조건에 맞는 수업이 없습니다
              </p>
            )}
            {filteredClasses.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {filteredClasses.length}개의 수업이 조건에 맞습니다
              </p>
            )}
          </div>

          {/* 학부모 연락처 */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">
              학부모 연락처 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="010-0000-0000"
              value={parentContact}
              onChange={(e) => setParentContact(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 영수증 등록하기 */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">
              영수증 등록하기
            </label>
            
            {!receiptPreview ? (
              <div className="space-y-2">
                {/* 파일 선택 버튼 */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded hover:border-blue-500 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-blue-500"
                >
                  <Upload className="w-5 h-5" />
                  파일 선택
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {/* 카메라 촬영 버튼 (모바일) */}
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded hover:border-blue-500 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-blue-500"
                >
                  <Camera className="w-5 h-5" />
                  사진 촬영
                </button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative">
                <img 
                  src={receiptPreview} 
                  alt="영수증 미리보기" 
                  className="w-full h-48 object-cover rounded border border-gray-300"
                />
                <button
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  {receiptFile?.name}
                </p>
              </div>
            )}
          </div>

          {/* 횟수 */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">
              횟수 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {sessionCounts.map((count) => (
                <button
                  key={count}
                  onClick={() => setSelectedSessionCount(count)}
                  className={`px-3 py-2 rounded border text-sm transition-colors ${
                    selectedSessionCount === count
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* 수강료 */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">
              수강료 <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedTuitionFee}
              onChange={(e) => setSelectedTuitionFee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">선택하세요</option>
              {tuitionFees.map((fee) => (
                <option key={fee} value={fee}>
                  {fee}
                </option>
              ))}
            </select>
          </div>

          {/* 결제 방법 */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">
              결제 방법 <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">선택하세요</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
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
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded hover:from-blue-600 hover:to-purple-700 transition-colors"
          >
            등록하기
          </button>
        </div>
      </div>
    </>
  );
}
