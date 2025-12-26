import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { academyService } from '../services/academyService';
import { studentService } from '../services/studentService';
import { teacherService } from '../services/teacherService';
import { classService } from '../services/classService';
import { subjectService } from '../services/subjectService';
import { useAuth } from '../contexts/AuthContext';
import { useWelcomeGuide } from '../contexts/WelcomeGuideContext';
import Modal from '../components/Modal';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayStatus: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
  });
  const [allClasses, setAllClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedClassForStudents, setSelectedClassForStudents] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [isStudentRegisterModalOpen, setIsStudentRegisterModalOpen] = useState(false);
  const [studentFormData, setStudentFormData] = useState({
    name: '',
    parent_contact: '',
    payment_method: '현금',
    class_id: '',
    teacher_id: '',
    fee: '',
    receipt_file: null,
    note: '',
  });
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { showWelcomeGuide, openWelcomeGuide, closeWelcomeGuide } = useWelcomeGuide();

  useEffect(() => {
    loadDashboardData();
    
    // 페이지가 포커스를 받을 때마다 데이터 다시 로드
    const handleFocus = () => {
      loadDashboardData();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // 로그인 후 환영 가이드 표시 (체크박스가 체크되지 않은 경우에만)
  useEffect(() => {
    if (isAuthenticated) {
      const dontShowAgain = localStorage.getItem('dontShowWelcomeGuide');
      if (dontShowAgain !== 'true') {
        // 약간의 지연 후 모달 표시 (페이지 로드 완료 후)
        const timer = setTimeout(() => {
          openWelcomeGuide();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, openWelcomeGuide]);

  const handleDontShowAgain = () => {
    localStorage.setItem('dontShowWelcomeGuide', 'true');
    closeWelcomeGuide();
  };

  const handleCloseWelcomeGuide = () => {
    closeWelcomeGuide();
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const academiesRes = await academyService.getAll();
      const academies = academiesRes.data.academies || [];
      
      if (academies.length > 0) {
        const academyId = academies[0].id;
        
        const [studentsRes, teachersRes, classesRes, subjectsRes] = await Promise.all([
          studentService.getAll(academyId),
          teacherService.getAll(academyId),
          classService.getAll(academyId),
          subjectService.getAll(academyId),
        ]);

        setStats({
          todayStatus: 0,
          totalStudents: studentsRes.data.students?.length || 0,
          totalTeachers: teachersRes.data.teachers?.length || 0,
          totalClasses: classesRes.data.classes?.length || 0,
        });

        // 선생님과 학생 목록 저장
        setTeachers(teachersRes.data.teachers || []);
        setStudents(studentsRes.data.students || []);
        setSubjects(subjectsRes.data.subjects || []);

        // 모든 수업 저장
        const classes = classesRes.data.classes || [];
        setAllClasses(classes);
        
        // 오늘 요일에 근무하는 모든 선생님을 출근자로 설정
        const todayDay = getTodayKoreanDay();
        const presentTeachers = (teachersRes.data.teachers || []).filter(teacher => {
          const workDays = teacher.work_days ? teacher.work_days.split(',') : [];
          return workDays.includes(todayDay);
        });
        setAttendance(presentTeachers);
      }
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 오늘 요일을 한국어로 반환하는 함수
  const getTodayKoreanDay = () => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const today = new Date();
    const dayIndex = today.getDay();
    return days[dayIndex];
  };

  const statCards = [
    {
      title: '금일 현황',
      value: stats.todayStatus,
      icon: '📅',
      iconBg: '#E3F2FD',
      onClick: () => navigate('/today-status'),
    },
    {
      title: '총 학생 수',
      value: stats.totalStudents,
      icon: '🎓',
      iconBg: '#E8F5E9',
      onClick: () => navigate('/students'),
    },
    {
      title: '총 선생님 수',
      value: stats.totalTeachers,
      icon: '👨‍🏫',
      iconBg: '#FFF3E0',
      onClick: () => navigate('/teachers'),
    },
    {
      title: '총 강좌 수',
      value: stats.totalClasses,
      icon: '📚',
      iconBg: '#FCE4EC',
      onClick: () => navigate('/classes'),
    },
  ];

  return (
    <div className="dashboard">
      <section className="status-section">
        <h2 className="section-title">현황</h2>
        <div className="stat-cards">
          {statCards.map((card, index) => (
            <div key={index} className="stat-card" onClick={card.onClick}>
              <div className="stat-card-icon" style={{ backgroundColor: card.iconBg }}>
                <span>{card.icon}</span>
              </div>
              <div className="stat-card-content">
                <div className="stat-card-value">{card.value}</div>
                <div className="stat-card-title">{card.title}</div>
              </div>
              <button className="stat-card-button">
                자세히 보기 →
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="attendance-section">
        <div className="section-header">
          <h2 className="section-title">출근자 현황</h2>
          <button className="refresh-button" onClick={loadDashboardData}>
            🔄
          </button>
        </div>
        <div className="attendance-box">
          {attendance.length === 0 ? (
            <>
              <div className="empty-icon-right gray-icon">👥</div>
              <div className="empty-message">
                출근한 선생님이 없습니다
              </div>
              <div className="empty-submessage">
                현재 출근한 선생님이 없습니다.
              </div>
            </>
          ) : (
            <div className="attendance-list teachers-list">
              {attendance.map((teacher) => {
                const workDays = teacher.work_days ? teacher.work_days.split(',') : [];
                const teacherSubjects = teacher.subject_ids 
                  ? teacher.subject_ids.map(id => {
                      const subject = subjects.find(s => s.id === id);
                      return subject ? subject.name : '과목';
                    })
                  : [];
                
                return (
                  <div key={teacher.id} className="teacher-item">
                    <div className="teacher-item-name">{teacher.name}</div>
                    <div className="teacher-item-info">
                      <div className="work-days-badges">
                        {workDays.map((day, index) => (
                          <span key={index} className="day-badge">{day}</span>
                        ))}
                      </div>
                      <div className="subjects-badges">
                        {teacherSubjects.map((subject, index) => (
                          <span key={index} className="subject-badge">{subject}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 학생 목록 모달 */}
      <Modal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setSelectedClassForStudents(null);
          setEnrolledStudents([]);
        }}
        title={
          selectedClassForStudents
            ? `${selectedClassForStudents.name} 수강 학생`
            : '수강 학생'
        }
        headerActions={
          selectedClassForStudents ? (
            <button
              type="button"
              onClick={async () => {
                try {
                  const academiesRes = await academyService.getAll();
                  const academies = academiesRes.data.academies || [];
                  if (academies.length > 0) {
                    const academyId = academies[0].id;
                    setStudentFormData({
                      name: '',
                      parent_contact: '',
                      payment_method: '현금',
                      class_id: selectedClassForStudents.id,
                      teacher_id: selectedClassForStudents.teacher_id || '',
                      fee: '',
                      receipt_file: null,
                      note: '',
                    });
                    setIsStudentModalOpen(false);
                    setIsStudentRegisterModalOpen(true);
                  }
                } catch (error) {
                  console.error('학생 등록 실패:', error);
                }
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2980b9'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#3498db'}
            >
              + 학생 등록하기
            </button>
          ) : null
        }
      >
        {selectedClassForStudents ? (
          enrolledStudents.length > 0 ? (
            <table className="students-table compact">
              <thead>
                <tr>
                  <th>학생 이름</th>
                  <th>학부모 연락처</th>
                  <th>비고</th>
                  <th>출석 관리</th>
                </tr>
              </thead>
              <tbody>
                {enrolledStudents.map((student) => (
                  <tr key={student.id}>
                    <td
                      style={{ cursor: 'pointer', color: '#3498db', fontWeight: 500 }}
                      onClick={() => navigate(`/students/${student.id}`)}
                    >
                      {student.name}
                    </td>
                    <td>{student.parent_contact || '-'}</td>
                    <td>{student.note || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const today = new Date().toLocaleDateString('ko-KR');
                            alert(`${student.name} 학생의 출석이 기록되었습니다.\n날짜: ${today}`);
                            // TODO: 출석 데이터 저장 로직 추가
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#27ae60',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#229954'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#27ae60'}
                        >
                          출석
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const today = new Date().toLocaleDateString('ko-KR');
                            alert(`${student.name} 학생의 결석이 기록되었습니다.\n날짜: ${today}`);
                            // TODO: 결석 데이터 저장 로직 추가
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#c0392b'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#e74c3c'}
                        >
                          결석
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const today = new Date().toLocaleDateString('ko-KR');
                            alert(`${student.name} 학생의 이월이 기록되었습니다.\n날짜: ${today}`);
                            // TODO: 이월 데이터 저장 로직 추가
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#f39c12',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#d68910'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#f39c12'}
                        >
                          이월
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ marginBottom: '16px', fontSize: '0.9rem', color: '#666' }}>
                아직 이 수업에 등록된 학생이 없습니다.
              </div>
            </div>
          )
        ) : (
          <div style={{ padding: '12px 4px', fontSize: '0.9rem' }}>
            수업 정보를 불러오는 중입니다.
          </div>
        )}
      </Modal>

      {/* 학생 등록 모달 */}
      <Modal
        isOpen={isStudentRegisterModalOpen}
        onClose={() => {
          setIsStudentRegisterModalOpen(false);
          setStudentFormData({
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
        title="학생 등록"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const academiesRes = await academyService.getAll();
              const academies = academiesRes.data.academies || [];
              if (academies.length === 0) {
                alert('학원 정보를 불러올 수 없습니다.');
                return;
              }
              const academyId = academies[0].id;

              if (!studentFormData.name.trim()) {
                alert('학생 이름을 입력해주세요.');
                return;
              }

              if (!studentFormData.parent_contact.trim()) {
                alert('학부모 연락처를 입력해주세요.');
                return;
              }

              if (!studentFormData.class_id) {
                alert('수업을 선택해주세요.');
                return;
              }

              if (!studentFormData.teacher_id) {
                alert('담당 선생님을 선택해주세요.');
                return;
              }

              if (!studentFormData.fee) {
                alert('수강료를 선택해주세요.');
                return;
              }

              const studentData = {
                name: studentFormData.name,
                parent_contact: studentFormData.parent_contact,
                note: studentFormData.note,
                academy_id: academyId,
                class_id: studentFormData.class_id,
                teacher_id: studentFormData.teacher_id,
                fee: studentFormData.fee ? parseInt(studentFormData.fee, 10) : null,
                has_receipt: !!studentFormData.receipt_file,
              };

              await studentService.create(studentData);
              alert('학생이 등록되었습니다.');

              // 학생 목록 새로고침
              const response = await studentService.getAll(academyId);
              const allStudents = response.data?.students || response.data || [];
              setStudents(allStudents);

              // 수강생 목록도 새로고침
              if (selectedClassForStudents) {
                const classStudents = allStudents.filter(
                  (student) => student.class_id === selectedClassForStudents.id
                );
                setEnrolledStudents(classStudents);
              }

              setIsStudentRegisterModalOpen(false);
              setStudentFormData({
                name: '',
                parent_contact: '',
                payment_method: '현금',
                class_id: '',
                teacher_id: '',
                fee: '',
                receipt_file: null,
                note: '',
              });
            } catch (error) {
              console.error('학생 저장 실패:', error);
              alert('학생 저장에 실패했습니다.');
            }
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                학생 이름 <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <input
                type="text"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
                value={studentFormData.name}
                onChange={(e) =>
                  setStudentFormData({ ...studentFormData, name: e.target.value })
                }
                placeholder="학생 이름을 입력하세요"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                학부모 연락처 <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <input
                type="text"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
                value={studentFormData.parent_contact}
                onChange={(e) =>
                  setStudentFormData({ ...studentFormData, parent_contact: e.target.value })
                }
                placeholder="010-1234-5678"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                결제 방법 <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
                value={studentFormData.payment_method}
                onChange={(e) =>
                  setStudentFormData({ ...studentFormData, payment_method: e.target.value })
                }
                required
              >
                <option value="현금">현금</option>
                <option value="카드">카드</option>
                <option value="계좌이체">계좌이체</option>
                <option value="무통장입금">무통장입금</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                수업 이름 <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
                value={studentFormData.class_id}
                onChange={(e) =>
                  setStudentFormData({ ...studentFormData, class_id: e.target.value })
                }
                required
              >
                <option value="">선택하세요</option>
                {allClasses.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                담당 선생님 <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
                value={studentFormData.teacher_id}
                onChange={(e) =>
                  setStudentFormData({ ...studentFormData, teacher_id: e.target.value })
                }
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

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                수강료 <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
                value={studentFormData.fee}
                onChange={(e) =>
                  setStudentFormData({ ...studentFormData, fee: e.target.value })
                }
                required
              >
                <option value="">선택하세요</option>
                {(() => {
                  try {
                    const savedFees = localStorage.getItem('tuitionFees');
                    const fees = savedFees ? JSON.parse(savedFees) : [
                      { id: '1', amount: '100,000원', value: '100000' },
                      { id: '2', amount: '150,000원', value: '150000' },
                      { id: '3', amount: '200,000원', value: '200000' },
                      { id: '4', amount: '250,000원', value: '250000' },
                      { id: '5', amount: '300,000원', value: '300000' },
                    ];
                    return fees.map((fee) => (
                      <option key={fee.id} value={fee.value}>
                        {fee.amount}
                      </option>
                    ));
                  } catch (error) {
                    return [];
                  }
                })()}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              메모
            </label>
            <textarea
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                minHeight: '80px',
                resize: 'vertical',
              }}
              value={studentFormData.note}
              onChange={(e) =>
                setStudentFormData({ ...studentFormData, note: e.target.value })
              }
              placeholder="메모를 입력하세요"
              rows={4}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => {
                setIsStudentRegisterModalOpen(false);
                setStudentFormData({
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
              style={{
                padding: '10px 20px',
                backgroundColor: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              취소
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              등록
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
