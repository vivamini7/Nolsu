import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CSS/SurveyPage.css';
import howImage from './images/img_5.png';

export default function SurveyPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ 이전 선택값 받기
  const queryParams = new URLSearchParams(location.search);
  const age = queryParams.get('age');
  const sex = queryParams.get('sex');
  const purpose = queryParams.get('purpose');
  const who = queryParams.get('who');
  const how = queryParams.get('how');

  const [selectedWho, setSelectedWho] = useState(how || null);

  // ✅ 선택 후 다음 화면으로 이동
  const handleSelect = (how) => {
    setSelectedWho(how);
    setTimeout(() => {
      navigate(
        `/survey7?age=${encodeURIComponent(age)}&sex=${encodeURIComponent(sex)}&purpose=${encodeURIComponent(
          purpose)}&who=${encodeURIComponent(who)}
        )}&how=${encodeURIComponent(how)}`
      );
    }, 300); // 0.3초 후 이동
  };

  // ✅ 뒤로가기 (설문 3단계로 이동)
  const handleBack = () => {
    navigate(
      `/survey4?age=${encodeURIComponent(age)}&sex=${encodeURIComponent(sex)}&purpose=${encodeURIComponent(purpose)}&who=${encodeURIComponent(who)}`
    );
  };

  return (
    <div className="survey-container">
      <header className="survey-header">
        <div className="logo">놀슈</div>
        <div className="back-arrow" onClick={handleBack}>←</div>
        <div className="progress-text">5 / 7</div>
        <div className="progress-bar">
          <div className="bar-track">
            <div className="bar-fill" style={{ width: '72%' }}></div>
          </div>
        </div>
        <div className="menu-icon">☰</div>
      </header>

      <main className="survey-main">
        <p className="survey-question">어떻게 오셨어요?</p>
        <img src={howImage} alt="누구와 함께" className="survey-image" />
        <div className="survey-options">
          {[
            '✈️비행기',
            '🚌고속버스/시외버스',
            '🚝기차',
            '🚗자가용 및 렌트카',
          ].map((how) => (
            <button
              key={how}
              className={`option-button ${selectedWho === how ? 'selected' : ''}`}
              onClick={() => handleSelect(how)}
            >
              {how}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
