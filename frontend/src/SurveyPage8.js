import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CSS/SurveyPage.css';
import Image from './images/img_7.png';

export default function SurveyPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const age = queryParams.get('age');
  const sex = queryParams.get('sex');
  const purpose = queryParams.get('purpose');
  const who = queryParams.get('who');
  const how = queryParams.get('how');
  const where = queryParams.get('where');
  const what = queryParams.get('what');

  const [selectedWhat, setSelectedWhat] = useState(what || null);
  const [customInput, setCustomInput] = useState('');

  const handleSelect = (option) => {
    setSelectedWhat(option);
    if (option === '적기') return; // 텍스트 입력을 기다림
    navigateToNext(option);
  };

  const navigateToNext = (finalWhat) => {
    setTimeout(() => {
      navigate(
        `/survey5?age=${encodeURIComponent(age)}&sex=${encodeURIComponent(sex)}&purpose=${encodeURIComponent(
          purpose)}&who=${encodeURIComponent(who)}&how=${encodeURIComponent(how)}&where=${encodeURIComponent(where)}&what=${encodeURIComponent(finalWhat)}`
      );
    }, 300);
  };

  const handleInputConfirm = () => {
    if (!customInput.trim()) return alert('내용을 입력해 주세요!');
    navigateToNext(customInput.trim());
  };

  const handleBack = () => {
    navigate(
      `/survey7?age=${encodeURIComponent(age)}&sex=${encodeURIComponent(sex)}&purpose=${encodeURIComponent(purpose)}&who=${encodeURIComponent(who)}&how=${encodeURIComponent(how)}&where=${encodeURIComponent(where)}`
    );
  };

  return (
    <div className="survey-container">
      <header className="survey-header">
        <div className="logo">놀슈</div>
        <div className="back-arrow" onClick={handleBack}>←</div>
        <div className="progress-text">7 / 7</div>
        <div className="progress-bar">
          <div className="bar-track">
            <div className="bar-fill" style={{ width: '100%' }}></div>
          </div>
        </div>
        <div className="menu-icon">☰</div>
      </header>

      <main className="survey-main">
        <p className="survey-question">어떤 워케이션 스타일이신가요?</p>
        <img src={Image} alt="누구와 함께" className="survey-image" />

        <div className="survey-options">
          {['적기', 'skip'].map((option) => (
            <button
              key={option}
              className={`option-button ${selectedWhat === option ? 'selected' : ''}`}
              onClick={() => handleSelect(option)}
            >
              {option}
            </button>
          ))}
        </div>

        {/* 적기 선택 시 텍스트 입력창 노출 */}
        {selectedWhat === '적기' && (
          <div style={{ marginTop: '-3.5rem', textAlign: 'center' }}>
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="원하는 스타일을 입력해 주세요"
              className="custom-input"
              style={{ padding: '0.6rem', fontSize: '1rem', width: '100%', height: '42px', borderRadius: '8px', border: '1px solid #ccc' }}
            />
            <br />
            <button
              onClick={handleInputConfirm}
              className="option-button"
              style={{ marginTop: '0.5rem' }}
            >
              입력 완료
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
