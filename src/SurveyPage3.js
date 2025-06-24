import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CSS/SurveyPage.css';
import worImage from './images/img_3.png';

export default function SurveyPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // 쿼리에서 이전 선택 값 받기
  const queryParams = new URLSearchParams(location.search);
  const age = queryParams.get('age');
  const sex = queryParams.get('sex');
  const purposeFromQuery = queryParams.get('purpose'); // 선택 유지용

  const [selectedPurpose, setSelectedPurpose] = useState(purposeFromQuery || null);

  // 선택 후 다음 페이지로 이동
  const handleSelect = (purpose) => {
    setSelectedPurpose(purpose);
    setTimeout(() => {
      navigate(
        `/survey4?age=${encodeURIComponent(age)}&sex=${encodeURIComponent(sex)}&purpose=${encodeURIComponent(purpose)}`
      );
    }, 800); // 0.3초 뒤 이동
  };

  // 뒤로 가기 (survey2로 이동, 선택값 유지)
  const handleBack = () => {
    navigate(`/survey2?age=${encodeURIComponent(age)}&sex=${encodeURIComponent(sex)}`);
  };

  return (
    <div className="survey-container">
      <header className="survey-header">
        <div className="logo">놀슈</div>
        <div className="back-arrow" onClick={handleBack}>←</div>
        <div className="progress-text">3 / 5</div>
        <div className="progress-bar">
          <div className="bar-track">
            <div className="bar-fill" style={{ width: '60%' }}></div>
          </div>
        </div>
        <div className="menu-icon">☰</div>
      </header>

      <main className="survey-main">
        <p className="survey-question">이번 워케이션은 어떤 이유로 오셨나요?</p>
        <img src={worImage} alt="워케이션 목적 이미지" className="survey-image" />
        <div className="survey-options">
          {[
            '일에 집중하러 왔어요',
            '일도 하고 놀기도 할 거예요',
            '스터디·자기계발하러 왔어요',
            '그 외 (직접 입력)',
          ].map((purpose) => (
            <button
              key={purpose}
              className={`option-button ${selectedPurpose === purpose ? 'selected' : ''}`}
              onClick={() => handleSelect(purpose)}
            >
              {purpose}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
