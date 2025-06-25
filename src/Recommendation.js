import React, { useState, useEffect } from 'react';
import './CSS/Recommendation.css';
import MapView from './MapView';
import mamukImg from './images/마묵.png';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';


const GEO_API_KEY = 'e3ab1ad7ef71ccdc312fea158c553d0a';

const geocodeAddress = async (address) => {
  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
    {
      headers: {
        Authorization: `KakaoAK ${GEO_API_KEY}`,
      },
    }
  );
  const data = await res.json();
  const loc = data.documents[0];
  return loc ? { lat: parseFloat(loc.y), lng: parseFloat(loc.x) } : null;
};

export default function RecommendationPage() {
  const [categories, setCategories] = useState(['업무공간', '식당', '프로그램']);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [placeInfo, setPlaceInfo] = useState(null);

  useEffect(() => {
    const fetchMarkers = async () => {
      const res = await fetch(`${process.env.PUBLIC_URL}/data/chungbuk_combined_cleaned.json`);
      const data = await res.json();
      const limited = data.slice(0, 100);

      const resolved = await Promise.all(
        limited.map(async ({ name, address, time, category, url }) => {
          const coord = await geocodeAddress(address);
          return coord ? { name, address, time, category, url, ...coord } : null;
        })
      );

      setMarkers(resolved.filter(Boolean));
    };

    fetchMarkers();
  }, []);

  const handleMarkerClick = (place) => {
    setPlaceInfo(place);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newPlaces = Array.from(selectedPlaces);
    const [moved] = newPlaces.splice(result.source.index, 1);
    newPlaces.splice(result.destination.index, 0, moved);
    setSelectedPlaces(newPlaces);
  };

  return (
    <div className="page-wrapper">
      <header className="header_last">
        <div className="logo_last">놀슈</div>
        <div className="menu-icon-last">☰</div>
      </header>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="category-tabs" direction="horizontal">
          {(provided) => (
            <div className="category-tabs" ref={provided.innerRef} {...provided.droppableProps}>
              {categories.map((label, i) => {
                const selected = selectedPlaces[i];
                return (
                  <Draggable key={i} draggableId={`tab-${i}`} index={i}>
                    {(provided) => (
                      <div
                        className={`tab ${selected ? 'active' : ''}`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {selected ? (
                          <>
                            <img src={selected.image} alt={selected.name} />
                            <div className="overlay">
                              <p>{selected.name}</p>
                              <span>🍀 {selected.address}</span>
                            </div>
                            <p>{label}</p>
                            <button
                              className="delete-btn"
                              onClick={() => {
                                const newPlaces = [...selectedPlaces];
                                newPlaces.splice(i, 1);
                                setSelectedPlaces(newPlaces);
                                const newCats = [...categories];
                                newCats.splice(i, 1);
                                setCategories(newCats);
                              }}
                            >
                              ❌
                            </button>
                          </>
                        ) : (
                          <div className="empty-card">{i + 1 < 10 ? `0${i + 1}` : i + 1} {label}</div>
                        )}
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
              <div
                className="tab add-tab"
                onClick={() => {
                  const newLabel = `기타`;
                  setCategories([...categories, newLabel]);
                }}
              >
                <div className="empty-card">➕ 추가</div>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="recommendation-body">
        <div className="map-area">
          <MapView
            latitude={36.6357}
            longitude={127.4917}
            zoom={9}
            markers={markers}
            onMarkerClick={handleMarkerClick}
          />
        </div>

        <div className="detail-card">
          {placeInfo ? (
            <>
              <h3>{placeInfo.name}</h3>
              <p>🟢 {placeInfo.category}</p>
              <p>🍀 {placeInfo.address}</p>
              <p>💚 {placeInfo.time || '운영 시간 정보 없음'}</p>
              <div className="button-group">
                {placeInfo.url && (
                  <button
                    className="select-button"
                    onClick={() => window.open(placeInfo.url, '_blank')}
                  >
                    자세히 보기
                  </button>
                )}
                <button
                  className="select-button"
                  onClick={() => {
                    const nextIndex = selectedPlaces.length;
                    if (nextIndex < categories.length) {
                      const newPlace = {
                        name: placeInfo.name,
                        address: placeInfo.address,
                        image: mamukImg,
                      };
                      setSelectedPlaces([...selectedPlaces, newPlace]);
                    } else {
                      alert('모든 카테고리 탭이 이미 선택되었습니다.');
                    }
                  }}
                >
                  선택하기
                </button>
              </div>
            </>
          ) : (
            <p>📝 장소를 선택하면 자세한 정보를 볼 수 있어요.</p>
          )}
        </div>
      </div>
    </div>
  );
}