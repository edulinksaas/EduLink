import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../services/studentService';
import { academyService } from '../services/academyService';
import { classService } from '../services/classService';
import { teacherService } from '../services/teacherService';
import { subjectService } from '../services/subjectService';
import Modal from '../components/Modal';
import './TodayStatus.css';

const TodayStatus = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState('학생명');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [academies, setAcademies] = useState([]);
  const [selectedAcademy, setSelectedAcademy] = useState('');
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  
  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    name: '',
    parent_contact: '',
    payment_method: '현금',
    class_id: '',
    teacher_id: '',
    fee: '',
    receipt_file: null,
    note: '',
  });

  // 오늘 날짜 기준 필터링을 위한 헬퍼
  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDate = now.getDate();

  const getCreatedDate = (student) => {
    const created = student.createdAt || student.created_at;
    return created ? new Date(created) : null;
  };

  // 오늘 등록된 학생만 필터링
  const todaysStudents = students.filter((student) => {
    const createdDate = getCreatedDate(student);
    if (!createdDate) return false;
    return (
      createdDate.getFullYear() === todayYear &&
      createdDate.getMonth() === todayMonth &&
      createdDate.getDate() === todayDate
    );
  });

  // 금일 신규등록 인원 수
  const todayRegistrations = todaysStudents.length;

  // 금일 매출 (금일 등록 학생들의 수강료 합)
  const todaySales = todaysStudents.reduce((sum, student) => {
    const feeValue =
      typeof student.fee === 'number'
        ? student.fee
        : student.fee
        ? parseInt(student.fee, 10)
        : 0;
    return sum + (Number.isNaN(feeValue) ? 0 : feeValue);
  }, 0);

  useEffect(() => {
    loadAcademies();
  }, []);

  useEffect(() => {
    if (selectedAcademy) {
      loadClasses();
      loadTeachers();
      loadSubjects();
      loadStudents();
    }
  }, [selectedAcademy]);

  const loadAcademies = async () => {
    try {
      const response = await academyService.getAll();
      const academiesList = response.data.academies || [];
      setAcademies(academiesList);
      if (academiesList.length > 0) {
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
      const response = await studentService.getAll(selectedAcademy);
      setStudents(response.data.students || []);
    } catch (error) {
      console.error('학생 목록 로드 실패:', error);
      setStudents([]);
    }
  };

  // 수강료 선택은 TodayStatus 모달에서만 사용하므로,
  // 기존 loadFees 로직은 그대로 두되 호출만 하지 않습니다.

  // 검색 필터링된 오늘 등록 학생 목록
  const filteredTodaysStudents = useMemo(() => {
    if (!searchQuery.trim()) {
      return todaysStudents;
    }

    const query = searchQuery.trim().toLowerCase();

    return todaysStudents.filter((student) => {
      const classItem = classes.find((c) => c.id === student.class_id);
      const subjectItem = classItem
        ? subjects.find((s) => s.id === classItem.subject_id)
        : null;
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
  }, [todaysStudents, classes, subjects, teachers, category, searchQuery]);

  const handleSearch = () => {
    // 검색은 useMemo로 자동 필터링되므로 여기서는 페이지를 1로 리셋
    setCurrentPage(1);
  };

  // 페이지네이션: 한 페이지당 10명씩 표시
  const studentsPerPage = 10;
  const totalPages = Math.ceil(filteredTodaysStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const paginatedTodaysStudents = filteredTodaysStudents.slice(startIndex, endIndex);

  // 검색어나 카테고리가 변경되면 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, category]);

  const handleRegister = () => {
    setEditingStudent(null);
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
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'receipt_file') {
      setFormData(prev => ({
        ...prev,
        receipt_file: files[0] || null,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

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

      if (!formData.parent_contact.trim()) {
        alert('학부모 연락처를 입력해주세요.');
        return;
      }

      if (!formData.class_id) {
        alert('수업을 선택해주세요.');
        return;
      }

      if (!formData.teacher_id) {
        alert('담당 선생님을 선택해주세요.');
        return;
      }

      if (!formData.fee) {
        alert('수강료를 선택해주세요.');
        return;
      }

      const studentData = {
        name: formData.name,
        parent_contact: formData.parent_contact,
        note: formData.note,
        academy_id: selectedAcademy,
      };

      if (editingStudent) {
        await studentService.update(editingStudent.id, studentData);
        alert('학생 정보가 수정되었습니다.');
      } else {
        await studentService.create(studentData);
        // TODO: 수강 등록도 함께 생성
        alert('학생이 등록되었습니다.');
      }

      setIsModalOpen(false);
      setEditingStudent(null);
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
      // TODO: 학생 목록 새로고침
      window.location.reload(); // 임시로 페이지 새로고침
    } catch (error) {
      console.error('학생 저장 실패:', error);
      alert('학생 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (registration) => {
    // TODO: 수정 로직 구현
    console.log('수정:', registration);
    alert(`${registration.studentName} 학생 등록 정보를 수정합니다.`);
  };

  const handleDelete = (registration) => {
    // TODO: 삭제 로직 구현
    if (window.confirm(`${registration.studentName} 학생 등록 정보를 삭제하시겠습니까?`)) {
      console.log('삭제:', registration);
      alert(`${registration.studentName} 학생 등록 정보가 삭제되었습니다.`);
    }
  };

  return (
    <div className="today-status-page">
      <div className="page-header">
        <h1 className="page-title">금일 현황</h1>
        <div className="filter-section">
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
          <button className="register-button" onClick={handleRegister}>
            <span className="register-icon">➕</span>
            학생 등록
          </button>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-card-title">금일 매출</div>
          <div className="summary-card-value">₩{todaySales.toLocaleString()}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-title">금일 신규등록</div>
          <div className="summary-card-value">{todayRegistrations}명</div>
        </div>
      </div>

      <div className="content-area">
        <table className="registrations-table">
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
            {paginatedTodaysStudents.map((student) => {
              const classItem = classes.find((c) => c.id === student.class_id);
              const subjectItem = classItem
                ? subjects.find((s) => s.id === classItem.subject_id)
                : null;
              const teacherItem = teachers.find((t) => t.id === student.teacher_id);

              // TodayStatus에서는 오늘 등록된 학생은 모두 '신규'로 표시
              const categoryLabel = '신규';

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
                      ? `₩${student.fee.toLocaleString()}`
                      : '-'}
                  </td>
                  <td>{student.has_receipt ? '유' : '무'}</td>
                  <td>{student.note || '-'}</td>
                  <td>
                    {/* TodayStatus는 요약용이므로 수정/삭제는 제공하지 않음 */}
                  </td>
                </tr>
              );
            })}
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

              <div className="form-group">
                <label className="form-label">
                  학부모 연락처 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  name="parent_contact"
                  value={formData.parent_contact}
                  onChange={handleInputChange}
                  placeholder="010-1234-5678"
                  required
                />
              </div>

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
                  수업 이름 <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  name="class_id"
                  value={formData.class_id}
                  onChange={handleInputChange}
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

              <div className="form-group">
                <label className="form-label">
                  담당 선생님 <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  name="teacher_id"
                  value={formData.teacher_id}
                  onChange={handleInputChange}
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

              <div className="form-group">
                <label className="form-label">
                  수강료 <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  name="fee"
                  value={formData.fee}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">선택하세요</option>
                  {fees.map((fee) => (
                    <option key={fee.id} value={fee.value}>
                      {fee.amount}
                    </option>
                  ))}
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
    </div>
  );
};

export default TodayStatus;

