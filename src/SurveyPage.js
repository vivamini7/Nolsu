import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/SurveyPage.css';
import ageImage from './images/img_1.png';

export default function SurveyPage() {
  const [selectedAge, setSelectedAge] = useState(null);
  const navigate = useNavigate();

  const handleSelect = (age) => {
    setSelectedAge(age);
    // 0.3초 후 이동 → UX 부드럽게
    setTimeout(() => {
      navigate(`/survey2?age=${encodeURIComponent(age)}`);
    }, 800);
  };

  return (
    <div className="survey-container">
      <header className="survey-header">
        <div className="logo">놀슈</div>
        <div className="back-arrow">←</div>
        <div className="progress-text">1 / 5</div>
        <div className="progress-bar">
          <div className="bar-track">
            <div className="bar-fill" style={{ width: '20%' }}></div>
          </div>
        </div>
        <div className="menu-icon">☰</div>
      </header>

      <main className="survey-main">
        <p className="survey-question">어느 연령대에 속하시나요?</p>
        <img src={ageImage} alt="연령대 이미지" className="survey-image" />
        <div className="survey-options">
          {['20대', '30대', '40대 이상'].map((age) => (
            <button
              key={age}
              className={`option-button ${selectedAge === age ? 'selected' : ''}`}
              onClick={() => handleSelect(age)}
            >
              {age}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
