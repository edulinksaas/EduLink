import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentService } from '../services/studentService';
import { classService } from '../services/classService';
import { teacherService } from '../services/teacherService';
import { subjectService } from '../services/subjectService';
import { academyService } from '../services/academyService';
import { attendanceService } from '../services/attendanceService';
import { paymentService } from '../services/paymentService';
import { memoService } from '../services/memoService';
import { enrollmentService } from '../services/enrollmentService';
import { tuitionFeeService } from '../services/tuitionFeeService';
import Modal from '../components/Modal';
import Form from '../components/Form';
import './StudentDetail.css';

/**
 * 타입 참고용 (실제 TypeScript 타입 아님)
 *
 * type Student = {
 *   id: string;
 *   name: string;
 *   character: 'bear' | 'tiger' | 'rabbit' | 'dog' | 'cat';
 *   grade?: string;
 *   birth?: string;
 *   address?: string;
 *   email?: string;
 *   phone?: string;
 *   tags?: string[];
 *   remainingSessions?: number;
 * };
 *
 * type ClassInfo = {
 *   subject: string;
 *   course: string;
 *   instructor: string;
 *   registeredAt: string;
 *   nextLessonDate?: string;
 * };
 *
 * type Parent = {
 *   name: string;
 *   phone: string;
 *   email?: string;
 *   notes?: string[];
 * };
 *
 * type AttendanceRecord = {
 *   date: string; // YYYY-MM-DD
 *   status: 'present' | 'absent' | 'late' | 'sick';
 * };
 *
 * type PaymentInfo = {
 *   fee: number;
 *   remainingSessions: number;
 *   nextPaymentDate?: string;
 *   invoiceIssued?: boolean;
 *   unpaid?: boolean;
 * };
 */

// =========================
//  UI SUB COMPONENTS
// =========================

function StudentHeaderSection({
  student,
}) {
  const characterMap = {
    bear: '🐻',
    tiger: '🐯',
    rabbit: '🐰',
    dog: '🐶',
    cat: '🐱',
  };

  const characterIcon = characterMap[student.character] || '👤';

  return (
    <section className="student-header">
      <div className="student-header-content">
        <div className="student-profile-section">
          <div className="student-profile-image">
            {characterIcon}
          </div>
          <div className="student-profile-info">
            <h1 className="student-name-text">
              {student.name}
            </h1>
            {student.grade && (
              <div className="student-grade">
                {student.grade}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function TodayStatusCard({
  hasLessonToday,
  autoNotifyEnabled,
  onToggleAutoNotify,
  onMarkPresent,
  onMarkAbsent,
}) {
  return (
    <section className="student-card today-status-card">
      <div className="today-status-header">
        <div className="today-status-text">
          <h2 className="card-title-sm">오늘 수업 상태</h2>
          <p className="card-subtext">
            {hasLessonToday
              ? '오늘 예정된 수업이 있습니다.'
              : '오늘은 예정된 수업이 없습니다.'}
          </p>
        </div>
        <div className="today-status-toggle">
          <span>자동 출결</span>
          <button
            type="button"
            onClick={onToggleAutoNotify}
            className={`toggle-switch ${autoNotifyEnabled ? 'on' : 'off'}`}
          >
            <span
              className="toggle-knob"
            />
          </button>
        </div>
      </div>

      <div className="today-status-actions">
        <button
          type="button"
          onClick={onMarkPresent}
          className="btn-primary"
        >
          오늘 출석 처리
        </button>
        <button
          type="button"
          onClick={onMarkAbsent}
          className="btn-secondary"
        >
          오늘 결석 처리
        </button>
      </div>
    </section>
  );
}

function AttendanceCalendar({ month, records, onDayClick }) {
  const calendarDays = useMemo(() => {
    const year = month.getFullYear();
    const m = month.getMonth();

    const firstDay = new Date(year, m, 1);
    const firstWeekDay = firstDay.getDay(); // 0=Sun
    const daysInMonth = new Date(year, m + 1, 0).getDate();

    const days = [];

    // 앞쪽 빈 칸: 이전 달 날짜 (표시만)
    for (let i = 0; i < firstWeekDay; i += 1) {
      const date = new Date(year, m, i - firstWeekDay + 1);
      days.push({ date, inCurrentMonth: false });
    }

    // 이번 달
    for (let d = 1; d <= daysInMonth; d += 1) {
      const date = new Date(year, m, d);
      days.push({ date, inCurrentMonth: true });
    }

    // 6x7 채우기
    while (days.length < 42) {
      const last = days[days.length - 1].date;
      const date = new Date(last);
      date.setDate(last.getDate() + 1);
      days.push({ date, inCurrentMonth: false });
    }

    return days;
  }, [month]);

  const recordMap = useMemo(() => {
    const map = {};
    records.forEach((r) => {
      map[r.date] = r.status;
    });
    return map;
  }, [records]);

  const getStatusForDate = (date) => {
    const key = date.toISOString().slice(0, 10);
    return recordMap[key];
  };

  const statusEmoji = {
    present: '😊',
    absent: '😢',
    late: '⏰',
    sick: '🤒',
  };

  const handleClick = (date) => {
    const key = date.toISOString().slice(0, 10);
    onDayClick(key);
  };

  const monthLabel = `${month.getFullYear()}년 ${month.getMonth() + 1}월`;

  return (
    <section className="student-card attendance-calendar">
      <div className="student-card-header">
        <h2 className="card-title-sm">출석 캘린더</h2>
        <span className="calendar-month-label">{monthLabel}</span>
      </div>

      <div className="calendar-weekdays">
        {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
          <div key={d} className="calendar-weekday">
            {d}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {calendarDays.map(({ date, inCurrentMonth }) => {
          const status = getStatusForDate(date);
          const isToday =
            new Date().toDateString() === date.toDateString() && inCurrentMonth;

          const classes = ['calendar-day'];
          if (!inCurrentMonth) classes.push('calendar-day--outside');
          if (status) classes.push(`calendar-day--${status}`);
          if (isToday) classes.push('calendar-day--today');

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => handleClick(date)}
              className={classes.join(' ')}
            >
              <span className="calendar-day-number">{date.getDate()}</span>
              {status && (
                <span className="calendar-day-status">
                  {statusEmoji[status]}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function AttendanceLogList({ records, attendanceRate, weeklyLessonCount }) {
  return (
    <section className="student-card attendance-log-card">
      <div className="student-card-header">
        <h2 className="card-title-sm">출석 로그</h2>
        <div className="attendance-stats">
          <span className="attendance-stat">
            누적 출석률{' '}
            <strong>{attendanceRate.toFixed(0)}%</strong>
          </span>
          <span className="attendance-stat">
            주간 수업 횟수 <strong>{weeklyLessonCount}회</strong>
          </span>
        </div>
      </div>

      {records.length === 0 ? (
        <p className="empty-text">
          아직 출석 기록이 없습니다.
        </p>
      ) : (
        <ul className="attendance-log-list">
          {records
            .slice()
            .sort((a, b) => (a.date < b.date ? 1 : -1))
            .map((r) => (
              <li
                key={r.date}
                className="attendance-log-item"
              >
                <span className="attendance-log-date">
                  {new Date(r.date).toLocaleDateString('ko-KR')}
                </span>
                <span
                  className={`attendance-log-status attendance-log-status--${r.status}`}
                >
                  {r.status === 'present' && '출석'}
                  {r.status === 'absent' && '결석'}
                  {r.status === 'late' && '지각'}
                  {r.status === 'sick' && '병결'}
                </span>
              </li>
            ))}
        </ul>
      )}
    </section>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">
        {value || '-'}
      </span>
    </div>
  );
}

function CollapsibleStudentInfo({ student }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="student-card collapsible-card">
      <div 
        className="collapsible-card-header"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer' }}
      >
        <h3 className="collapsible-card-title">학생 정보</h3>
        <span className="collapsible-card-toggle">
          {isExpanded ? '▲' : '▼'}
        </span>
      </div>
      {isExpanded && (
        <div className="collapsible-card-body">
          <InfoRow label="학년" value={student.grade} />
          <InfoRow label="생년월일" value={student.birth} />
          <InfoRow label="주소" value={student.address} />
          <InfoRow label="이메일" value={student.email} />
          <InfoRow label="학생 연락처" value={student.phone} />
        </div>
      )}
    </section>
  );
}

function ClassCard({
  classInfo,
  paymentInfo,
  recentAttendance,
  onViewAttendanceDetail,
  onCallTeacher,
}) {
  const statusEmoji = {
    present: '😊',
    absent: '😢',
    late: '⏰',
    sick: '🤒',
  };

  return (
    <section className="class-card">
      <div className="class-card-header">
        <h3 className="class-card-title">{classInfo.course}</h3>
        <div className="class-card-subtitle">
          {classInfo.subject} · {classInfo.instructor} 선생님
          {classInfo.teacherPhone && (
            <button
              type="button"
              onClick={() => onCallTeacher(classInfo.teacherPhone)}
              className="teacher-call-button"
              title="선생님에게 전화하기"
            >
              📞
            </button>
          )}
        </div>
      </div>

      <div className="class-card-body">
        {/* 다음 수업일 & 남은 회차 */}
        <div className="class-info-row">
          {classInfo.nextLessonDate && (
            <div className="class-info-item">
              <span className="class-info-label">다음 수업일</span>
              <span className="class-info-value highlight">
                {classInfo.nextLessonDate}
              </span>
            </div>
          )}
          {paymentInfo?.remainingSessions !== null && paymentInfo?.remainingSessions !== undefined && (
            <div className="class-info-item">
              <span className="class-info-label">남은 회차</span>
              <span className="class-info-value highlight">
                {paymentInfo.remainingSessions}회
              </span>
            </div>
          )}
        </div>

        {/* 결제 정보 */}
        {paymentInfo && (
          <div className="payment-info-section">
            <div className="payment-info-row">
              <span className="payment-info-label">수강료</span>
              <span className="payment-info-value">
                {typeof paymentInfo.fee === 'number' 
                  ? `${paymentInfo.fee.toLocaleString()}원`
                  : paymentInfo.fee || '-'}
              </span>
            </div>
            <div className="payment-info-row">
              <span className="payment-info-label">영수증</span>
              <span className={`payment-info-badge ${paymentInfo.invoiceIssued ? 'badge-success' : 'badge-warning'}`}>
                {paymentInfo.invoiceIssued ? '유' : '무'}
              </span>
            </div>
            {paymentInfo.unpaid && (
              <div className="payment-info-row">
                <span className="payment-info-label">미납 여부</span>
                <span className="payment-info-badge badge-danger">미납</span>
              </div>
            )}
          </div>
        )}

        {/* 출석 상세 보기 버튼 */}
        <button
          type="button"
          onClick={() => onViewAttendanceDetail(classInfo.enrollmentId)}
          className="view-attendance-button"
        >
          출석 상세 보기
        </button>
      </div>
    </section>
  );
}

function CollapsibleParentInfo({ parent, onContactParent }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="student-card collapsible-card">
      <div 
        className="collapsible-card-header"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer' }}
      >
        <h3 className="collapsible-card-title">보호자 정보</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {parent?.phone && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onContactParent();
              }}
              className="parent-call-button-small"
              title="보호자에게 전화하기"
            >
              📞
            </button>
          )}
          <span className="collapsible-card-toggle">
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>
      </div>
      {isExpanded && (
        <div className="collapsible-card-body">
          <InfoRow label="보호자 이름" value={parent?.name} />
          <InfoRow label="전화번호" value={parent?.phone} />
          <InfoRow label="이메일" value={parent?.email} />
          <div className="parent-notes">
            <div className="parent-notes-title">요청사항</div>
            {parent?.notes && parent.notes.length > 0 ? (
              <ul className="parent-notes-list">
                {parent.notes.map((note, idx) => (
                  <li
                    key={`${note}-${idx}`}
                    className="parent-note-item"
                  >
                    {note}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="parent-notes-empty">아직 등록된 요청 기록이 없습니다.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function AttendanceDetailModal({ 
  isOpen, 
  onClose, 
  studentId, 
  enrollmentId, 
  classInfo,
  student,
  academyId,
  month: initialMonth 
}) {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => initialMonth || new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isAttendanceFormOpen, setIsAttendanceFormOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [attendanceNote, setAttendanceNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadAttendanceRecords = async () => {
      if (!isOpen || !studentId) return;
      
      try {
        setLoading(true);
        const monthParam = `${currentMonth.getFullYear()}-${String(
          currentMonth.getMonth() + 1,
        ).padStart(2, '0')}`;
        
        const attendanceRes = await attendanceService.getByStudent(
          studentId,
          monthParam,
        );
        
        let records = attendanceRes.data?.records || [];
        
        // enrollmentId가 있으면 해당 수업의 출석 기록만 필터링
        if (enrollmentId) {
          // TODO: enrollment별 출석 기록 필터링 로직 추가 필요
          // 현재는 모든 출석 기록 표시
        }
        
        setAttendanceRecords(records);
      } catch (e) {
        console.warn('출석 기록 조회 실패:', e);
        setAttendanceRecords([]);
      } finally {
        setLoading(false);
      }
    };

    loadAttendanceRecords();
  }, [isOpen, studentId, enrollmentId, currentMonth]);

  // 출석 변경 감지 및 자동 새로고침
  useEffect(() => {
    if (!isOpen || !studentId) return;

    const handleStorageChange = (e) => {
      if (e.key === 'studentAttendanceUpdate' && e.newValue) {
        try {
          const updateData = JSON.parse(e.newValue);
          if (updateData.studentId === studentId) {
            // 출석 기록 다시 로드
            const loadAttendanceRecords = async () => {
              try {
                const monthParam = `${currentMonth.getFullYear()}-${String(
                  currentMonth.getMonth() + 1,
                ).padStart(2, '0')}`;
                
                const attendanceRes = await attendanceService.getByStudent(
                  studentId,
                  monthParam,
                );
                
                let records = attendanceRes.data?.records || [];
                setAttendanceRecords(records);
              } catch (e) {
                console.warn('출석 기록 새로고침 실패:', e);
              }
            };
            loadAttendanceRecords();
          }
        } catch (err) {
          console.error('출석 업데이트 데이터 파싱 실패:', err);
        }
      }
    };

    // storage 이벤트 리스너 등록 (다른 탭/창에서의 변경 감지)
    window.addEventListener('storage', handleStorageChange);

    // 같은 페이지에서의 변경 감지 (polling 방식)
    const interval = setInterval(() => {
      const updateData = localStorage.getItem('studentAttendanceUpdate');
      if (updateData) {
        try {
          const data = JSON.parse(updateData);
          if (data.studentId === studentId) {
            const lastUpdate = parseInt(data.timestamp);
            const now = Date.now();
            // 1초 이내의 변경만 처리 (너무 자주 새로고침 방지)
            if (now - lastUpdate < 1000) {
              const loadAttendanceRecords = async () => {
                try {
                  const monthParam = `${currentMonth.getFullYear()}-${String(
                    currentMonth.getMonth() + 1,
                  ).padStart(2, '0')}`;
                  
                  const attendanceRes = await attendanceService.getByStudent(
                    studentId,
                    monthParam,
                  );
                  
                  let records = attendanceRes.data?.records || [];
                  setAttendanceRecords(records);
                } catch (e) {
                  console.warn('출석 기록 새로고침 실패:', e);
                }
              };
              loadAttendanceRecords();
            }
          }
        } catch (err) {
          console.error('출석 업데이트 데이터 파싱 실패:', err);
        }
      }
    }, 500); // 0.5초마다 확인

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [isOpen, studentId, currentMonth]);

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const handleDateClick = (date, inCurrentMonth) => {
    if (!inCurrentMonth) return;
    const dateStr = date.toISOString().slice(0, 10);
    
    setSelectedDate(dateStr);
    setSelectedStatus('');
    setAttendanceNote('');
    setIsAttendanceFormOpen(true);
  };

  const handleSaveAttendance = async () => {
    if (!selectedStatus || !selectedDate || !academyId || !studentId) {
      alert('필수 정보가 누락되었습니다.');
      return;
    }

    try {
      setSaving(true);
      const dateStr = selectedDate;

      // 새 기록 생성 (항상 추가)
      await attendanceService.create({
        academyId,
        studentId,
        classId: classInfo?.classId || null,
        date: dateStr,
        status: selectedStatus,
        note: attendanceNote,
      });

      // 출석 기록 다시 로드
      const monthParam = `${currentMonth.getFullYear()}-${String(
        currentMonth.getMonth() + 1,
      ).padStart(2, '0')}`;
      
      const attendanceRes = await attendanceService.getByStudent(
        studentId,
        monthParam,
      );
      
      let records = attendanceRes.data?.records || [];
      setAttendanceRecords(records);

      // 폼 초기화
      setSelectedStatus('');
      setAttendanceNote('');
    } catch (error) {
      console.error('출석 등록 실패:', error);
      alert('출석 등록에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAttendance = async (recordId) => {
    if (!recordId) return;

    if (!confirm('정말 이 출석 기록을 삭제하시겠습니까?')) {
      return;
    }

    try {
      setSaving(true);
      await attendanceService.delete(recordId);

      // 출석 기록 다시 로드
      const monthParam = `${currentMonth.getFullYear()}-${String(
        currentMonth.getMonth() + 1,
      ).padStart(2, '0')}`;
      
      const attendanceRes = await attendanceService.getByStudent(
        studentId,
        monthParam,
      );
      
      let records = attendanceRes.data?.records || [];
      setAttendanceRecords(records);
    } catch (error) {
      console.error('출석 삭제 실패:', error);
      alert('출석 삭제에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const m = currentMonth.getMonth();

    const firstDay = new Date(year, m, 1);
    const firstWeekDay = firstDay.getDay();
    const daysInMonth = new Date(year, m + 1, 0).getDate();

    const days = [];

    for (let i = 0; i < firstWeekDay; i += 1) {
      const date = new Date(year, m, i - firstWeekDay + 1);
      days.push({ date, inCurrentMonth: false });
    }

    for (let d = 1; d <= daysInMonth; d += 1) {
      const date = new Date(year, m, d);
      days.push({ date, inCurrentMonth: true });
    }

    while (days.length < 42) {
      const last = days[days.length - 1].date;
      const date = new Date(last);
      date.setDate(last.getDate() + 1);
      days.push({ date, inCurrentMonth: false });
    }

    return days;
  }, [currentMonth]);

  const recordMap = useMemo(() => {
    const map = {};
    attendanceRecords.forEach((r) => {
      if (!map[r.date]) {
        map[r.date] = [];
      }
      map[r.date].push({
        status: r.status,
        id: r.id,
        note: r.note,
      });
    });
    return map;
  }, [attendanceRecords]);

  // 출석 통계 계산
  const attendanceStats = useMemo(() => {
    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      earlyLeave: 0,
      sick: 0,
      official: 0,
    };

    attendanceRecords.forEach((record) => {
      if (record.status === 'present') stats.present++;
      else if (record.status === 'absent') stats.absent++;
      else if (record.status === 'late') stats.late++;
      else if (record.status === 'earlyLeave') stats.earlyLeave++;
      else if (record.status === 'sick') stats.sick++;
      else if (record.status === 'official') stats.official++;
    });

    return stats;
  }, [attendanceRecords]);

  if (!isOpen) return null;

  const statusEmoji = {
    present: '😊',
    absent: '❌',
    late: '⏰',
    earlyLeave: '🏃',
    sick: '🤒',
    official: '📄',
  };

  const monthLabel = `${currentMonth.getFullYear()}년 ${currentMonth.getMonth() + 1}월`;
  const isCurrentMonth = 
    currentMonth.getFullYear() === new Date().getFullYear() &&
    currentMonth.getMonth() === new Date().getMonth();

  return (
    <div className="attendance-detail-modal-backdrop" onClick={onClose}>
      <div className="attendance-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="attendance-detail-modal-header">
          <h2 className="attendance-detail-modal-title">
            {student?.name || '학생'} {classInfo?.course ? `· ${classInfo.course}` : ''}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="attendance-detail-modal-close"
          >
            ✕
          </button>
        </div>
        
        <div className="attendance-detail-modal-body">
          {loading ? (
            <div className="loading">출석 기록을 불러오는 중...</div>
          ) : (
            <>
              {/* 월 네비게이션 */}
              <div className="attendance-calendar-navigation">
                <button
                  type="button"
                  onClick={goToPreviousMonth}
                  className="calendar-nav-button"
                >
                  ←
                </button>
                <span className="calendar-month-label">{monthLabel}</span>
                <button
                  type="button"
                  onClick={goToToday}
                  className="calendar-today-button"
                  disabled={isCurrentMonth}
                >
                  오늘
                </button>
                <button
                  type="button"
                  onClick={goToNextMonth}
                  className="calendar-nav-button"
                >
                  →
                </button>
              </div>

              {/* 출석 통계 */}
              <div className="attendance-stats-row">
                <div className="attendance-stat-item">
                  <span className="attendance-stat-label">출석</span>
                  <span className="attendance-stat-value">{attendanceStats.present}</span>
                </div>
                <div className="attendance-stat-item">
                  <span className="attendance-stat-label">결석</span>
                  <span className="attendance-stat-value">{attendanceStats.absent}</span>
                </div>
                <div className="attendance-stat-item">
                  <span className="attendance-stat-label">지각</span>
                  <span className="attendance-stat-value">{attendanceStats.late}</span>
                </div>
                <div className="attendance-stat-item">
                  <span className="attendance-stat-label">조퇴</span>
                  <span className="attendance-stat-value">{attendanceStats.earlyLeave}</span>
                </div>
                <div className="attendance-stat-item">
                  <span className="attendance-stat-label">병결</span>
                  <span className="attendance-stat-value">{attendanceStats.sick}</span>
                </div>
                <div className="attendance-stat-item">
                  <span className="attendance-stat-label">공결</span>
                  <span className="attendance-stat-value">{attendanceStats.official}</span>
                </div>
              </div>
              
              {/* 요일 헤더 */}
              <div className="calendar-weekdays">
                {['일', '월', '화', '수', '목', '금', '토'].map((d, idx) => (
                  <div 
                    key={d} 
                    className={`calendar-weekday ${idx === 0 ? 'calendar-weekday--sun' : idx === 6 ? 'calendar-weekday--sat' : ''}`}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* 캘린더 그리드 */}
              <div className="calendar-grid">
                {calendarDays.map(({ date, inCurrentMonth }) => {
                  const key = date.toISOString().slice(0, 10);
                  const records = recordMap[key] || [];
                  const isToday =
                    new Date().toDateString() === date.toDateString() && inCurrentMonth;
                  const dayOfWeek = date.getDay();

                  // 첫 번째 기록의 상태로 배경색 결정 (여러 개면 첫 번째 것)
                  const firstStatus = records.length > 0 ? records[0].status : null;

                  const classes = ['calendar-day'];
                  if (!inCurrentMonth) classes.push('calendar-day--outside');
                  if (firstStatus) classes.push(`calendar-day--${firstStatus}`);
                  if (isToday) classes.push('calendar-day--today');
                  if (dayOfWeek === 0 && inCurrentMonth) classes.push('calendar-day--sun');
                  if (dayOfWeek === 6 && inCurrentMonth) classes.push('calendar-day--sat');

                  return (
                    <div
                      key={date.toISOString()}
                      className={classes.join(' ')}
                      onClick={() => handleDateClick(date, inCurrentMonth)}
                      style={{ cursor: inCurrentMonth ? 'pointer' : 'default' }}
                    >
                      <span className="calendar-day-number">{date.getDate()}</span>
                      {records.length > 0 && (
                        <div className="calendar-day-statuses">
                          {records.map((record, idx) => (
                            <span 
                              key={record.id || idx} 
                              className="calendar-day-status"
                              title={record.note || statusEmoji[record.status]}
                            >
                              {statusEmoji[record.status] || '○'}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 범례 */}
              <div className="attendance-legend">
                <div className="legend-item">
                  <span className="legend-icon">😊</span>
                  <span className="legend-label">출석</span>
                </div>
                <div className="legend-item">
                  <span className="legend-icon">❌</span>
                  <span className="legend-label">결석</span>
                </div>
                <div className="legend-item">
                  <span className="legend-icon">🔄</span>
                  <span className="legend-label">연장</span>
                </div>
                <div className="legend-item">
                  <span className="legend-icon">⏰</span>
                  <span className="legend-label">지각</span>
                </div>
                <div className="legend-item">
                  <span className="legend-icon">🏃</span>
                  <span className="legend-label">조퇴</span>
                </div>
                <div className="legend-item">
                  <span className="legend-icon">🤒</span>
                  <span className="legend-label">병결</span>
                </div>
                <div className="legend-item">
                  <span className="legend-icon">📄</span>
                  <span className="legend-label">공결</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 출석 등록 모달 */}
      {isAttendanceFormOpen && (
        <div className="attendance-form-modal-backdrop" onClick={() => setIsAttendanceFormOpen(false)}>
          <div className="attendance-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="attendance-form-modal-header">
              <h3 className="attendance-form-modal-title">
                출석 등록 - {selectedDate ? new Date(selectedDate).toLocaleDateString('ko-KR') : ''}
              </h3>
              <button
                type="button"
                onClick={() => setIsAttendanceFormOpen(false)}
                className="attendance-form-modal-close"
              >
                ✕
              </button>
            </div>
            
            <div className="attendance-form-modal-body">
              {/* 기존 출석 기록 리스트 */}
              {selectedDate && recordMap[selectedDate] && recordMap[selectedDate].length > 0 && (
                <div className="attendance-form-group">
                  <label className="attendance-form-label">기존 출석 기록</label>
                  <div className="attendance-records-list">
                    {recordMap[selectedDate].map((record) => (
                      <div key={record.id} className="attendance-record-item">
                        <div className="attendance-record-content">
                          <span className="attendance-record-emoji">
                            {statusEmoji[record.status] || '○'}
                          </span>
                          <div className="attendance-record-info">
                            <span className="attendance-record-status">
                              {record.status === 'present' && '출석'}
                              {record.status === 'absent' && '결석'}
                              {record.status === 'late' && '지각'}
                              {record.status === 'earlyLeave' && '조퇴'}
                              {record.status === 'sick' && '병결'}
                              {record.status === 'official' && '공결'}
                            </span>
                            {record.note && (
                              <span className="attendance-record-note">{record.note}</span>
                            )}
                          </div>
                        </div>
                        <div className="attendance-record-actions">
                          <button
                            type="button"
                            onClick={() => handleDeleteAttendance(record.id)}
                            className="attendance-record-delete-button"
                            disabled={saving}
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 새 출석 기록 추가 */}
              <div className="attendance-form-group">
                <label className="attendance-form-label">
                  새 출석 기록 추가
                </label>
                <div className="attendance-status-buttons">
                  <button
                    type="button"
                    onClick={() => setSelectedStatus('present')}
                    className={`attendance-status-button ${selectedStatus === 'present' ? 'active' : ''}`}
                  >
                    😊 출석
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStatus('absent')}
                    className={`attendance-status-button ${selectedStatus === 'absent' ? 'active' : ''}`}
                  >
                    ❌ 결석
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStatus('late')}
                    className={`attendance-status-button ${selectedStatus === 'late' ? 'active' : ''}`}
                  >
                    ⏰ 지각
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStatus('earlyLeave')}
                    className={`attendance-status-button ${selectedStatus === 'earlyLeave' ? 'active' : ''}`}
                  >
                    🏃 조퇴
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStatus('sick')}
                    className={`attendance-status-button ${selectedStatus === 'sick' ? 'active' : ''}`}
                  >
                    🤒 병결
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStatus('official')}
                    className={`attendance-status-button ${selectedStatus === 'official' ? 'active' : ''}`}
                  >
                    📄 공결
                  </button>
                </div>
              </div>

              <div className="attendance-form-group">
                <label className="attendance-form-label">메모</label>
                <textarea
                  className="attendance-form-textarea"
                  value={attendanceNote}
                  onChange={(e) => setAttendanceNote(e.target.value)}
                  placeholder="메모를 입력하세요 (선택사항)"
                  rows={3}
                />
              </div>

              <div className="attendance-form-actions">
                <div style={{ flex: 1 }} />
                <button
                  type="button"
                  onClick={() => {
                    setIsAttendanceFormOpen(false);
                    setSelectedStatus('');
                    setAttendanceNote('');
                  }}
                  className="attendance-form-button attendance-form-button--cancel"
                  disabled={saving}
                >
                  닫기
                </button>
                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  className="attendance-form-button attendance-form-button--save"
                  disabled={!selectedStatus || saving}
                >
                  {saving ? '저장 중...' : '추가'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MemoList({ memos, onAddClick }) {
  return (
    <section className="student-card memo-section">
      <div className="memo-header">
        <h2 className="card-title-sm">특이사항 기록</h2>
        <button
          type="button"
          onClick={onAddClick}
          className="memo-add-button"
        >
          + 특이사항 추가
        </button>
      </div>
      {memos.length === 0 ? (
        <p className="empty-text">아직 등록된 특이사항이 없습니다.</p>
      ) : (
        <ul className="memo-list">
          {memos.map((memo) => (
            <li
              key={memo.id}
              className="memo-item"
            >
              <div>
                <div className="memo-time">
                  {new Date(memo.createdAt).toLocaleString('ko-KR')}
                </div>
                <div className="memo-text">{memo.text}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function AddMemoModal({ isOpen, text, onChangeText, onClose, onSubmit }) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="memo-modal-backdrop">
      <div className="memo-modal">
        <h3 className="memo-modal-title">특이사항 추가</h3>
        <p className="memo-modal-description">
          수업 태도, 건강 상태, 레벨업 가능성 등 공유가 필요한 내용을 기록해
          주세요.
        </p>
        <form onSubmit={handleSubmit} className="memo-modal-form">
          <textarea
            className="memo-modal-textarea"
            value={text}
            onChange={(e) => onChangeText(e.target.value)}
            placeholder="예) 최근 지각이 잦아 부모님과 상담 필요"
          />
          <div className="memo-modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="memo-modal-btn"
            >
              취소
            </button>
            <button
              type="submit"
              className="memo-modal-btn memo-modal-btn-primary"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================
//  PAGE CONTAINER
// =========================

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [classInfos, setClassInfos] = useState([]);
  const [parent, setParent] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [memos, setMemos] = useState([]);
  const [isMemoModalOpen, setIsMemoModalOpen] = useState(false);
  const [newMemoText, setNewMemoText] = useState('');
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState(null);
  const [selectedClassInfo, setSelectedClassInfo] = useState(null);
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [academyId, setAcademyId] = useState(null);
  const [tuitionFees, setTuitionFees] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [enrollmentFormData, setEnrollmentFormData] = useState({
    teacher_id: '',
    schedule: '',
    class_id: '',
    receipt_file: null,
    payment_method: '',
    fee: '',
    note: '',
  });

  const [calendarMonth] = useState(() => new Date());

  // 요일 목록
  const days = ['월', '화', '수', '목', '금', '토', '일'];

  // 담당 선생님의 출근 요일 필터링
  const availableDays = useMemo(() => {
    if (!enrollmentFormData.teacher_id) {
      return days;
    }
    const selectedTeacher = teachers.find(t => t.id === enrollmentFormData.teacher_id);
    if (!selectedTeacher || !selectedTeacher.work_days) {
      return days;
    }
    // work_days가 쉼표로 구분된 문자열인 경우 (예: "월,화,수")
    const workDaysArray = selectedTeacher.work_days.split(',').map(d => d.trim());
    return days.filter(d => workDaysArray.includes(d));
  }, [teachers, enrollmentFormData.teacher_id]);

  // 담당 선생님과 요일에 따라 필터링된 수업 목록
  const filteredClasses = useMemo(() => {
    if (!enrollmentFormData.teacher_id) {
      return [];
    }
    // 선생님과 요일 모두 필터링
    let filtered = classes.filter(classItem => classItem.teacher_id === enrollmentFormData.teacher_id);
    if (enrollmentFormData.schedule) {
      filtered = filtered.filter(classItem => classItem.schedule === enrollmentFormData.schedule);
    }
    return filtered;
  }, [classes, enrollmentFormData.teacher_id, enrollmentFormData.schedule]);

  // 수강료 및 결제 방법 로드
  useEffect(() => {
    const loadPaymentMethods = () => {
      try {
        const saved = localStorage.getItem('paymentMethods');
        if (saved) {
          setPaymentMethods(JSON.parse(saved));
        } else {
          const defaultMethods = ['월납', '일시불', '분할납', '회차별'];
          setPaymentMethods(defaultMethods);
          localStorage.setItem('paymentMethods', JSON.stringify(defaultMethods));
        }
      } catch (error) {
        console.error('결제 방법 로드 실패:', error);
        setPaymentMethods(['월납', '일시불', '분할납', '회차별']);
      }
    };
    loadPaymentMethods();
  }, []);

  useEffect(() => {
    const loadTuitionFees = async () => {
      if (!academyId) return;
      
      try {
        const response = await tuitionFeeService.getAll(academyId);
        const fees = response.fees || response.data?.fees || [];
        
        if (fees && fees.length > 0) {
          const formattedFees = fees.map(fee => ({
            id: fee.id,
            amount: fee.amount,
            value: fee.value ? fee.value.toString() : String(fee.value || '0'),
            class_type: fee.class_type || null,
            payment_method: fee.payment_method || null
          }));
          setTuitionFees(formattedFees);
        } else {
          try {
            const saved = localStorage.getItem('tuitionFees');
            if (saved) {
              const localFees = JSON.parse(saved);
              setTuitionFees(Array.isArray(localFees) ? localFees : []);
            }
          } catch (localError) {
            console.error('로컬 스토리지 로드 실패:', localError);
          }
        }
      } catch (error) {
        console.error('수강료 목록 로드 실패:', error);
        try {
          const saved = localStorage.getItem('tuitionFees');
          if (saved) {
            const localFees = JSON.parse(saved);
            setTuitionFees(Array.isArray(localFees) ? localFees : []);
          }
        } catch (localError) {
          console.error('로컬 스토리지 로드 실패:', localError);
        }
      }
    };
    
    if (academyId) {
      loadTuitionFees();
    }
  }, [academyId]);

  // 선택된 수업의 수업 유형에 따라 필터링된 수강료 목록
  const filteredTuitionFees = useMemo(() => {
    if (!enrollmentFormData.class_id) {
      return tuitionFees;
    }
    const selectedClass = classes.find(c => c.id === enrollmentFormData.class_id);
    if (!selectedClass || !selectedClass.class_type) {
      return tuitionFees;
    }
    // 수업 유형이 일치하는 수강료만 필터링
    return tuitionFees.filter(fee => 
      !fee.class_type || fee.class_type === selectedClass.class_type
    );
  }, [tuitionFees, classes, enrollmentFormData.class_id]);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!id) return;

        const academiesRes = await academyService.getAll();
        const academies = academiesRes.data.academies || [];
        const currentAcademyId = academies[0]?.id;
        setAcademyId(currentAcademyId);

        const studentRes = await studentService.getById(id);
        const rawStudent = studentRes.data?.student || studentRes.data;
        if (!rawStudent) {
          setStudent(null);
          return;
        }

        // Student 모델 매핑
        const mappedStudent = {
          id: rawStudent.id,
          name: rawStudent.name,
          character: rawStudent.character || 'bear',
          grade: rawStudent.grade || '',
          birth:
            rawStudent.birth ||
            rawStudent.birth_date ||
            rawStudent.birthday ||
            '',
          address: rawStudent.address || '',
          email: rawStudent.email || '',
          phone: rawStudent.phone || rawStudent.parent_contact || '',
          tags: rawStudent.tags || [],
          remainingSessions:
            rawStudent.remaining_lessons ?? rawStudent.remainingSessions ?? null,
        };
        setStudent(mappedStudent);

        // Parent 정보 (가용 필드 기반)
        setParent({
          name: rawStudent.parent_name || '학부모',
          phone: rawStudent.parent_contact || rawStudent.phone || '',
          email: rawStudent.parent_email || '',
          notes: [],
        });

        // 수업 목록 및 선생님 목록 로드 (enrollment 추가 모달용)
        if (currentAcademyId) {
          try {
            const [classesRes, teachersRes] = await Promise.all([
              classService.getAll(currentAcademyId),
              teacherService.getAll(currentAcademyId),
            ]);
            setClasses(classesRes.data.classes || []);
            setTeachers(teachersRes.data.teachers || []);
          } catch (e) {
            console.warn('수업/선생님 목록 조회 실패:', e);
          }
        }

        // 여러 수업 정보 로드: enrollments API 사용
        let mappedClassInfos = [];
        if (currentAcademyId) {
          try {
            const enrollmentsRes = await enrollmentService.getAll(null, rawStudent.id);
            const enrollments = enrollmentsRes.data?.enrollments || [];
            
            if (enrollments.length > 0) {
              const [classesRes, teachersRes, subjectsRes, paymentsRes] = await Promise.all([
                classService.getAll(currentAcademyId),
                teacherService.getAll(currentAcademyId),
                subjectService.getAll(currentAcademyId),
                paymentService.getByStudent(rawStudent.id),
              ]);

              const classes = classesRes.data.classes || [];
              const teachers = teachersRes.data.teachers || [];
              const subjects = subjectsRes.data.subjects || [];
              const payments = paymentsRes.data?.payments || [];

              mappedClassInfos = await Promise.all(
                enrollments.map(async (enrollment) => {
                  const foundClass = classes.find((c) => c.id === enrollment.class_id);
                  const foundTeacher = foundClass 
                    ? teachers.find((t) => t.id === foundClass.teacher_id)
                    : null;
                  const foundSubject = foundClass 
                    ? subjects.find((s) => s.id === foundClass.subject_id)
                    : null;
                  
                  // 해당 enrollment의 결제 정보 찾기
                  const enrollmentPayment = payments.find(
                    (p) => p.enrollment_id === enrollment.id
                  ) || payments.find(
                    (p) => p.class_id === enrollment.class_id && p.student_id === rawStudent.id
                  );

                  return {
                    enrollmentId: enrollment.id,
                    classId: enrollment.class_id,
                    subject: foundSubject?.name || '',
                    course: foundClass?.name || '',
                    instructor: foundTeacher?.name || '',
                    teacherPhone: foundTeacher?.phone || foundTeacher?.contact || null,
                    registeredAt: enrollment.created_at || enrollment.createdAt
                      ? new Date(enrollment.created_at || enrollment.createdAt).toLocaleDateString('ko-KR')
                      : '',
                    nextLessonDate: enrollment.next_lesson_date || undefined,
                    paymentInfo: enrollmentPayment ? {
                      fee: enrollmentPayment.amount || 0,
                      remainingSessions: enrollmentPayment.remaining_sessions ?? 0,
                      nextPaymentDate: enrollmentPayment.next_payment_date || undefined,
                      invoiceIssued: !!enrollmentPayment.invoice_issued,
                      unpaid: !!enrollmentPayment.unpaid,
                    } : null,
                  };
                })
              );
            } else if (rawStudent.class_id) {
              // 하위 호환성: 기존 class_id가 있는 경우
              const [classesRes, teachersRes, subjectsRes] = await Promise.all([
                classService.getAll(currentAcademyId),
                teacherService.getAll(currentAcademyId),
                subjectService.getAll(currentAcademyId),
              ]);

              const classes = classesRes.data.classes || [];
              const teachers = teachersRes.data.teachers || [];
              const subjects = subjectsRes.data.subjects || [];

              const foundClass = classes.find((c) => c.id === rawStudent.class_id) || null;
              const foundTeacher = teachers.find((t) => t.id === rawStudent.teacher_id) || null;
              const foundSubject = foundClass && subjects.find((s) => s.id === foundClass.subject_id);

              const createdAt = rawStudent.createdAt || rawStudent.created_at;

              mappedClassInfos = [{
                enrollmentId: null,
                classId: rawStudent.class_id,
                subject: foundSubject?.name || '',
                course: foundClass?.name || '',
                instructor: foundTeacher?.name || '',
                teacherPhone: foundTeacher?.phone || foundTeacher?.contact || null,
                registeredAt: createdAt
                  ? new Date(createdAt).toLocaleDateString('ko-KR')
                  : '',
                nextLessonDate: rawStudent.next_lesson_date || undefined,
                paymentInfo: null,
              }];
            }
          } catch (e) {
            console.warn('수업 정보 조회 실패:', e);
          }
        }
        setClassInfos(mappedClassInfos);

        // 출석 기록: attendance API 사용 (전체 기록, 여러 달)
        if (currentAcademyId) {
          try {
            // 최근 3개월치 출석 기록 가져오기
            const now = new Date();
            const allRecords = [];
            
            for (let i = 0; i < 3; i++) {
              const targetDate = new Date(now);
              targetDate.setMonth(now.getMonth() - i);
              const monthParam = `${targetDate.getFullYear()}-${String(
                targetDate.getMonth() + 1,
              ).padStart(2, '0')}`;
              
              try {
                const attendanceRes = await attendanceService.getByStudent(
                  rawStudent.id,
                  monthParam,
                );
                const records = attendanceRes.data?.records || [];
                allRecords.push(...records);
              } catch (e) {
                console.warn(`출석 기록 조회 실패 (${monthParam}):`, e);
              }
            }
            
            setAttendanceRecords(allRecords);
          } catch (e) {
            console.warn('출석 기록 조회 실패:', e);
            setAttendanceRecords([]);
          }
        }

        // 학생 메모: memo API 사용
        try {
          const memosRes = await memoService.getByStudent(rawStudent.id);
          const loadedMemos = memosRes.data?.memos || [];
          setMemos(loadedMemos);
        } catch (e) {
          console.warn('학생 메모 조회 실패:', e);
          setMemos([]);
        }
      } catch (error) {
        console.error('학생 상세 정보 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // enrollment 생성/수정/삭제 시 자동 새로고침
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'studentDetailPageRefresh' && id) {
        const refreshData = e.newValue;
        if (refreshData) {
          try {
            const data = JSON.parse(refreshData);
            // 해당 학생의 enrollment 변경인지 확인
            if (data.studentId === id) {
              console.log('🔄 Enrollment 변경 감지, 학생 상세 페이지 새로고침');
              // 페이지 새로고침으로 데이터 다시 로드
              window.location.reload();
            }
          } catch (err) {
            console.error('새로고침 데이터 파싱 실패:', err);
          }
        }
      }
    };

    // storage 이벤트 리스너 등록 (다른 탭/창에서의 변경 감지)
    window.addEventListener('storage', handleStorageChange);

    // 같은 페이지에서의 변경 감지 (polling 방식)
    const interval = setInterval(() => {
      const refreshData = localStorage.getItem('studentDetailPageRefresh');
      if (refreshData && id) {
        try {
          const data = JSON.parse(refreshData);
          // 해당 학생의 enrollment 변경인지 확인
          if (data.studentId === id) {
            const lastRefresh = parseInt(data.timestamp);
            const now = Date.now();
            // 1초 이내의 변경만 처리 (너무 자주 새로고침 방지)
            if (now - lastRefresh < 1000) {
              console.log('🔄 Enrollment 변경 감지, 학생 상세 페이지 새로고침');
              // 페이지 새로고침으로 데이터 다시 로드
              window.location.reload();
            }
          }
        } catch (err) {
          console.error('새로고침 데이터 파싱 실패:', err);
        }
      }
    }, 500); // 0.5초마다 확인

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [id]);

  const handleViewAttendanceDetail = (enrollmentId) => {
    const classInfo = classInfos.find((ci) => ci.enrollmentId === enrollmentId);
    setSelectedEnrollmentId(enrollmentId);
    setSelectedClassInfo(classInfo);
    setIsAttendanceModalOpen(true);
  };

  const handleCallTeacher = (phone) => {
    if (!phone) {
      alert('등록된 선생님 전화번호가 없습니다.');
      return;
    }
    window.open(`tel:${phone}`, '_self');
  };

  const handleContactParent = () => {
    if (!parent?.phone) {
      alert('등록된 보호자 전화번호가 없습니다.');
      return;
    }
    // 실제 환경에서는 tel: 링크 또는 통화 연동 사용
    window.open(`tel:${parent.phone}`, '_self');
  };

  const handleAddMemo = () => {
    if (!newMemoText.trim() || !student) return;

    const save = async () => {
      try {
        const academiesRes = await academyService.getAll();
        const academies = academiesRes.data.academies || [];
        const academyId = academies[0]?.id;

        const res = await memoService.create({
          academy_id: academyId,
          student_id: student.id,
          text: newMemoText.trim(),
        });

        const saved = res.data?.memo || null;
        const localMemo =
          saved || {
            id: `${Date.now()}`,
            text: newMemoText.trim(),
            createdAt: new Date().toISOString(),
          };

        setMemos((prev) => [localMemo, ...prev]);
        setNewMemoText('');
        setIsMemoModalOpen(false);
      } catch (error) {
        console.error('메모 저장 실패:', error);
        alert('메모 저장에 실패했습니다.');
      }
    };

    save();
  };

  const handleCalendarClick = (date) => {
    console.log('캘린더 클릭:', date);
  };

  // 각 수업별 최근 출석 기록 가져오기
  const getRecentAttendanceForClass = (enrollmentId, classId) => {
    // enrollmentId나 classId로 필터링된 출석 기록 반환
    // 현재는 전체 출석 기록에서 최근 5개 반환
    return attendanceRecords
      .slice()
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 5);
  };

  const pageInner = () => {
    if (loading) {
      return (
        <div className="loading">
          학생 정보를 불러오는 중입니다...
        </div>
      );
    }

    if (!student) {
      return (
        <div className="empty-state">
          학생 정보를 찾을 수 없습니다.
        </div>
      );
    }

    return (
      <div className="student-detail-body">
        {/* 상단 학생 헤더 */}
        <StudentHeaderSection
          student={student}
        />

        {/* 수업 카드들 (반복) */}
        {classInfos.length > 0 ? (
          <div className="class-cards-container">
            {classInfos.map((classInfo) => (
              <ClassCard
                key={classInfo.enrollmentId || classInfo.classId}
                classInfo={classInfo}
                paymentInfo={classInfo.paymentInfo}
                recentAttendance={getRecentAttendanceForClass(classInfo.enrollmentId, classInfo.classId)}
                onViewAttendanceDetail={handleViewAttendanceDetail}
                onCallTeacher={handleCallTeacher}
              />
            ))}
          </div>
        ) : (
          <section className="student-card">
            <p className="empty-text">등록된 수업 정보가 없습니다.</p>
          </section>
        )}

        {/* 학생 정보 (접힘) */}
        <CollapsibleStudentInfo student={student} />

        {/* 보호자 정보 (접힘) */}
        <CollapsibleParentInfo
          parent={parent}
          onContactParent={handleContactParent}
        />

        {/* 특이사항 */}
        <MemoList memos={memos} onAddClick={() => setIsMemoModalOpen(true)} />

        {/* 모달들 */}
        <AddMemoModal
          isOpen={isMemoModalOpen}
          text={newMemoText}
          onChangeText={setNewMemoText}
          onClose={() => setIsMemoModalOpen(false)}
          onSubmit={handleAddMemo}
        />

        <AttendanceDetailModal
          isOpen={isAttendanceModalOpen}
          onClose={() => {
            setIsAttendanceModalOpen(false);
            setSelectedEnrollmentId(null);
            setSelectedClassInfo(null);
          }}
          studentId={student.id}
          enrollmentId={selectedEnrollmentId}
          classInfo={selectedClassInfo}
          student={student}
          academyId={academyId}
          month={calendarMonth}
        />

        {/* 수업 추가 모달 */}
        <Modal
          isOpen={isEnrollmentModalOpen}
          onClose={() => {
            setIsEnrollmentModalOpen(false);
            setEnrollmentFormData({
              teacher_id: '',
              schedule: '',
              class_id: '',
              receipt_file: null,
              payment_method: '',
              fee: '',
              note: '',
            });
          }}
          title="수업 추가"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                if (!academyId) {
                  alert('학원 정보를 불러올 수 없습니다.');
                  return;
                }

                if (!enrollmentFormData.teacher_id) {
                  alert('담당 선생님을 선택해주세요.');
                  return;
                }

                if (!enrollmentFormData.schedule) {
                  alert('요일을 선택해주세요.');
                  return;
                }

                if (!enrollmentFormData.class_id) {
                  alert('수업을 선택해주세요.');
                  return;
                }

                if (!enrollmentFormData.fee) {
                  alert('수강료를 선택해주세요.');
                  return;
                }

                const enrollmentData = {
                  academy_id: academyId,
                  student_id: id,
                  class_id: enrollmentFormData.class_id,
                  status: 'active'
                };

                await enrollmentService.create(enrollmentData);
                alert('수업이 추가되었습니다.');
                
                // 학생 상세 페이지 새로고침 알림
                localStorage.setItem('studentDetailPageRefresh', JSON.stringify({
                  studentId: id,
                  timestamp: Date.now(),
                  action: 'create'
                }));

                setIsEnrollmentModalOpen(false);
                setEnrollmentFormData({
                  teacher_id: '',
                  schedule: '',
                  class_id: '',
                  receipt_file: null,
                  payment_method: '',
                  fee: '',
                  note: '',
                });
                // 페이지 새로고침
                window.location.reload();
              } catch (error) {
                console.error('수업 추가 실패:', error);
                alert('수업 추가에 실패했습니다.');
              }
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {/* 담당 선생님 */}
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
                value={enrollmentFormData.teacher_id}
                onChange={(e) => {
                  setEnrollmentFormData({
                    ...enrollmentFormData,
                    teacher_id: e.target.value,
                    schedule: '', // 선생님 변경 시 요일 초기화
                    class_id: '', // 선생님 변경 시 수업 초기화
                  });
                }}
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

            {/* 요일 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                요일 <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
                value={enrollmentFormData.schedule}
                onChange={(e) => {
                  setEnrollmentFormData({
                    ...enrollmentFormData,
                    schedule: e.target.value,
                    class_id: '', // 요일 변경 시 수업 초기화
                  });
                }}
                required
                disabled={!enrollmentFormData.teacher_id}
              >
                <option value="">
                  {enrollmentFormData.teacher_id ? '선택하세요' : '담당 선생님을 먼저 선택하세요'}
                </option>
                {availableDays.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            {/* 수업 이름 */}
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
                value={enrollmentFormData.class_id}
                onChange={(e) => {
                  setEnrollmentFormData({
                    ...enrollmentFormData,
                    class_id: e.target.value,
                  });
                }}
                required
                disabled={!enrollmentFormData.teacher_id || !enrollmentFormData.schedule}
              >
                <option value="">
                  {!enrollmentFormData.teacher_id || !enrollmentFormData.schedule
                    ? '담당 선생님과 요일을 먼저 선택하세요'
                    : '선택하세요'}
                </option>
                {filteredClasses.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 영수증 등록 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                영수증 등록
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
                onChange={(e) => {
                  setEnrollmentFormData({
                    ...enrollmentFormData,
                    receipt_file: e.target.files[0] || null,
                  });
                }}
              />
            </div>

            {/* 결제 방법 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                결제 방법
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
                value={enrollmentFormData.payment_method}
                onChange={(e) => {
                  setEnrollmentFormData({
                    ...enrollmentFormData,
                    payment_method: e.target.value,
                  });
                }}
              >
                <option value="">선택하세요</option>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            {/* 수강료 */}
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
                value={enrollmentFormData.fee}
                onChange={(e) => {
                  const selectedFeeValue = e.target.value;
                  // 선택된 수강료의 결제 방법 찾기
                  const selectedFee = filteredTuitionFees.find(fee => fee.value === selectedFeeValue);
                  setEnrollmentFormData({ 
                    ...enrollmentFormData, 
                    fee: selectedFeeValue,
                    payment_method: selectedFee?.payment_method || enrollmentFormData.payment_method
                  });
                }}
                required
              >
                <option value="">선택하세요</option>
                {filteredTuitionFees.map((fee) => {
                  // 수강료 표시 형식: "수업유형 - 결제방법: 금액" 또는 "금액"
                  const displayText = fee.class_type && fee.payment_method
                    ? `${fee.class_type} - ${fee.payment_method}: ${fee.amount}원`
                    : `${fee.amount}원`;
                  return (
                    <option key={fee.id} value={fee.value}>
                      {displayText}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* 메모 */}
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
                  minHeight: '100px',
                  resize: 'vertical',
                }}
                value={enrollmentFormData.note}
                onChange={(e) => {
                  setEnrollmentFormData({
                    ...enrollmentFormData,
                    note: e.target.value,
                  });
                }}
                placeholder="메모를 입력하세요"
              />
            </div>

            {/* 버튼 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsEnrollmentModalOpen(false);
                  setEnrollmentFormData({
                    teacher_id: '',
                    schedule: '',
                    class_id: '',
                    receipt_file: null,
                    payment_method: '',
                    fee: '',
                    note: '',
                  });
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f0f0f0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '1rem',
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
                  borderRadius: '4px',
                  fontSize: '1rem',
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

  return (
    <div className="student-detail-page">
      {pageInner()}
    </div>
  );
};

export default StudentDetail;

