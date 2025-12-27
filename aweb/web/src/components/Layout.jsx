import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAcademy } from '../contexts/AcademyContext';
import { useAuth } from '../contexts/AuthContext';
import { useWelcomeGuide } from '../contexts/WelcomeGuideContext';
import WelcomeGuideModal from './WelcomeGuideModal';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { academy, loading } = useAcademy();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const { showWelcomeGuide, openWelcomeGuide, closeWelcomeGuide } = useWelcomeGuide();

  const handleDontShowAgain = () => {
    localStorage.setItem('dontShowWelcomeGuide', 'true');
    closeWelcomeGuide();
  };

  const handleLogout = () => {
    if (window.confirm('로그아웃하시겠습니까?')) {
      logout();
      navigate('/login');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const sidebarMenuItems = [
    { path: '/students', label: '전체 학생 페이지', icon: '👨‍🎓' },
    { path: '/teachers', label: '전체 선생님 페이지', icon: '👨‍🏫' },
    { path: '/classes', label: '전체 시간표 페이지', icon: '📖' },
    { path: '/students?action=register', label: '학생 등록', icon: '➕' },
    { path: '/classes?action=register', label: '수업 등록', icon: '➕' },
  ];

  const menuItems = [
    { path: '/academies', label: '학원 관리', icon: '🏫' },
    { path: '/subjects', label: '과목 관리', icon: '📚' },
    { path: '/classrooms', label: '강의실 관리', icon: '🏛️' },
    { path: '/classes', label: '수업 관리', icon: '📖' },
    { path: '/teachers', label: '선생님 관리', icon: '👨‍🏫' },
    { path: '/students', label: '학생 관리', icon: '👨‍🎓' },
    { path: '/enrollments', label: '수강 등록', icon: '📝' },
  ];

  const topNavItems = [
    { path: '/settings', label: '설정', icon: '⚙️' },
    { path: '/logout', label: '로그아웃', icon: '🚪' },
  ];

  return (
    <div className="layout">
      {/* 사이드바 오버레이 */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}
      
      {/* 사이드바 네비게이션 */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">메뉴</h2>
          <button className="sidebar-close" onClick={closeSidebar}>
            ✕
          </button>
        </div>
        <nav className="sidebar-nav">
          {sidebarMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <header className="top-header">
        <div className="header-left">
          <button className="hamburger-menu" onClick={toggleSidebar} aria-label="메뉴 열기">
            <span></span>
            <span></span>
            <span></span>
          </button>
          <Link to="/" className="academy-logo-link">
            {academy?.logo_url ? (
              <img 
                src={academy.logo_url} 
                alt="학원 로고" 
                className="academy-logo"
              />
            ) : (
              <div className="logo-icon">🎓</div>
            )}
          </Link>
          <Link to="/" className="academy-name-link">
            <span className="academy-name">
              {loading ? '로딩 중...' : (academy?.name || '학원명')}
            </span>
          </Link>
        </div>
        <nav className="top-nav">
          <button
            onClick={openWelcomeGuide}
            className="top-nav-item"
            title="사용법"
          >
            <span className="nav-icon">📖</span>
            <span className="nav-label">사용법</span>
          </button>
          {topNavItems.map((item) => {
            if (item.path === '/logout') {
              return (
                <button
                  key={item.path}
                  onClick={handleLogout}
                  className="top-nav-item logout-button"
                  title={item.label}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              );
            }
            return (
              <Link
                key={item.path}
                to={item.path}
                className="top-nav-item"
                title={item.label}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="main-content">
        {children}
      </main>
      
      {/* 환영 가이드 모달 - 모든 페이지에서 사용 가능 */}
      <WelcomeGuideModal
        isOpen={showWelcomeGuide}
        onClose={closeWelcomeGuide}
        onDontShowAgain={handleDontShowAgain}
      />
    </div>
  );
};

export default Layout;
