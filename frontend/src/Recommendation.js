// RecommendationPage.js
import React, { useState, useEffect } from 'react';
import './CSS/Recommendation.css';
import MapView from './MapView';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useNavigate, useLocation } from 'react-router-dom';

const GEO_API_KEY = 'e3ab1ad7ef71ccdc312fea158c553d0a';

const geocodeAddress = async (address) => {
  try {
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
      {
        headers: { Authorization: `KakaoAK ${GEO_API_KEY}` },
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
  const [categories] = useState(['숙소', '업무공간', '식당', '프로그램']);
  const [selectedCategory, setSelectedCategory] = useState('숙소');
  const [allMarkers, setAllMarkers] = useState([]);
  const [placeInfo, setPlaceInfo] = useState(null);
  const [imageExists, setImageExists] = useState(true);
  const location = useLocation();
  const [selectedPlaces, setSelectedPlaces] = useState(() => location.state?.selectedPlaces || [undefined, undefined, undefined, undefined]);
  const [mapCenter, setMapCenter] = useState({ lat: 36.6357, lng: 127.4917 });
  const navigate = useNavigate();
  const result = {
    stay: [
      {
        name: "포레스트힐링캠프",
        reason: "편안한 휴식을 위한 최적의 숙소입니다.",
        address: "충북 단양군 가곡면 새밭로 240 (포레스트힐링캠프)"
      },
      {
        name: "구름위의산책",
        reason: "탁 트인 전망과 함께하는 특별한 워케이션 숙소",
        address: "충북 단양군 가곡면 두산길 179-18"
      },
      {
        name: "더즌호텔",
        reason: "단양 시내 중심에 위치한 쾌적한 비즈니스 호텔",
        address: "충북 단양군 단양읍 별곡10길 10"
      }
    ],
    cafe: [
      {
        name: "할리스충북오송점",
        reason: "접근성과 좌석이 좋고 워케이션에 적합한 카페",
        address: "충북 청주시 흥덕구 오송읍 만수1길 3"
      },
      {
        name: "레인디어커피",
        reason: "감성적인 분위기와 커피로 집중력을 높일 수 있는 공간",
        address: "충북 청주시 흥덕구 가포산로 191"
      },
      {
        name: "카페다우리",
        reason: "브런치와 함께 여유로운 분위기를 즐길 수 있는 카페",
        address: "충북 단양군 대강면 선암계곡로 165"
      }
    ],
    food: [
      {
        name: "스시서울 청주점",
        reason: "신선한 스시와 정갈한 분위기",
        address: "충북 청주시 서원구 예체로1번길 20"
      },
      {
        name: "경복궁청주점",
        reason: "전통 한식의 품격을 느낄 수 있는 공간",
        address: "충북 청주시 흥덕구 2순환로 1250 3"
      },
      {
        name: "청풍떡갈비",
        reason: "청풍호 근처에서 맛보는 전통 떡갈비",
        address: "충북 제천시 금성면 청풍호로 1643"
      }
    ],
    program: [
      {
        name: "초평호 미르309 출렁다리",
        reason: "탁 트인 경치와 스릴을 함께 느낄 수 있는 명소",
        address: "충북 진천군 초평면 화산리 산 7-1"
      },
      {
        name: "국립제천 치유의 숲",
        reason: "자연 속에서 힐링과 명상을 동시에",
        address: "충북 제천시 청풍면 학현소야로 590"
      },
      {
        name: "청주시 반려견 놀이터(문암생태공원 내)",
        reason: "반려동물과 함께 즐길 수 있는 워케이션 휴식 공간",
        address: "충북 청주시 흥덕구 무심서로 1097"
      }
    ]
  };

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
      const gptNames = (result?.[categoryEn] || []).map(item => item.name);

      const resolved = await Promise.all(
        data.map(async ({ name, address, time, category, url }) => {
          const coord = await geocodeAddress(address);
          const isGptRecommended = gptNames.includes(name);
          return coord ? { name, address, time, category, url, isGptRecommended, ...coord } : null;
        })
      );

      setAllMarkers(resolved.filter(Boolean));
      setPlaceInfo(null);
    } catch (err) {
      console.error(`[파일 로딩 실패] /data/${categoryEn}.json`, err);
    }
  };

  useEffect(() => {
    loadCategoryData(selectedCategory);
  }, []);

  useEffect(() => {
    const gptList = result?.[categoryMap[selectedCategory]];
    if (gptList && gptList.length > 0) {
      const item = gptList[0];
      const name = item?.name || '이름 없음';
      const reason = item?.reason || '';

      geocodeAddress(name).then(coord => {
        const place = {
          name,
          address: name,
          time: '',
          url: '',
          category: selectedCategory,
          reason,
          ...(coord || { lat: 36.6357, lng: 127.4917 })
        };
        setPlaceInfo(place);
        if (coord) setMapCenter(coord);
      });
    } else {
      setPlaceInfo(null);
    }
  }, [selectedCategory, result]);

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
    setMapCenter({ lat: place.lat, lng: place.lng });
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

      <div className="map-area">
        <div className="map-overlay-buttons">
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
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="category-tabs" direction="horizontal">
          {(provided) => (
            <div className="category-tabs" ref={provided.innerRef} {...provided.droppableProps}>
              {selectedPlaces.map((selected, i) => {
                const label = categories[i] || `기타`;
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
                  setSelectedPlaces([...selectedPlaces, undefined]);
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
            latitude={mapCenter.lat}
            longitude={mapCenter.lng}
            zoom={9}
            markers={allMarkers}
            onMarkerClick={handleMarkerClick}
          />
        </div>

        <div className="detail-card">
          <h4>🔍 GPT 추천 리스트 ({selectedCategory})
            <div className="done-button-top">
              <button
                className="done-btn"
                onClick={() =>
                  navigate('/result', { state: { selectedPlaces: selectedPlaces.filter(Boolean) } })
                }
              >
                완료
              </button>
            </div>
          </h4>

          <ul className="recommend-list">
            {(result?.[categoryMap[selectedCategory]] || []).map((item, idx) => {
              const name = item?.name || '이름 없음';
              const reason = item?.reason || '';
              const address = item?.address || item?.name;
              const matched = allMarkers.find(m => m.name === name);
              const imagePath = matched
                ? `${process.env.PUBLIC_URL}/images/${matched.name}.jpg`
                : `${process.env.PUBLIC_URL}/images/placeholder.jpg`;

              return (
                <li
                  key={idx}
                  className="recommend-card"
                  onClick={() => {
                    const place = {
                      name,
                      address: matched?.address || address,
                      time: matched?.time || '',
                      url: matched?.url || '',
                      category: selectedCategory,
                      reason,
                      lat: matched?.lat || 36.6357,
                      lng: matched?.lng || 127.4917,
                    };
                    setPlaceInfo(place);
                    setMapCenter({ lat: place.lat, lng: place.lng });
                  }}
                >
                  <div className="card-left">
                    <strong className="card-title">{name}</strong>
                    <p className="card-reason">{reason}</p>
                    {matched?.address && <p className="card-detail">📍 {matched.address}</p>}
                    {matched?.time && <p className="card-detail">⏰ {matched.time}</p>}
                  </div>
                  <div className="card-right">
                    <img src={imagePath} alt={name} className="recommend-thumbnail" />
                  </div>
                </li>
              );
            })}
          </ul>

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
                    const newPlace = {
                      name: placeInfo.name,
                      address: placeInfo.address,
                      image: `${process.env.PUBLIC_URL}/images/${placeInfo.name}.jpg`,
                    };
                    const newPlaces = [...selectedPlaces];
                    newPlaces[safeIndex] = newPlace;
                    setSelectedPlaces(newPlaces);
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
