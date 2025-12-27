import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { parentService } from '../services/parentService';
import { studentService } from '../services/studentService';
import './ParentChildren.css';

const ParentChildren = () => {
  const { parentId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [parent, setParent] = useState(null);
  const [children, setChildren] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (parentId) {
      loadParentAndChildren();
    } else {
      // parentId가 없으면 전화번호로 조회 시도 (예시)
      setError('학부모 ID가 필요합니다.');
      setLoading(false);
    }
  }, [parentId]);

  const loadParentAndChildren = async () => {
    try {
      setLoading(true);
      setError(null);

      // 학부모 정보 조회
      const parentRes = await parentService.getById(parentId);
      setParent(parentRes.data?.parent);

      // 자녀 목록 조회
      const childrenRes = await parentService.getChildren(parentId);
      setChildren(childrenRes.data?.children || []);
    } catch (err) {
      console.error('학부모 및 자녀 정보 조회 실패:', err);
      setError(err.response?.data?.error || '정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = (studentId) => {
    navigate(`/students/${studentId}`);
  };

  if (loading) {
    return (
      <div className="parent-children-page">
        <div className="loading">자녀 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="parent-children-page">
        <div className="error-message">
          <h2>오류 발생</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')}>홈으로 돌아가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="parent-children-page">
      <div className="parent-header">
        <h1>자녀 목록</h1>
        {parent && (
          <div className="parent-info">
            <p><strong>학부모:</strong> {parent.name || '이름 없음'}</p>
            <p><strong>연락처:</strong> {parent.phone}</p>
            {parent.institution_name && (
              <p><strong>학원:</strong> {parent.institution_name}</p>
            )}
          </div>
        )}
      </div>

      {children.length === 0 ? (
        <div className="empty-state">
          <p>등록된 자녀가 없습니다.</p>
        </div>
      ) : (
        <div className="children-list">
          {children.map((child) => (
            <div
              key={child.id}
              className="child-card"
              onClick={() => handleStudentClick(child.id)}
            >
              <div className="child-info">
                <h3>{child.name}</h3>
                {child.grade && <p className="child-grade">학년: {child.grade}</p>}
                {child.relationship && (
                  <p className="relationship">관계: {child.relationship}</p>
                )}
              </div>
              <div className="child-actions">
                <button className="view-detail-btn">상세 보기 →</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParentChildren;

