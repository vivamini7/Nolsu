import React, { useEffect, useRef } from 'react';

export default function MapView({ latitude = 37.5665, longitude = 126.9780, zoom = 3 }) {
  const mapRef = useRef(null);

  useEffect(() => {
    const { kakao } = window;

    if (!kakao || !mapRef.current) return;

    kakao.maps.load(() => {
      const container = mapRef.current;
      const options = {
        center: new kakao.maps.LatLng(latitude, longitude),
        level: zoom, // 숫자가 작을수록 확대
      };
      new kakao.maps.Map(container, options);
    });
  }, [latitude, longitude, zoom]);

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
