import React, { useState, useEffect } from 'react';
import './CSS/Recommendation.css';
import MapView from './MapView';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const GEO_API_KEY = 'e3ab1ad7ef71ccdc312fea158c553d0a';

const geocodeAddress = async (address) => {
  try {
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
      {
        headers: {
          Authorization: `KakaoAK ${GEO_API_KEY}`,
        },
      }
    );
    const data = await res.json();

    if (data.documents && data.documents.length > 0) {
      const loc = data.documents[0];
      return { lat: parseFloat(loc.y), lng: parseFloat(loc.x) };
    } else {
      console.warn(`[지오코딩 실패] 주소를 찾을 수 없음: ${address}`);
      return null;
    }
  } catch (error) {
    console.error(`[지오코딩 에러] 주소: ${address}`, error);
    return null;
  }
};

export default function RecommendationPage() {
  const [categories, setCategories] = useState(['숙소', '업무공간', '식당', '프로그램']);
  const [selectedCategory, setSelectedCategory] = useState('숙소');
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [allMarkers, setAllMarkers] = useState([]);
  const [placeInfo, setPlaceInfo] = useState(null);
  const [imageExists, setImageExists] = useState(true);

  const categoryMap = {
    '숙소': 'stay',
    '업무공간': 'cafe',
    '식당': 'food',
    '프로그램': 'program',
  };

  const loadCategoryData = async (categoryKo) => {
    const categoryEn = categoryMap[categoryKo];
    try {
      const res = await fetch(`${process.env.PUBLIC_URL}/data/${categoryEn}.json`);
      const data = await res.json();

      const resolved = await Promise.all(
        data.map(async ({ name, address, time, category, url }) => {
          const coord = await geocodeAddress(address);
          return coord ? { name, address, time, category, url, ...coord } : null;
        })
      );

      setAllMarkers(resolved.filter(Boolean));
      setPlaceInfo(null); // 기존 선택 장소 초기화
    } catch (err) {
      console.error(`[파일 로딩 실패] /data/${categoryEn}.json`, err);
    }
  };

  useEffect(() => {
    loadCategoryData(selectedCategory); // 초기 로딩
  }, []);

  useEffect(() => {
    if (placeInfo) {
      const imagePath = `${process.env.PUBLIC_URL}/images/${placeInfo.name}.jpg`;
      fetch(imagePath)
        .then((res) => setImageExists(res.ok))
        .catch(() => setImageExists(false));
    }
  }, [placeInfo]);

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

  const filteredMarkers = allMarkers;

  return (
    <div className="page-wrapper">
      <header className="header_last">
        <div className="logo_last">놀슈</div>
        <div className="menu-icon-last">☰</div>
      </header>

      {/* 카테고리 필터 버튼 */}
      <div className="category-filter-buttons">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              loadCategoryData(cat);
            }}
            className={selectedCategory === cat ? 'filter-btn active' : 'filter-btn'}
          >
            {cat}
          </button>
        ))}
      </div>

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
                            <img src={selected.image} alt={selected.name} className="tab-image" />
                            <div className="overlay">
                              <p>{selected.name}</p>
                              <span>🍀 {selected.address}</span>
                            </div>
                            <p>{label}</p>
                            <button
                              className="delete-btn"
                              onClick={() => {
                                const newPlaces = [...selectedPlaces];
                                newPlaces[i] = undefined;
                                setSelectedPlaces(newPlaces);
                              }}
                            >
                              ❌
                            </button>
                          </>
                        ) : (
                          <div className="empty-card">
                            {i + 1 < 10 ? `0${i + 1}` : i + 1} {label}
                          </div>
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
            markers={filteredMarkers}
            onMarkerClick={handleMarkerClick}
          />
        </div>

        <div className="detail-card">
          {placeInfo ? (
            <>
              {imageExists ? (
                <img
                  src={`${process.env.PUBLIC_URL}/images/${placeInfo.name}.jpg`}
                  alt={placeInfo.name}
                  className="place-image"
                />
              ) : (
                <p>🖼️ 이미지가 없습니다</p>
              )}

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
                    const nextIndex = selectedPlaces.findIndex((p) => p === undefined);
                    const safeIndex = nextIndex !== -1 ? nextIndex : selectedPlaces.length;

                    if (safeIndex < categories.length) {
                      const newPlace = {
                        name: placeInfo.name,
                        address: placeInfo.address,
                        image: `${process.env.PUBLIC_URL}/images/${placeInfo.name}.jpg`,
                      };
                      const newPlaces = [...selectedPlaces];
                      newPlaces[safeIndex] = newPlace;
                      setSelectedPlaces(newPlaces);
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
