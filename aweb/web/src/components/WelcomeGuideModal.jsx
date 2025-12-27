import { useState } from 'react';
import Modal from './Modal';
import './WelcomeGuideModal.css';

const WelcomeGuideModal = ({ isOpen, onClose, onDontShowAgain }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const steps = [
    {
      title: '🎓 에듀링크에 오신 것을 환영합니다!',
      content: (
        <div className="welcome-step">
          <p className="welcome-description">
            학원 관리를 더욱 쉽고 효율적으로 할 수 있도록 도와드리는 시스템입니다.
          </p>
          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon">👥</span>
              <div>
                <strong>학생 관리</strong>
                <p>학생 정보를 체계적으로 관리하고 출석을 기록할 수 있습니다.</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">👨‍🏫</span>
              <div>
                <strong>선생님 관리</strong>
                <p>선생님 정보와 담당 과목을 관리할 수 있습니다.</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📚</span>
              <div>
                <strong>수업 관리</strong>
                <p>수업 정보와 수강생을 관리하고 출석을 체크할 수 있습니다.</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '📊 대시보드 사용법',
      content: (
        <div className="welcome-step">
          <p className="welcome-description">
            대시보드에서 주요 현황을 한눈에 확인할 수 있습니다.
          </p>
          <div className="guide-list">
            <div className="guide-item">
              <div className="guide-number">1</div>
              <div>
                <strong>현황 카드</strong>
                <p>금일 현황, 총 학생 수, 선생님 수, 강좌 수를 확인할 수 있습니다.</p>
                <p className="guide-tip">💡 카드를 클릭하면 상세 페이지로 이동합니다.</p>
              </div>
            </div>
            <div className="guide-item">
              <div className="guide-number">2</div>
              <div>
                <strong>출근자 현황</strong>
                <p>오늘 출근한 선생님들의 목록을 확인할 수 있습니다.</p>
              </div>
            </div>
            <div className="guide-item">
              <div className="guide-number">3</div>
              <div>
                <strong>메뉴 탐색</strong>
                <p>좌측 메뉴에서 학생, 선생님, 수업 등 각 기능으로 이동할 수 있습니다.</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '🚀 시작하기',
      content: (
        <div className="welcome-step">
          <p className="welcome-description">
            다음 단계로 학원 관리를 시작해보세요!
          </p>
          <div className="start-list">
            <div className="start-item">
              <span className="start-icon">1️⃣</span>
              <div>
                <strong>학원 정보 설정</strong>
                <p>학원 정보를 입력하고 설정을 완료하세요.</p>
              </div>
            </div>
            <div className="start-item">
              <span className="start-icon">2️⃣</span>
              <div>
                <strong>과목 등록</strong>
                <p>수업에 필요한 과목들을 먼저 등록하세요.</p>
              </div>
            </div>
            <div className="start-item">
              <span className="start-icon">3️⃣</span>
              <div>
                <strong>선생님 등록</strong>
                <p>선생님 정보를 등록하고 담당 과목을 지정하세요.</p>
              </div>
            </div>
            <div className="start-item">
              <span className="start-icon">4️⃣</span>
              <div>
                <strong>수업 생성</strong>
                <p>수업을 생성하고 선생님을 배정하세요.</p>
              </div>
            </div>
            <div className="start-item">
              <span className="start-icon">5️⃣</span>
              <div>
                <strong>학생 등록</strong>
                <p>학생을 등록하고 수업에 배정하세요.</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setDontShowAgain(false);
    onClose();
  };

  const handleDontShowAgain = () => {
    if (dontShowAgain && onDontShowAgain) {
      onDontShowAgain();
    }
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={steps[currentStep].title}>
      <div className="welcome-guide-content">
        {steps[currentStep].content}
        
        <div className="welcome-progress">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`progress-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
            />
          ))}
        </div>

        <div className="welcome-actions">
          <div className="welcome-actions-left">
            <label className="dont-show-checkbox-label">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="dont-show-checkbox"
              />
              <span>다시 보지 않기</span>
            </label>
          </div>
          <div className="welcome-actions-right">
            {currentStep > 0 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={handlePrevious}
              >
                이전
              </button>
            )}
            <button
              type="button"
              className="btn-primary"
              onClick={currentStep === steps.length - 1 ? handleDontShowAgain : handleNext}
            >
              {currentStep === steps.length - 1 ? '시작하기' : '다음'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default WelcomeGuideModal;

