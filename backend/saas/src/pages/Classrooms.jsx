import { useState, useEffect } from 'react';
import { classroomService } from '../services/classroomService';
import { academyService } from '../services/academyService';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Form from '../components/Form';
import './Page.css';

const Classrooms = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [academies, setAcademies] = useState([]);
  const [selectedAcademy, setSelectedAcademy] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState(null);

  const fields = [
    { name: 'academy_id', label: '학원', required: true, type: 'select' },
    { name: 'name', label: '강의실 명', required: true },
    { name: 'capacity', label: '수용 인원', required: true, type: 'number' },
  ];

  useEffect(() => {
    loadAcademies();
  }, []);

  useEffect(() => {
    if (selectedAcademy) {
      loadClassrooms();
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

  const loadClassrooms = async () => {
    if (!selectedAcademy) return;
    try {
      setLoading(true);
      const response = await classroomService.getAll(selectedAcademy);
      setClassrooms(response.data.classrooms || []);
    } catch (error) {
      console.error('강의실 목록 로드 실패:', error);
      alert('강의실 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingClassroom(null);
    setIsModalOpen(true);
  };

  const handleEdit = (classroom) => {
    setEditingClassroom(classroom);
    setIsModalOpen(true);
  };

  const handleDelete = async (classroom) => {
    if (!window.confirm(`"${classroom.name}" 강의실을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await classroomService.delete(classroom.id);
      alert('삭제되었습니다.');
      loadClassrooms();
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editingClassroom) {
        await classroomService.update(editingClassroom.id, data);
        alert('수정되었습니다.');
      } else {
        await classroomService.create(data);
        alert('생성되었습니다.');
      }
      setIsModalOpen(false);
      setEditingClassroom(null);
      loadClassrooms();
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const columns = [
    { key: 'name', label: '강의실 명' },
    { key: 'capacity', label: '수용 인원' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>강의실 관리</h1>
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
            + 새 강의실 추가
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
          data={classrooms}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClassroom(null);
        }}
        title={editingClassroom ? '강의실 수정' : '새 강의실 추가'}
      >
        <Form
          fields={fields.map(field => 
            field.name === 'academy_id' 
              ? { ...field, options: academies.map(a => ({ value: a.id, label: a.name })) }
              : field
          )}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingClassroom(null);
          }}
          initialData={editingClassroom || { academy_id: selectedAcademy }}
        />
      </Modal>
    </div>
  );
};

export default Classrooms;

