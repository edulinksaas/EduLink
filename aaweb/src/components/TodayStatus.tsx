import { Search, Plus, ChevronDown, Edit, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { studentApi } from '../utils/supabase/api';

interface TodayStatusProps {
  onBack: () => void;
  onStudentClick?: (studentId: number) => void;
  onTeacherClick?: (teacherId: number) => void;
  onRegisterClick?: () => void;
}

export function TodayStatus({ onBack: _onBack, onStudentClick, onTeacherClick, onRegisterClick }: TodayStatusProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('전체');
  const [todayData, setTodayData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API에서 오늘 현황 데이터 가져오기
  useEffect(() => {
    const fetchTodayData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 오늘 등록된 학생 데이터 가져오기
        const students = await studentApi.getAll();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayStudents = Array.isArray(students) ? students.filter((student: any) => {
          const createdDate = new Date(student.created_at || student.createdAt);
          createdDate.setHours(0, 0, 0, 0);
          return createdDate.getTime() === today.getTime();
        }) : [];

        // 학생 데이터를 TodayStatus 형식으로 변환
        const formattedData = todayStudents.map((student: any, index: number) => ({
          id: student.id || index + 1,
          category: '신규', // 오늘 등록된 학생은 모두 신규
          studentName: student.name || '',
          course: student.class_name || '-',
          subject: student.subject || '-',
          teacher: student.teacher_name || '-',
          phone: student.parent_contact || student.phone || '-',
          date: today.toISOString().split('T')[0],
          amount: student.fee ? `₩${typeof student.fee === 'number' ? student.fee.toLocaleString() : parseInt(student.fee, 10).toLocaleString()}` : '₩0',
          receipt: student.has_receipt || false,
          status: '완료',
          note: student.note || '-',
          gallery: '-'
        }));

        setTodayData(formattedData);
      } catch (err) {
        setError('오늘 현황 데이터를 불러오는데 실패했습니다.');
        console.error('Failed to fetch today data:', err);
        setTodayData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodayData();
  }, []);

  const totalPages = Math.ceil(todayData.length / 10) || 1;

  // 일 매출 계산
  const dailySales = todayData.reduce((sum, item) => {
    if (!item.amount) return sum;
    const amountStr = typeof item.amount === 'string' ? item.amount : String(item.amount);
    const amount = parseInt(amountStr.replace(/[^\d]/g, '')) || 0;
    return sum + amount;
  }, 0);

  // 금일 신규 등록 인원 계산
  const newRegistrations = todayData.filter(item => item.category === '신규').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">로딩 중...</div>
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
    <div className="p-4 pt-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl text-gray-800">금일 현황</h1>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={() => onRegisterClick?.()}
        >
          <Plus className="w-4 h-4" />
          <span>등록 하기</span>
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 flex items-center gap-3">
        <div className="relative">
          <button
            className="h-[42px] px-4 py-2 border border-gray-300 rounded bg-white text-gray-700 flex items-center gap-2 min-w-[120px]"
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
          >
            <span>{selectedFilter}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {isFilterDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setIsFilterDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                <button 
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 border-b border-gray-100"
                  onClick={() => {
                    setIsFilterDropdownOpen(false);
                    setSelectedFilter('학생 이름');
                  }}
                >
                  <span>학생 이름</span>
                </button>
                <button 
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 border-b border-gray-100"
                  onClick={() => {
                    setIsFilterDropdownOpen(false);
                    setSelectedFilter('연락처');
                  }}
                >
                  <span>연락처</span>
                </button>
                <button 
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700"
                  onClick={() => {
                    setIsFilterDropdownOpen(false);
                    setSelectedFilter('담당 선생님');
                  }}
                >
                  <span>담당 선생님</span>
                </button>
              </div>
            </>
          )}
        </div>
        
        <div className="flex-1 relative max-w-md">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-[42px] w-full px-4 py-2 border border-gray-300 rounded pr-10"
          />
          <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="text-sm text-gray-600 mb-2">일 매출</div>
          <div className="text-2xl text-blue-600">₩{dailySales.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="text-sm text-gray-600 mb-2">금일 신규 등록 인원</div>
          <div className="text-2xl text-blue-600">{newRegistrations}명</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
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
            {todayData.map((row) => (
              <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="inline-block px-3 py-1 bg-blue-500 text-white text-xs rounded-full">
                    {row.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-blue-500 cursor-pointer hover:underline" onClick={() => onStudentClick?.(row.id)}>{row.studentName}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{row.course}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{row.subject}</td>
                <td className="px-4 py-3 text-sm text-blue-500 cursor-pointer hover:underline" onClick={() => onTeacherClick?.(row.id)}>{row.teacher}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{row.phone}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{row.amount}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    row.receipt 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {row.receipt ? '발급' : '미발급'}
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-center gap-2">
        <button 
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          처음
        </button>
        <button 
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          이전
        </button>
        
        {[1, 2, 3, 4, 5, 6].map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 border rounded ${
              currentPage === page
                ? 'bg-blue-500 text-white border-blue-500'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
        
        <button 
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          다음
        </button>
        <button 
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        >
          마지막
        </button>
      </div>
    </div>
  );
}
