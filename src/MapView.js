import React, { useEffect, useRef } from 'react';

export default function MapView({
  latitude = 37.5665,
  longitude = 126.9780,
  zoom = 3,
  markers = [], // [{ name, lat, lng, category, address }]
  onMarkerClick = () => {},
}) {
  const mapRef = useRef(null);

  useEffect(() => {
    const { kakao } = window;
    if (!kakao || !mapRef.current) return;

    kakao.maps.load(() => {
      const container = mapRef.current;
      const options = {
        center: new kakao.maps.LatLng(latitude, longitude),
        level: zoom,
      };
      const map = new kakao.maps.Map(container, options);

      // 중심 마커 (선택사항)
      new kakao.maps.Marker({
        map,
        position: new kakao.maps.LatLng(latitude, longitude),
        title: '기본 위치',
      });

      // 마커 렌더링
      markers.forEach(({ name, lat, lng, category, address, time, url }) => {
        const imageSrc = `${process.env.PUBLIC_URL}/images/marker_${category}.png`;
        const imageSize = new kakao.maps.Size(32, 32);
        const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

        const marker = new kakao.maps.Marker({
          map,
          position: new kakao.maps.LatLng(lat, lng),
          title: name,
          image: markerImage,
        });

        const infowindow = new kakao.maps.InfoWindow({
          content: `<div style="padding:5px;font-size:13px;">${name}</div>`,
        });

        kakao.maps.event.addListener(marker, 'mouseover', () => infowindow.open(map, marker));
        kakao.maps.event.addListener(marker, 'mouseout', () => infowindow.close());

        // ✅ 마커 클릭 시 부모로 정보 전달
        kakao.maps.event.addListener(marker, 'click', () => {
          onMarkerClick({ name, lat, lng, category, address, time, url });
        });
      });
    });
  }, [latitude, longitude, zoom, markers, onMarkerClick]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '600px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    />
  );
}
