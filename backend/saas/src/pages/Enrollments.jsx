import { useState, useEffect } from 'react';
import { enrollmentService } from '../services/enrollmentService';
import { classService } from '../services/classService';
import { studentService } from '../services/studentService';
import { academyService } from '../services/academyService';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Form from '../components/Form';
import './Page.css';

const Enrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [academies, setAcademies] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedAcademy, setSelectedAcademy] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState(null);

  const fields = [
    { name: 'class_id', label: '수업', required: true, type: 'select' },
    { name: 'student_id', label: '학생', required: true, type: 'select' },
    { name: 'fee', label: '수강료', required: true, type: 'number' },
    { name: 'receipt_url', label: '영수증 URL', type: 'url' },
    { name: 'status', label: '상태', required: true, type: 'select' },
  ];

  useEffect(() => {
    loadAcademies();
  }, []);

  useEffect(() => {
    if (selectedAcademy) {
      loadClasses();
      loadStudents();
      loadEnrollments();
    }
  }, [selectedAcademy]);

  const loadAcademies = async () => {
    try {
      const response = await academyService.getAll();
      setAcademies(response.data.academies || []);
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
    }
  };

  const loadStudents = async () => {
    if (!selectedAcademy) return;
    try {
      const response = await studentService.getAll(selectedAcademy);
      setStudents(response.data.students || []);
    } catch (error) {
      console.error('학생 목록 로드 실패:', error);
    }
  };

  const loadEnrollments = async () => {
    if (!selectedAcademy) return;
    try {
      setLoading(true);
      const response = await enrollmentService.getAll();
      setEnrollments(response.data.enrollments || []);
    } catch (error) {
      console.error('수강 등록 목록 로드 실패:', error);
      alert('수강 등록 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingEnrollment(null);
    setIsModalOpen(true);
  };

  const handleEdit = (enrollment) => {
    setEditingEnrollment(enrollment);
    setIsModalOpen(true);
  };

  const handleDelete = async (enrollment) => {
    if (!window.confirm('수강 등록을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await enrollmentService.delete(enrollment.id);
      alert('삭제되었습니다.');
      loadEnrollments();
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editingEnrollment) {
        await enrollmentService.update(editingEnrollment.id, data);
        alert('수정되었습니다.');
        
        // 학생 상세 페이지 새로고침 알림
        if (data.student_id) {
          localStorage.setItem('studentDetailPageRefresh', JSON.stringify({
            studentId: data.student_id,
            timestamp: Date.now(),
            action: 'update'
          }));
        }
      } else {
        const response = await enrollmentService.create(data);
        alert('생성되었습니다.');
        
        // 학생 상세 페이지 새로고침 알림
        if (data.student_id) {
          localStorage.setItem('studentDetailPageRefresh', JSON.stringify({
            studentId: data.student_id,
            timestamp: Date.now(),
            action: 'create'
          }));
        }
      }
      setIsModalOpen(false);
      setEditingEnrollment(null);
      loadEnrollments();
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const columns = [
    { key: 'fee', label: '수강료', render: (fee) => fee ? `${fee.toLocaleString()}원` : '-' },
    { key: 'status', label: '상태' },
    { key: 'receipt_url', label: '영수증', render: (url) => url ? <a href={url} target="_blank" rel="noopener noreferrer">보기</a> : '-' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>수강 등록</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={selectedAcademy}
            onChange={(e) => setSelectedAcademy(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="">학원 선택</option>
            {academies.map((academy) => (
              <option key={academy.id} value={academy.id}>
                {academy.name}
              </option>
            ))}
          </select>
          <button onClick={handleCreate} className="btn btn-primary" disabled={!selectedAcademy}>
            + 새 수강 등록
          </button>
        </div>
      </div>

      {!selectedAcademy ? (
        <div className="loading">학원을 선택해주세요.</div>
      ) : loading ? (
        <div className="loading">로딩 중...</div>
      ) : (
        <Table
          columns={columns}
          data={enrollments}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEnrollment(null);
        }}
        title={editingEnrollment ? '수강 등록 수정' : '새 수강 등록'}
      >
        <Form
          fields={fields.map(field => {
            if (field.name === 'class_id') {
              return { ...field, options: classes.map(c => ({ value: c.id, label: c.name })) };
            } else if (field.name === 'student_id') {
              return { ...field, options: students.map(s => ({ value: s.id, label: s.name })) };
            } else if (field.name === 'status') {
              return { ...field, options: [{ value: '결제', label: '결제' }, { value: '미결제', label: '미결제' }] };
            }
            return field;
          })}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingEnrollment(null);
          }}
          initialData={editingEnrollment || {}}
        />
      </Modal>
    </div>
  );
};

export default Enrollments;

