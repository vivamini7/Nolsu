import React, { useEffect, useRef } from 'react';

export default function MapView({
  latitude = 37.5665,
  longitude = 126.978,
  zoom = 3,
  markers = [], // [{ name, lat, lng, category, address }]
  onMarkerClick = () => {},
}) {
  const mapRef = useRef(null);
  const kakaoMap = useRef(null); // 지도 객체
  const markerLayer = useRef([]); // 마커 배열
  const openedInfowindow = useRef(null); // 현재 열린 인포윈도우

  useEffect(() => {
    const { kakao } = window;
    if (!kakao || !mapRef.current) return;

    kakao.maps.load(() => {
      const container = mapRef.current;
      const options = {
        center: new kakao.maps.LatLng(latitude, longitude),
        level: zoom,
      };
      kakaoMap.current = new kakao.maps.Map(container, options);
    });
  }, [latitude, longitude, zoom]); // ✅ 수정된 부분


  useEffect(() => {
    const { kakao } = window;
    if (!kakao || !kakaoMap.current) return;

    // 기존 마커 제거
    markerLayer.current.forEach(marker => marker.setMap(null));
    markerLayer.current = [];

    markers.forEach(({ name, lat, lng, category, address, time, url }) => {
      const imageSrc = `${process.env.PUBLIC_URL}/images/marker_${category}.png`;
      const imageSize = new kakao.maps.Size(32, 32);
      const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

      const marker = new kakao.maps.Marker({
        map: kakaoMap.current,
        position: new kakao.maps.LatLng(lat, lng),
        title: name,
        image: markerImage,
      });

      const infowindow = new kakao.maps.InfoWindow({
        content: `<div style="padding:5px;font-size:13px;">${name}</div>`,
      });

      // ✅ 마커 클릭 시만 InfoWindow 표시
      kakao.maps.event.addListener(marker, 'click', () => {
        if (openedInfowindow.current) {
          openedInfowindow.current.close(); // 이전 인포윈도우 닫기
        }
        infowindow.open(kakaoMap.current, marker);
        openedInfowindow.current = infowindow;

        // 부모로 전달
        onMarkerClick({ name, lat, lng, category, address, time, url });
      });

      markerLayer.current.push(marker);
    });
  }, [markers, onMarkerClick]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '500px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgb(216, 216, 216)',
      }}
    />
  );
}
