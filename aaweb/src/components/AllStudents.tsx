import { Search, ChevronDown, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { StudentDetailPage } from './StudentDetailPage';
import { studentApi, ApiError } from '../utils/supabase/api';

interface AllStudentsProps {
  onBack: () => void;
  onStudentClick?: (studentId: number) => void;
  onRegisterClick?: () => void;
}

export function AllStudents({ onBack: _onBack, onStudentClick, onRegisterClick }: AllStudentsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('전체');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;

  const filterOptions = ['전체', '이름', '학년반', '과목'];

  // API에서 학생 데이터 가져오기
  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await studentApi.getAll();
        setStudents(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message || '학생 목록을 불러오는데 실패했습니다.');
        } else {
          setError('학생 목록을 불러오는데 실패했습니다.');
        }
        console.error('Failed to fetch students:', err);
        setStudents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // 전체 학생 수 계산
  const displayStudents = students;
  const totalStudents = displayStudents.length;

  // 월 신규 인원 수 계산 (현재 월: 2025년 1월)
  const currentMonth = '2025-01';
  const monthlyNewStudents = displayStudents.filter((student: any) => 
    student.category === '신규' && student.startDate && student.startDate.startsWith(currentMonth)
  ).length;

  const filteredStudents = displayStudents.filter((student: any) => {
    if (!searchTerm) return true;
    
    const name = student.name || student.student_name || '';
    const grade = student.grade || '';
    const subject = student.subject || '';
    
    switch (filterType) {
      case '이름':
        return name.toLowerCase().includes(searchTerm.toLowerCase());
      case '학년반':
        return grade.toLowerCase().includes(searchTerm.toLowerCase());
      case '과목':
        return subject.toLowerCase().includes(searchTerm.toLowerCase());
      default:
        return (
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subject.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  // If a student is selected, show the detail page
  if (selectedStudent) {
    const studentId = displayStudents.find((s: any) => (s.name || s.student_name) === selectedStudent)?.id;
    return (
      <StudentDetailPage 
        studentId={studentId || null}
        onBack={() => {
          setSelectedStudent(null);
          _onBack();
        }} 
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">학생 목록을 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div>
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl text-gray-800">전체 학생</h1>
      </div>

      {/* Search Section */}
      <div className="mb-6 flex items-center gap-3">
        <div className="relative">
          <button
            className="h-[42px] px-4 py-2 border border-gray-300 rounded bg-white text-gray-700 flex items-center gap-2 min-w-[120px]"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <span>{filterType}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {isFilterOpen && (
            <>
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setIsFilterOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                {filterOptions.map((option) => (
                  <button
                    key={option}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 border-b border-gray-100 last:border-b-0"
                    onClick={() => {
                      setFilterType(option);
                      setIsFilterOpen(false);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-[42px] w-full px-4 py-2 border border-gray-300 rounded pr-10"
          />
          <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
        </div>

        <button 
          className="h-[42px] flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors ml-auto"
          onClick={() => onRegisterClick && onRegisterClick()}
        >
          <Plus className="w-4 h-4" />
          <span>등록 하기</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-sm text-gray-600 mb-2">월 신규 인원 수</div>
          <div className="text-2xl text-blue-600">{monthlyNewStudents}명</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-sm text-gray-600 mb-2">전체 학생 수</div>
          <div className="text-2xl text-blue-600">{totalStudents}명</div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm text-gray-700">카테고리</th>
                <th className="px-4 py-3 text-left text-sm text-gray-700">학생 이름</th>
                <th className="px-4 py-3 text-left text-sm text-gray-700">수업명</th>
                <th className="px-4 py-3 text-left text-sm text-gray-700">과목</th>
                <th className="px-4 py-3 text-left text-sm text-gray-700">담당 선생님</th>
                <th className="px-4 py-3 text-left text-sm text-gray-700">연락처</th>
                <th className="px-4 py-3 text-left text-sm text-gray-700">수강료</th>
                <th className="px-4 py-3 text-left text-sm text-gray-700">영수증 유무</th>
                <th className="px-4 py-3 text-center text-sm text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.map((student: any, index: number) => {
                const studentName = student.name || student.student_name || '';
                const lesson = student.lesson || '';
                const subject = student.subject || '';
                const teacher = student.teacher || '';
                const phone = student.phone || '';
                const fee = student.fee || '';
                const receipt = student.receipt !== undefined ? student.receipt : true;
                const category = student.category || '재원';
                
                return (
                  <tr key={student.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        category === '신규' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      <button 
                        onClick={() => {
                          setSelectedStudent(studentName);
                          if (onStudentClick) onStudentClick(student.id);
                        }}
                        className="hover:text-blue-600 hover:underline transition-colors"
                      >
                        {studentName}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{lesson}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{subject}</td>
                    <td className="px-4 py-3 text-sm text-blue-500 cursor-pointer hover:underline">{teacher}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">₩{fee}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        receipt 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {receipt ? '발급' : '미발급'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1 text-blue-500 hover:bg-blue-50 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-red-500 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <div className="flex gap-1">
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded ${
                  currentPage === pageNum
                    ? 'bg-blue-500 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
