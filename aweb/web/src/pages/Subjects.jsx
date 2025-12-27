import { useState, useEffect } from 'react';
import { subjectService } from '../services/subjectService';
import { academyService } from '../services/academyService';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Form from '../components/Form';
import './Page.css';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [academies, setAcademies] = useState([]);
  const [selectedAcademy, setSelectedAcademy] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const fields = [
    { name: 'academy_id', label: '학원', required: true, type: 'select' },
    { name: 'name', label: '과목명', required: true },
    { name: 'color', label: '색상 (HEX)', type: 'color' },
  ];

  useEffect(() => {
    loadAcademies();
  }, []);

  useEffect(() => {
    if (selectedAcademy) {
      loadSubjects();
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

  const loadSubjects = async () => {
    if (!selectedAcademy) return;
    try {
      setLoading(true);
      const response = await subjectService.getAll(selectedAcademy);
      setSubjects(response.data.subjects || []);
    } catch (error) {
      console.error('과목 목록 로드 실패:', error);
      alert('과목 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSubject(null);
    setIsModalOpen(true);
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  const handleDelete = async (subject) => {
    if (!window.confirm(`"${subject.name}" 과목을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await subjectService.delete(subject.id);
      alert('삭제되었습니다.');
      loadSubjects();
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editingSubject) {
        await subjectService.update(editingSubject.id, data);
        alert('수정되었습니다.');
      } else {
        await subjectService.create(data);
        alert('생성되었습니다.');
      }
      setIsModalOpen(false);
      setEditingSubject(null);
      loadSubjects();
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const columns = [
    { key: 'name', label: '과목명' },
    { 
      key: 'color', 
      label: '색상', 
      render: (color) => color ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ 
            width: '20px', 
            height: '20px', 
            backgroundColor: color, 
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}></span>
          {color}
        </span>
      ) : '-' 
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>과목 관리</h1>
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
            + 새 과목 추가
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
          data={subjects}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSubject(null);
        }}
        title={editingSubject ? '과목 수정' : '새 과목 추가'}
      >
        <Form
          fields={fields.map(field => 
            field.name === 'academy_id' 
              ? { ...field, type: 'select', options: academies.map(a => ({ value: a.id, label: a.name })) }
              : field
          )}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingSubject(null);
          }}
          initialData={editingSubject || { academy_id: selectedAcademy }}
        />
      </Modal>
    </div>
  );
};

export default Subjects;

