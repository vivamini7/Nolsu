import React from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 추가
import './CSS/MainPage.css';
import image1 from './images/image1.png';
import image2 from './images/image2.png';
import image3 from './images/image3.png';

export default function MainPage() {
  const navigate = useNavigate(); // 👈 훅 호출

  const handleSurveyClick = () => {
    navigate('/survey'); // 👈 이동 경로
  };

  return (
    <div className="main-container">
      <div className="left-section">
        <div className="logo">놀슈</div>
        <div className="title-group">
          <h2 className="subtitle">충북 워케이션의 모든 것</h2>
          <h1 className="main-title">놀슈</h1>
        </div>
        <p className="description">
          충청북도에서 맞춤형 워케이션을 즐기시려면, 잠깐만 설문에 응답해 주세요.<br />
          당신의 취향과 계획을 반영한 최적의 코스와 숙소,<br />
          액티비티를 추천해 드릴게요<br /><br />
          설문은 1분 정도 소요돼요. 편하게 시작해 볼까요?
        </p>
        <button className="cta-button" onClick={handleSurveyClick}>
          지금 설문하러 가기 →
        </button>
      </div>

      <div className="right-section">
        <div className="scroll-container">
          <div className="scroll-inner">
            <img src={image1} alt="충청북도의 호수 풍경" className="scroll-image" />
            <img src={image2} alt="산과 강이 어우러진 풍경" className="scroll-image" />
            <img src={image3} alt="충청북도 다리 전경" className="scroll-image" />
            <img src={image1} alt="" className="scroll-image" aria-hidden="true" />
            <img src={image2} alt="" className="scroll-image" aria-hidden="true" />
            <img src={image3} alt="" className="scroll-image" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}
