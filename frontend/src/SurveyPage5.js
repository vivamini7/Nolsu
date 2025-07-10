import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './CSS/SurveyPage.css';

export default function SurveyPage5() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const clean = (str) => decodeURIComponent(str || '').replace(/[)}]+$/, '').trim();

  const age = clean(queryParams.get('age'));
  const sex = clean(queryParams.get('sex'));
  const purpose = clean(queryParams.get('purpose'));
  const who = clean(queryParams.get('who'));
  const how = clean(queryParams.get('how'));
  const where = clean(queryParams.get('where'));
  const what = clean(queryParams.get('what'));

  const [clickedButton, setClickedButton] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    setClickedButton('confirm');
    setLoading(true);

    // 5초 후 자동 이동
    setTimeout(() => {
      navigate('/recommendation', {
        state: {
          age,
          sex,
          purpose,
          who,
          how,
          where,
          what,
          result: null, // 결과는 없지만 구조 맞춤
        },
      });
    }, 3000);
  };

  const handleReset = () => {
    setClickedButton('reset');
    setTimeout(() => {
      navigate('/survey');
    }, 200);
  };

  return (
    <div className="survey-container">
      <header className="survey-header">
        <div className="logo">놀슈</div>
        <div className="progress-text">5 / 5</div>
        <div className="menu-icon">☰</div>
      </header>

      <main className="survey-main">
        <h2 className="survey-question">설문 요약</h2>
        <ul style={{ listStyle: 'none', padding: 0, fontSize: '1.1rem', lineHeight: '2' }}>
          <li>🔹 연령대: <strong>{age}</strong></li>
          <li>🔹 성별: <strong>{sex}</strong></li>
          <li>🔹 워케이션 목적: <strong>{purpose}</strong></li>
          <li>🔹 함께 온 사람: <strong>{who}</strong></li>
          <li>🔹 이동수단: <strong>{how}</strong></li>
          <li>🔹 희망지역: <strong>{where}</strong></li>
          <li>🔹 워케이션 스타일: <strong>{what}</strong></li>
        </ul>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            className={`option-button ${clickedButton === 'confirm' ? 'selected' : ''}`}
            onClick={handleConfirm}
            disabled={loading}
          >
            확인
          </button>
          <button
            className={`option-button ${clickedButton === 'reset' ? 'selected' : ''}`}
            onClick={handleReset}
            disabled={loading}
          >
            다시 선택하기
          </button>
        </div>

        {loading && <p style={{ marginTop: '1.5rem' }}>보내는 중입니다... 잠시만 기다려 주세요 🙌</p>}
      </main>
    </div>
  );
}
