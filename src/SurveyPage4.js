import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CSS/SurveyPage.css';
import whoImage from './images/img_4.png';

export default function SurveyPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ 이전 선택값 받기
  const queryParams = new URLSearchParams(location.search);
  const age = queryParams.get('age');
  const sex = queryParams.get('sex');
  const purpose = queryParams.get('purpose');
  const whoFromQuery = queryParams.get('who'); // 선택 유지용

  const [selectedWho, setSelectedWho] = useState(whoFromQuery || null);

  // ✅ 선택 후 다음 화면으로 이동
  const handleSelect = (who) => {
    setSelectedWho(who);
    setTimeout(() => {
      navigate(
        `/survey5?age=${encodeURIComponent(age)}&sex=${encodeURIComponent(sex)}&purpose=${encodeURIComponent(
          purpose
        )}&who=${encodeURIComponent(who)}`
      );
    }, 300); // 0.3초 후 이동
  };

  // ✅ 뒤로가기 (설문 3단계로 이동)
  const handleBack = () => {
    navigate(
      `/survey3?age=${encodeURIComponent(age)}&sex=${encodeURIComponent(sex)}&purpose=${encodeURIComponent(purpose)}`
    );
  };

  return (
    <div className="survey-container">
      <header className="survey-header">
        <div className="logo">놀슈</div>
        <div className="back-arrow" onClick={handleBack}>←</div>
        <div className="progress-text">4 / 5</div>
        <div className="progress-bar">
          <div className="bar-track">
            <div className="bar-fill" style={{ width: '80%' }}></div>
          </div>
        </div>
        <div className="menu-icon">☰</div>
      </header>

      <main className="survey-main">
        <p className="survey-question">누구와 함께 오셨나요?</p>
        <img src={whoImage} alt="누구와 함께" className="survey-image" />
        <div className="survey-options">
          {[
            '혼자 왔어요',
            '가족과 함께',
            '친구·지인과 함께',
            '회사·팀 동료와 함께',
          ].map((who) => (
            <button
              key={who}
              className={`option-button ${selectedWho === who ? 'selected' : ''}`}
              onClick={() => handleSelect(who)}
            >
              {who}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
