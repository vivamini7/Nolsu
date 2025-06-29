import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CSS/SurveyPage.css';
import sexImage from './images/img_2.png';

export default function SurveyPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const age = queryParams.get('age');
  const sexFromQuery = queryParams.get('sex'); // 뒤로 왔을 때 유지용

  const [selectedSex, setSelectedSex] = useState(sexFromQuery || null);

  useEffect(() => {
    if (sexFromQuery) {
      setSelectedSex(sexFromQuery);
    }
  }, [sexFromQuery]);

  const handleSelect = (sex) => {
    setSelectedSex(sex);
    setTimeout(() => {
      navigate(`/survey3?age=${encodeURIComponent(age)}&sex=${encodeURIComponent(sex)}`);
    }, 800);
  };

  const handleBack = () => {
    navigate(`/survey?age=${encodeURIComponent(age)}`); // 정확한 이전 경로로 이동
  };

  return (
    <div className="survey-container">
      <header className="survey-header">
        <div className="logo">놀슈</div>
        <div className="back-arrow" onClick={handleBack}>←</div>
        <div className="progress-text">2 / 7</div>
        <div className="progress-bar">
          <div className="bar-track">
            <div className="bar-fill" style={{ width: '28%' }}></div>
          </div>
        </div>
        <div className="menu-icon">☰</div>
      </header>

      <main className="survey-main">
        <p className="survey-question">성별을 알려주실래요?</p>
        <img src={sexImage} alt="성별 이미지" className="survey-image" />
        <div className="survey-options">
          {['남성', '여성', '선택하지않음'].map((sex) => (
            <button
              key={sex}
              className={`option-button ${selectedSex === sex ? 'selected' : ''}`}
              onClick={() => handleSelect(sex)}
            >
              {sex}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
