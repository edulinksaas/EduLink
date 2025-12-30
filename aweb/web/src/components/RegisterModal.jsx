import { useNavigate } from 'react-router-dom';
import { FaTimes, FaCalendarAlt, FaGraduationCap, FaUserFriends } from 'react-icons/fa';
import './RegisterModal.css';

const RegisterModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleRegisterClick = (type) => {
    onClose();
    if (type === 'class') {
      navigate('/?action=register');
    } else if (type === 'teacher') {
      navigate('/teachers?action=register');
    } else if (type === 'student') {
      navigate('/students?action=register');
    }
  };

  return (
    <>
      <div className="register-modal-overlay" onClick={onClose}></div>
      <div className="register-modal-container">
        <div className="register-modal-content">
          <div className="register-modal-header">
            <h2 className="register-modal-title">등록하기</h2>
            <button className="register-modal-close" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
          <div className="register-modal-body">
            <button 
              className="register-menu-item"
              onClick={() => handleRegisterClick('teacher')}
            >
              <div className="register-menu-icon purple">
                <FaGraduationCap />
              </div>
              <div className="register-menu-text">
                <div className="register-menu-title">선생님 등록</div>
                <div className="register-menu-subtitle">새로운 선생님을 등록합니다</div>
              </div>
            </button>

            <div className="register-menu-divider"></div>

            <button 
              className="register-menu-item"
              onClick={() => handleRegisterClick('class')}
            >
              <div className="register-menu-icon blue">
                <FaCalendarAlt />
              </div>
              <div className="register-menu-text">
                <div className="register-menu-title">수업 등록</div>
                <div className="register-menu-subtitle">새로운 수업을 등록합니다</div>
              </div>
            </button>

            <div className="register-menu-divider"></div>

            <button 
              className="register-menu-item"
              onClick={() => handleRegisterClick('student')}
            >
              <div className="register-menu-icon green">
                <FaUserFriends />
              </div>
              <div className="register-menu-text">
                <div className="register-menu-title">학생 등록</div>
                <div className="register-menu-subtitle">새로운 학생을 등록합니다</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterModal;

