import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './CSS/SurveyPage.css';

export default function SurveyPage5() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const age = queryParams.get('age');
  const sex = queryParams.get('sex');
  const purpose = queryParams.get('purpose');
  const who = queryParams.get('who');

  const [clickedButton, setClickedButton] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setClickedButton('confirm');
    setLoading(true);

    try {
      // ✅ GPT 응답 대신 임시로 응답 생성
      const result = await getMockRecommendation({ age, sex, purpose, who });

      navigate('/recommendation', {
        state: {
          age,
          sex,
          purpose,
          who,
          result, // 임시 응답
        },
      });
    } catch (err) {
      alert('추천 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
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

        {loading && <p style={{ marginTop: '1.5rem' }}>추천을 생성하고 있어요... 잠시만 기다려 주세요 🙌</p>}
      </main>
    </div>
  );
}

// ✅ GPT 대신 사용하는 임시 응답 함수
function getMockRecommendation({ age, sex, purpose, who }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`안녕하세요! ${age} ${sex} 분이 ${who}와 함께 "${purpose}" 목적으로 워케이션을 계획하고 계시군요.\n
제주도의 바닷가 근처 조용한 카페와 협업 공간을 추천드립니다. 😊`);
    }, 1000); // 1초 후 응답 받는 것처럼
  });
}
