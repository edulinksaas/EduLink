import { useState, useEffect } from 'react';
import { academyService } from '../services/academyService';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Form from '../components/Form';
import './Page.css';

const Academies = () => {
  const [academies, setAcademies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAcademy, setEditingAcademy] = useState(null);

  const fields = [
    { name: 'name', label: '학원 이름', required: true },
    { name: 'logo_url', label: '로고 URL', type: 'url' },
    { name: 'address', label: '주소', type: 'textarea' },
  ];

  useEffect(() => {
    loadAcademies();
  }, []);

  const loadAcademies = async () => {
    try {
      setLoading(true);
      const response = await academyService.getAll();
      setAcademies(response.data.academies || []);
    } catch (error) {
      console.error('학원 목록 로드 실패:', error);
      alert('학원 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAcademy(null);
    setIsModalOpen(true);
  };

  const handleEdit = (academy) => {
    setEditingAcademy(academy);
    setIsModalOpen(true);
  };

  const handleDelete = async (academy) => {
    if (!window.confirm(`"${academy.name}" 학원을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await academyService.delete(academy.id);
      alert('삭제되었습니다.');
      loadAcademies();
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editingAcademy) {
        await academyService.update(editingAcademy.id, data);
        alert('수정되었습니다.');
      } else {
        await academyService.create(data);
        alert('생성되었습니다.');
      }
      setIsModalOpen(false);
      setEditingAcademy(null);
      loadAcademies();
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const columns = [
    { key: 'name', label: '학원 이름' },
    { key: 'address', label: '주소' },
    { key: 'logo_url', label: '로고', render: (url) => url ? <a href={url} target="_blank" rel="noopener noreferrer">보기</a> : '-' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>학원 관리</h1>
        <button onClick={handleCreate} className="btn btn-primary">
          + 새 학원 추가
        </button>
      </div>

      {loading ? (
        <div className="loading">로딩 중...</div>
      ) : (
        <Table
          columns={columns}
          data={academies}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAcademy(null);
        }}
        title={editingAcademy ? '학원 수정' : '새 학원 추가'}
      >
        <Form
          fields={fields}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingAcademy(null);
          }}
          initialData={editingAcademy || {}}
        />
      </Modal>
    </div>
  );
};

export default Academies;

