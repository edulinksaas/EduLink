import { Search, Edit, Trash2, Plus, GraduationCap, Users, X, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { StudentRegisterModal } from './StudentRegisterModal';
import { TeacherRegisterModal } from './TeacherRegisterModal';
import { ClassRegisterModal } from './ClassRegisterModal';
import { TeacherDetailPage } from './TeacherDetailPage';
import { teacherApi, ApiError } from '../utils/supabase/api';

interface AllTeachersProps {
  onBack: () => void;
  onTeacherClick?: (teacherId: number) => void;
  onRegisterClick?: () => void;
}

export function AllTeachers({ onBack: _onBack, onTeacherClick, onRegisterClick }: AllTeachersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isStudentRegisterModalOpen, setIsStudentRegisterModalOpen] = useState(false);
  const [isTeacherRegisterModalOpen, setIsTeacherRegisterModalOpen] = useState(false);
  const [isClassRegisterModalOpen, setIsClassRegisterModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API에서 선생님 데이터 가져오기
  useEffect(() => {
    const fetchTeachers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await teacherApi.getAll();
        setTeachers(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message || '선생님 목록을 불러오는데 실패했습니다.');
        } else {
          setError('선생님 목록을 불러오는데 실패했습니다.');
        }
        console.error('Failed to fetch teachers:', err);
        setTeachers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const stats = [
    {
      label: '주간 휴교자',
      value: '0',
      unit: '명'
    },
    {
      label: '주 수업시 근무자',
      value: teachers.length.toString(),
      unit: '명'
    }
  ];

  const displayTeachers = teachers;

  const filteredTeachers = displayTeachers.filter((teacher: any) => {
    const name = teacher.name || teacher.teacher_name || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // If a teacher is selected, show the detail page
  if (selectedTeacher) {
    const teacherId = displayTeachers.find((t: any) => (t.name || t.teacher_name) === selectedTeacher)?.id;
    return (
      <TeacherDetailPage 
        teacherId={teacherId || null}
        onBack={() => {
          setSelectedTeacher(null);
          _onBack();
        }} 
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">선생님 목록을 불러오는 중...</div>
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
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded text-gray-700">
                <GraduationCap className="w-5 h-5 text-yellow-600" />
                <span>전체 학생 페이지</span>
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded text-gray-700">
                <Users className="w-5 h-5 text-green-600" />
                <span>전체 선생님 페이지</span>
              </button>
            </li>
            <li>
              <button
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded text-blue-500"
                onClick={() => onRegisterClick && onRegisterClick()}
              >
                <Plus className="w-5 h-5" />
                <span>등록</span>
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded text-gray-700">
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
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded text-gray-700">
                <LogOut className="w-5 h-5 text-gray-500" />
                <span>로그아웃</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <main className="p-6">
        {/* Page Title */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-gray-800 mb-2">전체 선생님 현황</h1>
            <p className="text-sm text-gray-600">
              모든 선생님 정보를 한 곳에서 <span className="text-orange-500">손쉽게</span> <span className="text-blue-500">관리</span>하세요
            </p>
          </div>
          
          <div className="relative">
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              onClick={() => onRegisterClick && onRegisterClick()}
            >
              <Plus className="w-4 h-4" />
              <span>등록 하기</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-4">{stat.label}</div>
                <div className="text-gray-800">
                  <span className="text-4xl">{stat.value}</span>
                  <span className="text-xl ml-1">{stat.unit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Teachers List Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-gray-800">전체 선생님 목록</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="선생님명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Teachers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTeachers.map((teacher: any) => {
              const teacherName = teacher.name || teacher.teacher_name || '';
              const tags = teacher.tags || [];
              
              return (
                <div 
                  key={teacher.id} 
                  className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setSelectedTeacher(teacherName);
                    if (onTeacherClick) {
                      onTeacherClick(teacher.id);
                    }
                  }}
                >
                  {/* Teacher Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-800">{teacherName}</h3>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button className="p-1 text-blue-500 hover:bg-blue-50 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-red-500 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full border border-blue-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTeachers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              검색 결과가 없습니다.
            </div>
          )}
        </div>
      </main>

      {/* Student Register Modal */}
      <StudentRegisterModal
        isOpen={isStudentRegisterModalOpen}
        onClose={() => setIsStudentRegisterModalOpen(false)}
      />

      {/* Teacher Register Modal */}
      <TeacherRegisterModal
        isOpen={isTeacherRegisterModalOpen}
        onClose={() => setIsTeacherRegisterModalOpen(false)}
      />

      {/* Class Register Modal */}
      <ClassRegisterModal
        isOpen={isClassRegisterModalOpen}
        onClose={() => setIsClassRegisterModalOpen(false)}
      />
    </div>
  );
}
