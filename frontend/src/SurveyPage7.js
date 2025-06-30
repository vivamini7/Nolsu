import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CSS/SurveyPage.css';
import howImage from './images/img_6.png';

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
  const where = queryParams.get('where');

  const [selectedWho, setSelectedWho] = useState(where || null);

  // ✅ 선택 후 다음 화면으로 이동
  const handleSelect = (where) => {
    setSelectedWho(where);
    setTimeout(() => {
      navigate(
        `/survey8?age=${encodeURIComponent(age)}&sex=${encodeURIComponent(sex)}&purpose=${encodeURIComponent(
          purpose)}&who=${encodeURIComponent(who)}&how=${encodeURIComponent(how)}
        )}&where=${encodeURIComponent(where)}`
      );
    }, 300); // 0.3초 후 이동
  };

  // ✅ 뒤로가기 (설문 3단계로 이동)
  const handleBack = () => {
    navigate(
      `/survey6?age=${encodeURIComponent(age)}&sex=${encodeURIComponent(sex)}&purpose=${encodeURIComponent(purpose)}&who=${encodeURIComponent(who)}&how=${encodeURIComponent(how)}`
    );
  };

  return (
    <div className="survey-container">
      <header className="survey-header">
        <div className="logo">놀슈</div>
        <div className="back-arrow" onClick={handleBack}>←</div>
        <div className="progress-text">6 / 7</div>
        <div className="progress-bar">
          <div className="bar-track">
            <div className="bar-fill" style={{ width: '85%' }}></div>
          </div>
        </div>
        <div className="menu-icon">☰</div>
      </header>

      <main className="survey-main">
        <p className="survey-question">목적지가 정해져있나요?</p>
        <img src={howImage} alt="누구와 함께" className="survey-image" />
        <div className="survey-options">
          {[
            '청주',
            '제천',
            '충주',
            '단양',
            '진천',
            '보은',
            '고민중이에요',
          ].map((where) => (
            <button
              key={where}
              className={`option-button ${selectedWho === where ? 'selected' : ''}`}
              onClick={() => handleSelect(where)}
            >
              {where}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
