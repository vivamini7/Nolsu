import React, { useState } from 'react';
import './CSS/Recommendation.css';
import MapView from './MapView';
import mamukImg from './images/마묵.png';
import resomImg from './images/리솜.png';

export default function RecommendationPage() {
  const [selectedOffice, setSelectedOffice] = useState(null);

  const handleSelectOffice = () => {
    setSelectedOffice({
      name: '마묵 라운지',
      location: '충북 제천시 ...',
      image: mamukImg,
    });
  };

  return (
    <div className="page-wrapper">
      {/* 상단 고정 헤더 */}
      <header className="header_last">
        <div className="logo_last">놀슈</div>
        <div className="menu-icon-last">☰</div>
      </header>

      {/* 상단 탭 */}
      <div className="category-tabs">
        <div className="tab">
          <img src={resomImg} alt="숙소" />
          <div className="overlay">
            <p>포레스트 리솜</p>
            <span>🍀 충청북도 제천시</span>
          </div>
          <p>숙소</p>
        </div>

        <div className={`tab ${selectedOffice ? 'active' : ''}`}>
          {selectedOffice ? (
            <>
              <img src={selectedOffice.image} alt={selectedOffice.name} />
              <div className="overlay">
                <p>{selectedOffice.name}</p>
                <span>🍀 {selectedOffice.location}</span>
              </div>
            </>
          ) : (
            <div className="empty-card">② 업무공간</div>
          )}
        </div>

        <div className="tab">
          <div className="empty-card">③ 식당</div>
        </div>
        <div className="tab">
          <div className="empty-card">④ 프로그램</div>
        </div>
      </div>

      {/* 본문 */}
      <div className="recommendation-body">
        <div className="map-area">
          <MapView latitude={36.6357} longitude={127.4917} zoom={9} />
        </div>

        <div className="detail-card">
          <img src={mamukImg} alt="마묵 라운지" className="place-img" />
          <h3>마묵 라운지</h3>
          <p>카페, 디저트</p>
          <p>🍀 충북 제천시 백운면 금봉로 365</p>
          <p>💚 매일 08:00 - 19:00</p>

          <button className="select-button" onClick={handleSelectOffice}>
            업무공간 선택하기
          </button>
        </div>
      </div>
    </div>
  );
}
