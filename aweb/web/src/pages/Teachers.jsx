import { useState, useEffect } from 'react';
import { teacherService } from '../services/teacherService';
import { academyService } from '../services/academyService';
import { subjectService } from '../services/subjectService';
import { useAcademy } from '../contexts/AcademyContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from '../components/Modal';
import Form from '../components/Form';
import RegisterModal from '../components/RegisterModal';
import './Teachers.css';


// UUID 형식 검증 함수
const isValidUUID = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

const Teachers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { academy, loadAcademy } = useAcademy();
  const [teachers, setTeachers] = useState([]);
  const [academies, setAcademies] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedAcademy, setSelectedAcademy] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [selectedWorkDays, setSelectedWorkDays] = useState([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  
  // 초기 통계 계산
  const getTodayKoreanDay = () => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const today = new Date();
    const dayIndex = today.getDay();
    return days[dayIndex];
  };

  const [presentTeachers, setPresentTeachers] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);

  const workDaysList = ['월', '화', '수', '목', '금', '토', '일'];

  useEffect(() => {
    loadAcademies();
  }, []);

  // AcademyContext의 academy가 변경되면 academies 목록 업데이트
  useEffect(() => {
    if (academy) {
      setAcademies([academy]);
      if (!selectedAcademy) {
        setSelectedAcademy(academy.id);
      }
    } else {
      // Context에 없으면 API로 다시 로드
      loadAcademies();
    }
  }, [academy]);

  useEffect(() => {
    if (academies.length > 0 && !selectedAcademy) {
      setSelectedAcademy(academies[0].id);
    }
  }, [academies, selectedAcademy]);

  useEffect(() => {
    if (selectedAcademy) {
      loadTeachers();
      loadSubjects();
    }
  }, [selectedAcademy]);

  useEffect(() => {
    loadStatistics();
  }, [teachers]);

  // URL 쿼리 파라미터 확인하여 선생님 등록 모달 열기
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const action = searchParams.get('action');
    if (action === 'register') {
      // 쿼리 파라미터 제거
      navigate('/teachers', { replace: true });
      // 모달 열기 (handleCreate 로직 실행)
      const openModal = async () => {
        try {
          // 먼저 Context에서 학원 정보 확인
          if (academy && academy.id) {
            setAcademies([academy]);
            if (!selectedAcademy || selectedAcademy !== academy.id) {
              setSelectedAcademy(academy.id);
            }
          } else {
            await loadAcademy();
            await loadAcademies();
            if (academy && academy.id) {
              setAcademies([academy]);
              setSelectedAcademy(academy.id);
            } else {
              alert('학원이 등록되지 않았습니다. 설정 페이지에서 먼저 학원을 등록해주세요.');
              navigate('/settings');
              return;
            }
          }
        } catch (error) {
          console.error('학원 정보 로드 실패:', error);
          alert('학원 정보를 불러올 수 없습니다. 설정 페이지에서 학원을 확인해주세요.');
          navigate('/settings');
          return;
        }
        
        setEditingTeacher(null);
        setSelectedWorkDays([]);
        setSelectedSubjectIds([]);
        setIsModalOpen(true);
      };
      openModal();
    }
  }, [location.search, navigate, academy, selectedAcademy, loadAcademy]);

  const loadAcademies = async () => {
    try {
      console.log('학원 목록 로드 시도...');
      const response = await academyService.getAll();
      const academiesList = response.data.academies || [];
      console.log('학원 목록 로드 성공:', academiesList.length, '개');
      setAcademies(academiesList);
      
      // 학원이 없으면 경고 표시
      if (academiesList.length === 0) {
        console.warn('등록된 학원이 없습니다. 설정 페이지에서 학원을 등록해주세요.');
      }
    } catch (error) {
      console.error('학원 목록 로드 실패:', error);
      console.error('에러 상세:', error.response?.data || error.message);
      setAcademies([]);
      // 에러 발생 시 사용자에게 알림
      if (error.response?.status !== 404) {
        console.warn('학원 정보를 불러올 수 없습니다. 네트워크 연결을 확인해주세요.');
      }
    }
  };

  const loadSubjects = async () => {
    if (!selectedAcademy) return;
    try {
      const response = await subjectService.getAll(selectedAcademy);
      setSubjects(response.data.subjects || []);
    } catch (error) {
      // API 호출 실패 시 조용히 처리
      // console.error('과목 목록 로드 실패:', error);
      setSubjects([]);
    }
  };

  const loadTeachers = async () => {
    if (!selectedAcademy) {
      console.warn('loadTeachers: selectedAcademy가 없습니다.');
      setTeachers([]);
      setLoading(false);
      return;
    }
    try {
      console.log('선생님 목록 로드 시도... selectedAcademy:', selectedAcademy);
      setLoading(true);
      const response = await teacherService.getAll(selectedAcademy);
      console.log('선생님 목록 응답:', response.data);
      const teachersList = response.data.teachers || [];
      console.log('로드된 선생님 수:', teachersList.length);
      setTeachers(teachersList);
      loadStatistics(teachersList);
    } catch (error) {
      console.error('선생님 목록 로드 실패:', error);
      console.error('에러 상세:', error.response?.data || error.message);
      setTeachers([]);
      loadStatistics([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = (teachersList = teachers) => {
    try {
      // 총 등록된 선생님 수
      const total = teachersList.length;
      setTotalTeachers(total);

      // 현재 출근한 선생님 수 (오늘 요일에 맞는 선생님)
      const todayDay = getTodayKoreanDay();
      const presentCount = teachersList.filter(teacher => {
        const workDays = teacher.work_days ? teacher.work_days.split(',') : [];
        return workDays.includes(todayDay);
      }).length;
      setPresentTeachers(presentCount);
    } catch (error) {
      console.error('통계 로드 실패:', error);
      setTotalTeachers(teachersList.length);
      setPresentTeachers(0);
    }
  };

  const handleSearch = () => {
    // TODO: 검색 로직 구현
    console.log('검색:', searchQuery);
  };

  const handleDelete = async (teacherId) => {
    try {
      console.log('선생님 삭제 시도:', teacherId);
      const response = await teacherService.delete(teacherId);
      console.log('삭제 응답:', response);
      alert('선생님이 삭제되었습니다.');
      await loadTeachers();
    } catch (error) {
      console.error('선생님 삭제 실패:', error);
      console.error('에러 상세:', error.response?.data || error.message);
      
      const errorData = error.response?.data || {};
      let errorMessage = errorData.error || errorData.message || error.message || '삭제에 실패했습니다.';
      
      // 수업 또는 학생에 할당되어 있는 경우 더 친절한 메시지
      if (errorData.details || errorMessage.includes('수업에 할당') || errorMessage.includes('학생에 할당')) {
        let detailsMessage = '';
        
        if (errorData.classes && errorData.classes.length > 0) {
          const classNames = errorData.classes.map(c => c.name).join(', ');
          detailsMessage += `\n할당된 수업: ${classNames}\n`;
          detailsMessage += `→ 수업 관리 페이지에서 해당 수업의 선생님을 변경해주세요.\n`;
        }
        
        if (errorData.students && errorData.students.length > 0) {
          const studentNames = errorData.students.map(s => s.name).join(', ');
          detailsMessage += `\n할당된 학생: ${studentNames}\n`;
          detailsMessage += `→ 학생 관리 페이지에서 해당 학생의 담당 선생님을 변경해주세요.\n`;
        }
        
        if (detailsMessage) {
          errorMessage = `${errorMessage}\n\n${detailsMessage}`;
        }
      }
      
      alert(`삭제에 실패했습니다.\n\n${errorMessage}`);
    }
  };

  const handleCreate = async () => {
    // 모달 열기 전에 학원 정보 다시 확인 및 동기화
    try {
      // 먼저 Context에서 학원 정보 확인
      if (academy && academy.id) {
        console.log('✅ Context에서 학원 정보 확인:', academy.name, academy.id);
        setAcademies([academy]);
        if (!selectedAcademy || selectedAcademy !== academy.id) {
          setSelectedAcademy(academy.id);
        }
      } else {
        // Context에 없으면 API로 로드 시도
        console.log('⚠️ Context에 학원 정보 없음, API로 로드 시도...');
        await loadAcademy(); // Context 새로고침
        await loadAcademies(); // academies 목록도 새로고침
        
        // 로드 후 다시 확인
        if (academy && academy.id) {
          console.log('✅ API 로드 후 학원 정보 확인:', academy.name, academy.id);
          setAcademies([academy]);
          setSelectedAcademy(academy.id);
        } else {
          // 여전히 없으면 사용자에게 알림
          console.error('❌ 학원 정보를 찾을 수 없습니다.');
          alert('학원이 등록되지 않았습니다. 설정 페이지에서 먼저 학원을 등록해주세요.');
          navigate('/settings');
          return;
        }
      }
    } catch (error) {
      console.error('❌ 학원 정보 로드 실패:', error);
      alert('학원 정보를 불러올 수 없습니다. 설정 페이지에서 학원을 확인해주세요.');
      navigate('/settings');
      return;
    }
    
    setEditingTeacher(null);
    setSelectedWorkDays([]);
    setSelectedSubjectIds([]);
    setIsModalOpen(true);
  };

  const handleCreateClass = () => {
    navigate('/classes');
  };

  const handleRegister = () => {
    setRegisterModalOpen(true);
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    // 편집 시 기존 데이터 설정
    const workDays = teacher.work_days ? teacher.work_days.split(',') : [];
    setSelectedWorkDays(workDays);
    setSelectedSubjectIds(teacher.subject_ids || []);
    setIsModalOpen(true);
  };

  const toggleWorkDay = (day) => {
    setSelectedWorkDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const toggleSubject = (subjectId) => {
    setSelectedSubjectIds(prev => 
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSubmit = async (formData) => {
    try {
      // 학원 목록 다시 로드 시도
      if (academies.length === 0) {
        await loadAcademies();
      }
      
      // AcademyContext에서 학원 정보 다시 확인
      if (academy && academy.id) {
        setAcademies([academy]);
        if (!selectedAcademy || selectedAcademy !== academy.id) {
          setSelectedAcademy(academy.id);
        }
      } else {
        // Context에 없으면 다시 로드
        await loadAcademy();
        if (academy && academy.id) {
          setAcademies([academy]);
          setSelectedAcademy(academy.id);
        }
      }
      
      // 필수 필드 검증
      if (!selectedAcademy) {
        if (academies.length === 0) {
          alert('학원이 등록되지 않았습니다. 설정 페이지에서 먼저 학원을 등록해주세요.');
          navigate('/settings');
        } else {
          alert('학원을 선택해주세요.');
        }
        return;
      }
      
      // UUID 형식 검증
      if (!isValidUUID(selectedAcademy)) {
        alert('유효하지 않은 학원 ID입니다. 설정 페이지에서 학원을 다시 등록해주세요.');
        navigate('/settings');
        return;
      }

      const name = formData.name ? formData.name.trim() : '';
      if (!name) {
        alert('강사 명을 입력해주세요.');
        return;
      }

      // UUID 형식이 아닌 subject_ids 필터링
      const validSubjectIds = selectedSubjectIds.filter(id => isValidUUID(id));
      
      if (selectedSubjectIds.length > 0 && validSubjectIds.length === 0) {
        alert('유효한 과목을 선택해주세요. 설정 페이지에서 과목을 먼저 등록해주세요.');
        return;
      }

      const data = {
        name: name,
        academy_id: selectedAcademy,
        work_days: selectedWorkDays.join(','), // 선택된 근무 요일을 쉼표로 구분
        subject_ids: validSubjectIds.length > 0 ? validSubjectIds : null, // 유효한 UUID만 전송
        contact: formData.contact || null,
      };

      console.log('전송할 데이터:', data); // 디버깅용

      let savedTeacher;
      if (editingTeacher) {
        const updateResponse = await teacherService.update(editingTeacher.id, data);
        savedTeacher = updateResponse.data.teacher;
        alert('수정되었습니다.');
      } else {
        const createResponse = await teacherService.create(data);
        console.log('선생님 생성 응답:', createResponse.data);
        savedTeacher = createResponse.data.teacher;
        alert('생성되었습니다.');
      }
      
      setIsModalOpen(false);
      setEditingTeacher(null);
      setSelectedWorkDays([]);
      setSelectedSubjectIds([]);
      
      // 저장 후 목록 다시 로드
      // selectedAcademy가 없으면 데이터에서 가져오기
      const academyIdToLoad = selectedAcademy || savedTeacher?.academy_id || academies[0]?.id;
      console.log('저장 완료, 목록 다시 로드...');
      console.log('selectedAcademy:', selectedAcademy);
      console.log('savedTeacher.academy_id:', savedTeacher?.academy_id);
      console.log('academyIdToLoad:', academyIdToLoad);
      
      if (academyIdToLoad) {
        if (!selectedAcademy) {
          setSelectedAcademy(academyIdToLoad);
        }
        // 약간의 지연 후 로드 (상태 업데이트 대기)
        setTimeout(async () => {
          await loadTeachers();
        }, 100);
      } else {
        console.error('학원 ID를 찾을 수 없습니다.');
        await loadTeachers();
      }
    } catch (error) {
      console.error('선생님 저장 실패:', error);
      const errorMessage = error.response?.data?.error || error.message || '저장에 실패했습니다.';
      alert(`저장에 실패했습니다: ${errorMessage}`);
    }
  };

  return (
    <div className="teachers-page">
      <div className="page-header-section">
        <div>
          <h1 className="page-title">전체 선생님 현황</h1>
          <p className="page-subtitle">모든 선생님 정보를 한 곳에서 관리하세요</p>
        </div>
        <button className="register-button" onClick={handleRegister}>
          <span className="register-icon">➕</span>
          등록하기
        </button>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-card-title">현재 출근한 선생님</div>
          <div className="summary-card-value blue">{presentTeachers}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-title">총 등록된 선생님</div>
          <div className="summary-card-value">{totalTeachers}</div>
        </div>
      </div>

      <div className="teacher-list-section">
        <div className="section-header">
          <h2 className="section-title">전체 선생님 목록</h2>
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="Q 선생님명으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="search-button" onClick={handleSearch}>
              🔍
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : teachers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👨‍🏫</div>
            <div className="empty-message">등록된 선생님이 없습니다</div>
            <div className="empty-submessage">등록하기 버튼을 눌러 선생님을 등록해주세요</div>
          </div>
        ) : (
          <div className="teachers-list">
            {teachers.map((teacher) => {
              const teacherSubjects = teacher.subject_ids 
                ? teacher.subject_ids.map(id => {
                    const subject = subjects.find(s => s.id === id);
                    return subject ? subject.name : null;
                  }).filter(Boolean)
                : [];
              
              // 근무 요일 정렬 함수
              const sortWorkDays = (days) => {
                const order = ['월', '화', '수', '목', '금', '토', '일'];
                return days.sort((a, b) => {
                  const indexA = order.indexOf(a.trim());
                  const indexB = order.indexOf(b.trim());
                  return indexA - indexB;
                });
              };

              const workDays = teacher.work_days 
                ? sortWorkDays(teacher.work_days.split(',')) 
                : [];
              
              return (
                <div 
                  key={teacher.id} 
                  className="teacher-item"
                  onClick={(e) => {
                    // 버튼 클릭이 아닌 경우에만 상세 페이지로 이동
                    if (!e.target.closest('.teacher-item-actions')) {
                      navigate(`/teachers/${teacher.id}`);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="teacher-item-name">{teacher.name}</div>
                  <div className="teacher-item-info">
                    {workDays.length > 0 && (
                      <div className="work-days-badges">
                        {workDays.map((day, index) => (
                          <span key={index} className="day-badge">{day}</span>
                        ))}
                      </div>
                    )}
                    {teacherSubjects.length > 0 && (
                      <div className="subjects-badges">
                        {teacherSubjects.map((subject, index) => (
                          <span key={index} className="subject-badge">{subject}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="teacher-item-actions">
                    <button 
                      className="action-button edit-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(teacher);
                      }}
                      title="수정"
                    >
                      ✏️
                    </button>
                    <button 
                      className="action-button delete-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`${teacher.name} 선생님을 삭제하시겠습니까?`)) {
                          handleDelete(teacher.id);
                        }
                      }}
                      title="삭제"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTeacher(null);
          setSelectedWorkDays([]);
          setSelectedSubjectIds([]);
        }}
        title={editingTeacher ? '선생님 수정' : '선생님 등록하기'}
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = {
            name: formData.get('name') || '',
            contact: formData.get('contact') || '',
          };
          handleSubmit(data);
        }} className="teacher-form">
          {academies.length === 0 && (
            <div className="alert alert-warning" style={{ marginBottom: '20px', padding: '12px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '6px', color: '#856404' }}>
              ⚠️ 학원이 등록되지 않았습니다. 먼저 설정 페이지에서 학원을 등록해주세요.
              <div style={{ marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => navigate('/settings')}
                  style={{
                    padding: '8px 16px',
                    background: '#ffc107',
                    color: '#856404',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  설정 페이지로 이동
                </button>
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              강사 명 <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              required
              defaultValue={editingTeacher?.name || ''}
              key={editingTeacher?.id || 'new'}
              placeholder="강사 명을 입력하세요"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              근무 요일
            </label>
            <div className="button-group">
              {workDaysList.map((day) => (
                <button
                  key={day}
                  type="button"
                  className={`day-select-button ${selectedWorkDays.includes(day) ? 'active' : ''}`}
                  onClick={() => toggleWorkDay(day)}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              과목
            </label>
            <div className="button-group">
              {subjects.length > 0 ? (
                subjects.map((subject) => (
                  <button
                    key={subject.id}
                    type="button"
                    className={`subject-select-button ${selectedSubjectIds.includes(subject.id) ? 'active' : ''}`}
                    onClick={() => toggleSubject(subject.id)}
                  >
                    {subject.name}
                  </button>
                ))
              ) : (
                <div className="no-subjects-message" style={{ marginTop: '8px', fontSize: '0.85rem', color: '#999' }}>
                  등록된 과목이 없습니다. 설정 페이지에서 과목을 먼저 등록해주세요.
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingTeacher(null);
                setSelectedWorkDays([]);
                setSelectedSubjectIds([]);
              }}
              className="btn btn-secondary"
            >
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              저장
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

export default Teachers;
