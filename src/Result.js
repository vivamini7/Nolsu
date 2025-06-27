// ResultPage.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './CSS/ResultPage.css';

export default function ResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const selectedPlaces = state?.selectedPlaces || [];

  return (
    <div className="result-page">
      <h2>선택한 장소 목록</h2>
      <div className="place-list">
        {selectedPlaces.length === 0 ? (
          <p>선택한 장소가 없습니다.</p>
        ) : (
          selectedPlaces.map((place, idx) => (
            <div key={idx} className="place-card">
              <img src={place.image} alt={place.name} />
              <div>
                <h3>{place.name}</h3>
                <p>📍 {place.address}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        className="back-btn"
        onClick={() => navigate('/recommendation', { state: { selectedPlaces } })}
      >
        ⏪돌아가기
      </button>
    </div>  
  );
}
