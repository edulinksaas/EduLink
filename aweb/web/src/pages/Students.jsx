import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAcademy } from '../contexts/AcademyContext';
import { studentService } from '../services/studentService';
import { academyService } from '../services/academyService';
import { classService } from '../services/classService';
import { teacherService } from '../services/teacherService';
import { subjectService } from '../services/subjectService';
import { tuitionFeeService } from '../services/tuitionFeeService';
import { parentService } from '../services/parentService';
import { checkAndDeleteEmptyClass } from '../utils/classAutoDelete';
import Modal from '../components/Modal';
import RegisterModal from '../components/RegisterModal';
import './Students.css';

const Students = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { academy, academyId, loading: academyLoading } = useAcademy();
  const [category, setCategory] = useState('학생명');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [academies, setAcademies] = useState([]);
  const [selectedAcademy, setSelectedAcademy] = useState('');
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  
  // 학부모 조회 관련 상태
  // const [checkingParent, setCheckingParent] = useState(false);
  // const [parentCheckResult, setParentCheckResult] = useState(null);
  
  // 폼 데이터 상태
  const [formData, setFormData] = useState({
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

  // AcademyContext의 academy 정보를 사용하여 selectedAcademy 설정
  useEffect(() => {
    if (academy && academy.id) {
      console.log('✅ AcademyContext에서 학원 정보 로드:', {
        id: academy.id,
        name: academy.name,
        code: academy.code
      });
      setAcademies([academy]);
      setSelectedAcademy(academy.id);
    } else if (!academyLoading) {
      // AcademyContext에 없으면 API로 로드 (폴백)
      console.log('⚠️ AcademyContext에 학원 정보가 없어 API로 로드 시도');
      loadAcademies();
    }
  }, [academy, academyLoading]);

  useEffect(() => {
    if (selectedAcademy) {
      loadClasses();
      loadTeachers();
      loadSubjects();
      loadStudents();
      loadFees();
    }
  }, [selectedAcademy]);

  // URL 파라미터로 모달 자동 열기
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'register' && selectedAcademy && !isModalOpen) {
      setIsModalOpen(true);
      // URL에서 파라미터 제거
      setSearchParams({});
    }
  }, [selectedAcademy, searchParams, setSearchParams, isModalOpen]);

  // URL 파라미터로 선생님 필터링
  useEffect(() => {
    const teacherIdFromUrl = searchParams.get('teacher_id');
    if (teacherIdFromUrl && teachers.length > 0) {
      // URL에 teacher_id가 있고, 선생님 목록이 로드되었으면 필터링 설정
      const teacherExists = teachers.find(t => t.id === teacherIdFromUrl);
      if (teacherExists && formData.teacher_id !== teacherIdFromUrl) {
        setFormData(prev => ({
          ...prev,
          teacher_id: teacherIdFromUrl
        }));
      }
    }
  }, [searchParams, teachers, formData.teacher_id]);

  // 학부모 연락처 자동 생성 함수
  const generateParentContact = () => {
    const middle = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const last = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `010-${middle}-${last}`;
  };

  // 학생 등록 모달이 열릴 때 학부모 연락처 자동 생성
  useEffect(() => {
    if (isModalOpen && !formData.parent_contact) {
      setFormData(prev => ({
        ...prev,
        parent_contact: generateParentContact()
      }));
    }
  }, [isModalOpen]);

  const loadAcademies = async () => {
    try {
      // 로그인한 사용자의 학원 정보를 우선 사용
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData.academy_id) {
            console.log('✅ 로그인한 사용자의 학원 ID 사용:', userData.academy_id);
            setSelectedAcademy(userData.academy_id);
            // 학원 정보도 가져오기
            try {
              const response = await academyService.getById(userData.academy_id);
              const academyData = response.data.academy;
              if (academyData) {
                setAcademies([academyData]);
                return;
              }
            } catch (apiError) {
              console.warn('학원 정보 API 로드 실패:', apiError);
            }
          }
        } catch (e) {
          console.error('사용자 정보 파싱 실패:', e);
        }
      }
      
      // 폴백: 모든 학원 목록에서 첫 번째 선택
      const response = await academyService.getAll();
      const academiesList = response.data.academies || [];
      setAcademies(academiesList);
      if (academiesList.length > 0) {
        console.log('⚠️ 첫 번째 학원 자동 선택:', academiesList[0].id);
        setSelectedAcademy(academiesList[0].id);
      }
    } catch (error) {
      console.error('학원 목록 로드 실패:', error);
    }
  };

  const loadClasses = async () => {
    if (!selectedAcademy) return;
    try {
      const response = await classService.getAll(selectedAcademy);
      setClasses(response.data.classes || []);
    } catch (error) {
      console.error('수업 목록 로드 실패:', error);
      setClasses([]);
    }
  };

  const loadTeachers = async () => {
    if (!selectedAcademy) return;
    try {
      const response = await teacherService.getAll(selectedAcademy);
      setTeachers(response.data.teachers || []);
    } catch (error) {
      console.error('선생님 목록 로드 실패:', error);
      setTeachers([]);
    }
  };

  const loadSubjects = async () => {
    if (!selectedAcademy) return;
    try {
      const response = await subjectService.getAll(selectedAcademy);
      setSubjects(response.data.subjects || []);
    } catch (error) {
      console.error('과목 목록 로드 실패:', error);
      setSubjects([]);
    }
  };

  const loadStudents = async () => {
    if (!selectedAcademy) return;
    try {
      console.log('📤 학생 목록 로드 시작, academy_id:', selectedAcademy);
      const response = await studentService.getAll(selectedAcademy);
      console.log('📥 학생 목록 응답:', response);
      console.log('   response.data:', response.data);
      console.log('   response.data.students:', response.data?.students);
      const studentsList = response.data?.students || response.data || [];
      console.log('   최종 학생 목록:', studentsList.length, '명');
      setStudents(studentsList);
    } catch (error) {
      console.error('학생 목록 로드 실패:', error);
      setStudents([]);
    }
  };

  const loadFees = async () => {
    if (!selectedAcademy) return;
    
    try {
      const response = await tuitionFeeService.getAll(selectedAcademy);
      const fees = response.fees || response.data?.fees || [];
      
      if (fees && fees.length > 0) {
        const formattedFees = fees.map(fee => ({
          id: fee.id,
          amount: fee.amount,
          value: fee.value ? fee.value.toString() : String(fee.value || '0'),
          class_type: fee.class_type || null,
          payment_method: fee.payment_method || null
        }));
        setFees(formattedFees);
      } else {
        // DB에 수강료가 없으면 로컬 스토리지에서 로드
        try {
          const saved = localStorage.getItem('tuitionFees');
          if (saved) {
            const localFees = JSON.parse(saved);
            setFees(Array.isArray(localFees) ? localFees : []);
          } else {
            // 기본 수강료 목록
            const defaultFees = [
              { id: '1', amount: '100,000원', value: '100000' },
              { id: '2', amount: '150,000원', value: '150000' },
              { id: '3', amount: '200,000원', value: '200000' },
              { id: '4', amount: '250,000원', value: '250000' },
              { id: '5', amount: '300,000원', value: '300000' },
            ];
            setFees(defaultFees);
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
          setFees(Array.isArray(localFees) ? localFees : []);
        } else {
          // 기본 수강료 목록
          const defaultFees = [
            { id: '1', amount: '100,000원', value: '100000' },
            { id: '2', amount: '150,000원', value: '150000' },
            { id: '3', amount: '200,000원', value: '200000' },
            { id: '4', amount: '250,000원', value: '250000' },
            { id: '5', amount: '300,000원', value: '300000' },
          ];
          setFees(defaultFees);
        }
      } catch (localError) {
        console.error('로컬 스토리지 로드 실패:', localError);
        setFees([]);
      }
    }
  };

  // 요일 목록
  const days = ['월', '화', '수', '목', '금', '토', '일'];

  // 담당 선생님의 출근 요일 필터링
  const availableDays = useMemo(() => {
    if (!formData.teacher_id) {
      return days;
    }
    const selectedTeacher = teachers.find(t => t.id === formData.teacher_id);
    if (!selectedTeacher || !selectedTeacher.work_days) {
      return days;
    }
    // work_days가 쉼표로 구분된 문자열인 경우 (예: "월,화,수")
    const workDaysArray = selectedTeacher.work_days.split(',').map(d => d.trim());
    return days.filter(d => workDaysArray.includes(d));
  }, [teachers, formData.teacher_id]);

  // 담당 선생님과 요일에 따라 필터링된 수업 목록
  const filteredClasses = useMemo(() => {
    if (!formData.teacher_id) {
      return classes;
    }
    // 선생님과 요일 모두 필터링
    let filtered = classes.filter(classItem => classItem.teacher_id === formData.teacher_id);
    if (formData.schedule) {
      filtered = filtered.filter(classItem => classItem.schedule === formData.schedule);
    }
    return filtered;
  }, [classes, formData.teacher_id, formData.schedule]);

  // 통계 계산
  const totalStudents = students.length;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based

  const getCreatedDate = (student) => {
    const created = student.createdAt || student.created_at;
    return created ? new Date(created) : null;
  };

  const monthlyStudents = students.filter((student) => {
    const createdDate = getCreatedDate(student);
    if (!createdDate) return false;
    return (
      createdDate.getFullYear() === currentYear &&
      createdDate.getMonth() === currentMonth
    );
  });

  const monthlyRegistrations = monthlyStudents.length;

  const monthlySales = monthlyStudents.reduce((sum, student) => {
    const feeValue =
      typeof student.fee === 'number'
        ? student.fee
        : student.fee
        ? parseInt(student.fee, 10)
        : 0;
    return sum + (Number.isNaN(feeValue) ? 0 : feeValue);
  }, 0);

  // 검색 및 선생님 필터링된 학생 목록
  const filteredStudents = useMemo(() => {
    let filtered = students;

    // 선생님 필터링
    if (formData.teacher_id) {
      filtered = filtered.filter(student => student.teacher_id === formData.teacher_id);
    }

    // 검색어 필터링
    if (!searchQuery.trim()) {
      return filtered;
    }

    const query = searchQuery.trim().toLowerCase();

    return filtered.filter((student) => {
      const classItem = classes.find((c) => c.id === student.class_id);
      const subjectItem = classItem ? subjects.find((s) => s.id === classItem.subject_id) : null;
      const teacherItem = teachers.find((t) => t.id === student.teacher_id);

      switch (category) {
        case '학생명':
          return student.name.toLowerCase().includes(query);
        case '선생님명':
          return teacherItem && teacherItem.name.toLowerCase().includes(query);
        case '과목명':
          return subjectItem && subjectItem.name.toLowerCase().includes(query);
        case '연락처':
          return student.parent_contact && student.parent_contact.toLowerCase().includes(query);
        default:
          return true;
      }
    });
  }, [students, classes, subjects, teachers, category, searchQuery, formData.teacher_id]);

  const handleSearch = () => {
    // 검색은 useMemo로 자동 필터링되므로 여기서는 페이지를 1로 리셋
    setCurrentPage(1);
  };

  // 페이지네이션: 한 페이지당 10명씩 표시
  const studentsPerPage = 10;
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  // 검색어나 카테고리가 변경되면 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, category]);

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || '',
      parent_contact: student.parent_contact || '',
      payment_method: '현금',
      class_id: student.class_id || '',
      teacher_id: student.teacher_id || '',
      fee: '',
      receipt_file: null,
      note: student.note || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (student) => {
    if (!window.confirm(`${student.name} 학생 정보를 삭제하시겠습니까?`)) {
      return;
    }
    try {
      const classIdToCheck = student.class_id; // 삭제 전 수업 ID 저장
      await studentService.delete(student.id);
      
      // 학생 삭제 후 해당 수업에 학생이 없으면 수업도 자동 삭제
      if (classIdToCheck && selectedAcademy) {
        const deleted = await checkAndDeleteEmptyClass(classIdToCheck, selectedAcademy);
        if (deleted) {
          console.log('✅ 빈 수업이 자동으로 삭제되었습니다.');
          await loadClasses(); // 수업 목록 새로고침
        }
      }
      
      alert('학생 정보가 삭제되었습니다.');
      await loadStudents();
    } catch (error) {
      console.error('학생 삭제 실패:', error);
      alert('학생 삭제에 실패했습니다.');
    }
  };

  const handleRegister = () => {
    setRegisterModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'receipt_file') {
      setFormData(prev => ({
        ...prev,
        receipt_file: files[0] || null,
      }));
    } else {
      // 담당 선생님이 변경되면 요일과 수업 선택 초기화
      if (name === 'teacher_id') {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          schedule: '', // 요일 선택 초기화
          class_id: '', // 수업 선택 초기화
        }));
      } else if (name === 'schedule') {
        // 요일이 변경되면 수업 선택 초기화
        setFormData(prev => ({
          ...prev,
          [name]: value,
          class_id: '', // 수업 선택 초기화
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value,
        }));
      }
      
      // 학부모 연락처가 변경되면 조회 결과 초기화
      // if (name === 'parent_contact') {
      //   setParentCheckResult(null);
      // }
    }
  };

  // 학부모 연락처 조회 함수
  // const handleCheckParent = async () => {
  //   const phone = formData.parent_contact.trim();
  //   
  //   if (!phone) {
  //     alert('학부모 연락처를 입력해주세요.');
  //     return;
  //   }

  //   // 전화번호 형식 검증 (010-XXXX-XXXX 또는 숫자만)
  //   const phoneNumber = phone.replace(/[^0-9]/g, '');
  //   
  //   if (phoneNumber.length < 10 || phoneNumber.length > 11 || !phoneNumber.startsWith('010')) {
  //     alert('올바른 전화번호 형식이 아닙니다.\n010-XXXX-XXXX 형식으로 입력해주세요.');
  //     return;
  //   }

  //   setCheckingParent(true);
  //   setParentCheckResult(null);

  //   try {
  //     const response = await parentService.checkRegistration(phoneNumber);
  //     setParentCheckResult(response.data);
  //   } catch (error) {
  //     console.error('학부모 조회 실패:', error);
  //     alert('학부모 조회 중 오류가 발생했습니다.');
  //     setParentCheckResult({ registered: false, error: true });
  //   } finally {
  //     setCheckingParent(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!selectedAcademy) {
        alert('학원을 선택해주세요.');
        return;
      }

      if (!formData.name.trim()) {
        alert('학생 이름을 입력해주세요.');
        return;
      }

      // 학부모 연락처가 없으면 자동 생성
      const finalParentContact = formData.parent_contact.trim() || generateParentContact();

      if (!formData.class_id) {
        alert('수업을 선택해주세요.');
        return;
      }

      if (!formData.teacher_id) {
        alert('담당 선생님을 선택해주세요.');
        return;
      }

      if (!formData.schedule) {
        alert('요일을 선택해주세요.');
        return;
      }

      if (!formData.fee) {
        alert('수강료를 선택해주세요.');
        return;
      }

      const studentData = {
        name: formData.name,
        parent_contact: finalParentContact,
        note: formData.note,
        academy_id: selectedAcademy,
        class_id: formData.class_id || null,
        teacher_id: formData.teacher_id || null,
        schedule: formData.schedule || null,
        fee: formData.fee ? parseInt(formData.fee, 10) : null,
        has_receipt: !!formData.receipt_file,
      };

      if (editingStudent) {
        const oldClassId = editingStudent.class_id; // 수정 전 수업 ID 저장
        const newClassId = studentData.class_id; // 수정 후 수업 ID
        
        await studentService.update(editingStudent.id, studentData);
        
        // 수업이 변경되었고, 이전 수업에 학생이 없으면 수업 자동 삭제
        if (oldClassId && oldClassId !== newClassId && selectedAcademy) {
          const deleted = await checkAndDeleteEmptyClass(oldClassId, selectedAcademy);
          if (deleted) {
            console.log('✅ 빈 수업이 자동으로 삭제되었습니다.');
            await loadClasses(); // 수업 목록 새로고침
          }
        }
        
        alert('학생 정보가 수정되었습니다.');
      } else {
        await studentService.create(studentData);
        // TODO: 수강 등록도 함께 생성
        alert('학생이 등록되었습니다.');
      }

      setIsModalOpen(false);
      setEditingStudent(null);
      // setParentCheckResult(null); // 주석 처리됨
      setFormData({
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
      // 학생 목록 새로고침
      await loadStudents();
    } catch (error) {
      console.error('학생 저장 실패:', error);
      alert('학생 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 제목 결정: 선생님 필터링이 있으면 "선생님 이름 + 담당 학생", 없으면 "전체 학생"
  const pageTitle = useMemo(() => {
    if (formData.teacher_id) {
      const selectedTeacher = teachers.find(t => t.id === formData.teacher_id);
      if (selectedTeacher) {
        return `${selectedTeacher.name} 담당 학생`;
      }
    }
    return '전체 학생';
  }, [formData.teacher_id, teachers]);

  return (
    <div className="students-page">
      <div className="page-header">
        <h1 className="page-title">{pageTitle}</h1>
        {formData.teacher_id ? (
          // 선생님 담당 학생 페이지: 검색 창만 가운데 배치
          <div className="filter-section" style={{ justifyContent: 'center', width: '100%' }}>
            <div className="search-row">
              <select 
                className="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="학생명">학생명</option>
                <option value="선생님명">선생님명</option>
                <option value="과목명">과목명</option>
                <option value="연락처">연락처</option>
              </select>
              <div className="search-box">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button className="search-button" onClick={handleSearch}>
                  <span className="search-icon">🔍</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          // 전체 학생 페이지: 기존 레이아웃 유지
          <div className="filter-section">
            <div className="search-row">
              <select 
                className="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="학생명">학생명</option>
                <option value="선생님명">선생님명</option>
                <option value="과목명">과목명</option>
                <option value="연락처">연락처</option>
              </select>
              <div className="search-box">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button className="search-button" onClick={handleSearch}>
                  <span className="search-icon">🔍</span>
                </button>
              </div>
            </div>
            <button className="register-button" onClick={handleRegister}>
              <span className="register-icon">➕</span>
              등록하기
            </button>
          </div>
        )}
      </div>

      <div className="summary-cards">
        {/* <div className="summary-card">
          <div className="summary-card-title">월 매출</div>
          <div className="summary-card-value">₩{monthlySales.toLocaleString()}</div>
        </div> */}
        {!formData.teacher_id && (
          <>
            <div className="summary-card">
              <div className="summary-card-title">월 신규등록</div>
              <div className="summary-card-value">{monthlyRegistrations}명</div>
            </div>
            <div className="summary-card">
              <div className="summary-card-title">전체 학생 수</div>
              <div className="summary-card-value">{totalStudents}명</div>
            </div>
          </>
        )}
      </div>

      <div className="content-area">
        <table className="students-table">
          <thead>
            <tr>
              <th>카테고리</th>
              <th>학생 이름</th>
              <th>강의명</th>
              <th>과목</th>
              <th>담당 선생님</th>
              <th>연락처</th>
              <th>수강료</th>
              <th>영수증 유무</th>
              <th>비고</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.map((student) => {
              const classItem = classes.find((c) => c.id === student.class_id);
              const subjectItem = classItem ? subjects.find((s) => s.id === classItem.subject_id) : null;
              const teacherItem = teachers.find((t) => t.id === student.teacher_id);
              
              // 카테고리: 이번 달에 처음 등록된 학생이면 '신규', 그 외에는 '재등록'
              const createdDate = getCreatedDate(student);
              const isNewThisMonth =
                createdDate &&
                createdDate.getFullYear() === currentYear &&
                createdDate.getMonth() === currentMonth;
              const categoryLabel = isNewThisMonth ? '신규' : '재등록';
              return (
              <tr key={student.id}>
                <td>
                  <span
                    className={`category-badge ${
                      categoryLabel === '신규' ? 'category-new' : 'category-renewal'
                    }`}
                  >
                    {categoryLabel}
                  </span>
                </td>
                <td
                  style={{ cursor: 'pointer', color: '#3498db', fontWeight: 500 }}
                  onClick={() => navigate(`/students/${student.id}`)}
                >
                  {student.name}
                </td>
                <td>{classItem ? classItem.name : '-'}</td>
                <td>{subjectItem ? subjectItem.name : '-'}</td>
                <td>{teacherItem ? teacherItem.name : '-'}</td>
                <td>{student.parent_contact || '-'}</td>
                <td>
                  {typeof student.fee === 'number' && !Number.isNaN(student.fee)
                    ? `${student.fee.toLocaleString()}원`
                    : '-'}
                </td>
                <td>
                  {student.has_receipt ? '유' : '무'}
                </td>
                <td>{student.note || '-'}</td>
                <td>
                  <div className="actions-cell">
                    <button 
                      className="action-button edit-button"
                      onClick={() => handleEdit(student)}
                      title="수정"
                    >
                      <span className="action-icon">✏️</span>
                    </button>
                    <button 
                      className="action-button delete-button"
                      onClick={() => handleDelete(student)}
                      title="삭제"
                    >
                      <span className="action-icon">🗑️</span>
                    </button>
                  </div>
                </td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>

      {totalPages > 0 && (() => {
        // 한 번에 보여줄 페이지 번호 개수
        const pagesToShow = 10;
        
        // 현재 페이지가 속한 페이지 그룹 계산 (10개 단위)
        const currentGroup = Math.floor((currentPage - 1) / pagesToShow);
        const startPage = currentGroup * pagesToShow + 1;
        const endPage = Math.min(totalPages, startPage + pagesToShow - 1);
        
        const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
        
        // 다음 그룹의 시작 페이지
        const nextGroupStart = startPage + pagesToShow;
        // 이전 그룹의 시작 페이지
        const prevGroupStart = Math.max(1, startPage - pagesToShow);
        
        return (
          <div className="pagination">
            <button
              className="pagination-button"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              처음
            </button>
            <button
              className="pagination-button"
              onClick={() => {
                // 현재 그룹의 첫 페이지가 1이면 1로, 아니면 이전 그룹의 첫 페이지로
                if (startPage === 1) {
                  setCurrentPage(1);
                } else {
                  setCurrentPage(prevGroupStart);
                }
              }}
              disabled={currentPage === 1}
            >
              이전
            </button>
            {pageNumbers.map((page) => (
              <button
                key={page}
                className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="pagination-button"
              onClick={() => {
                // 다음 그룹이 존재하면 다음 그룹의 첫 페이지로, 아니면 다음 페이지로
                if (nextGroupStart <= totalPages) {
                  setCurrentPage(nextGroupStart);
                } else {
                  setCurrentPage(prev => Math.min(totalPages, prev + 1));
                }
              }}
              disabled={currentPage === totalPages}
            >
              다음
            </button>
            <button
              className="pagination-button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              마지막
            </button>
          </div>
        );
      })()}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStudent(null);
          // setParentCheckResult(null); // 주석 처리됨
          setFormData({
            name: '',
            parent_contact: '',
            payment_method: '현금',
            class_id: '',
            teacher_id: '',
            fee: '',
            receipt_file: null,
            note: '',
          });
        }}
        title={editingStudent ? '학생 정보 수정' : '학생 등록'}
      >
        <form onSubmit={handleSubmit} className="student-register-form">
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
                  value={formData.name}
                  onChange={handleInputChange}
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
                    const isSelected = formData.teacher_id === teacher.id;
                    return (
                      <button
                        key={teacher.id}
                        type="button"
                        onClick={() => {
                          handleInputChange({
                            target: {
                              name: 'teacher_id',
                              value: teacher.id
                            }
                          });
                        }}
                        style={{
                          padding: '10px 20px',
                          border: `2px solid ${isSelected ? '#667eea' : '#e0e0e0'}`,
                          borderRadius: '8px',
                          background: isSelected ? '#667eea' : 'white',
                          color: isSelected ? 'white' : '#2c3e50',
                          cursor: 'pointer',
                          fontSize: '0.95rem',
                          fontWeight: isSelected ? '600' : '500',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.target.style.borderColor = '#667eea';
                            e.target.style.background = '#f0f0ff';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
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
                    const isSelected = formData.schedule === day;
                    const isDisabled = !formData.teacher_id;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          if (!isDisabled) {
                            handleInputChange({
                              target: {
                                name: 'schedule',
                                value: day
                              }
                            });
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
                        {day}
                      </button>
                    );
                  })}
                </div>
                {!formData.teacher_id && (
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
                  value={formData.class_id}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.teacher_id || !formData.schedule}
                >
                  <option value="">
                    {!formData.teacher_id 
                      ? '담당 선생님을 먼저 선택하세요'
                      : !formData.schedule
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
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <input
                    type="text"
                    className="form-input"
                    name="parent_contact"
                    value={formData.parent_contact}
                    onChange={handleInputChange}
                    placeholder="010-1234-5678"
                    required
                    style={{ flex: 1 }}
                  />
                  {/* 조회 버튼 주석 처리 */}
                  {/* <button
                    type="button"
                    onClick={handleCheckParent}
                    disabled={checkingParent || !formData.parent_contact.trim()}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: checkingParent ? '#ccc' : '#3498db',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: checkingParent || !formData.parent_contact.trim() ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      whiteSpace: 'nowrap',
                      minWidth: '80px'
                    }}
                  >
                    {checkingParent ? '조회 중...' : '조회'}
                  </button> */}
                </div>
                {/* 조회 결과 표시 주석 처리 */}
                {/* {parentCheckResult && (
                  <div style={{ 
                    marginTop: '8px', 
                    padding: '8px 12px', 
                    borderRadius: '4px',
                    backgroundColor: parentCheckResult.registered ? '#d4edda' : '#f8d7da',
                    color: parentCheckResult.registered ? '#155724' : '#721c24',
                    fontSize: '14px',
                    border: `1px solid ${parentCheckResult.registered ? '#c3e6cb' : '#f5c6cb'}`
                  }}>
                    {parentCheckResult.registered ? (
                      <div>
                        <strong>✓ parentsapp에 가입된 학부모입니다.</strong>
                        {parentCheckResult.parent && (
                          <div style={{ marginTop: '4px', fontSize: '13px' }}>
                            이름: {parentCheckResult.parent.name || '-'}
                            {parentCheckResult.parent.email && ` | 이메일: ${parentCheckResult.parent.email}`}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <strong>✗ parentsapp에 가입되지 않은 학부모입니다.</strong>
                      </div>
                    )}
                  </div>
                )} */}
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
                    onChange={handleInputChange}
                  />
                  <label htmlFor="receipt_file" className="file-label">
                    파일 선택
                  </label>
                  {formData.receipt_file && (
                    <span className="file-name">{formData.receipt_file.name}</span>
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
                  value={formData.payment_method}
                  onChange={handleInputChange}
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
                  value={formData.fee}
                  onChange={(e) => {
                    const selectedFeeValue = e.target.value;
                    // 선택된 수강료의 결제 방법 찾기
                    const selectedFee = fees.find(fee => fee.value === selectedFeeValue);
                    setFormData(prev => ({
                      ...prev,
                      fee: selectedFeeValue,
                      payment_method: selectedFee?.payment_method || prev.payment_method
                    }));
                  }}
                  required
                >
                  <option value="">선택하세요</option>
                  {fees.map((fee) => {
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
              value={formData.note}
              onChange={handleInputChange}
              placeholder="메모를 입력하세요"
              rows={4}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setIsModalOpen(false);
                setEditingStudent(null);
                // setParentCheckResult(null); // 주석 처리됨
                setFormData({
                  name: '',
                  parent_contact: '',
                  payment_method: '현금',
                  class_id: '',
                  teacher_id: '',
                  fee: '',
                  receipt_file: null,
                  note: '',
                });
              }}
            >
              취소
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? '처리 중...' : editingStudent ? '수정' : '등록하기'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 등록 모달 */}
      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />
    </div>
  );
};

export default Students;
