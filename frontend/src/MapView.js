// MapView.js
import React, { useEffect, useRef } from 'react';

export default function MapView({
  latitude = 37.5665,
  longitude = 126.978,
  zoom = 3,
  markers = [], // [{ name, lat, lng, category, address, isGptRecommended }]
  onMarkerClick = () => {},
}) {
  const mapRef = useRef(null);
  const kakaoMap = useRef(null);
  const markerLayer = useRef([]);
  const openedInfowindow = useRef(null);

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
  }, [latitude, longitude, zoom]);

  useEffect(() => {
    const { kakao } = window;
    if (!kakao || !kakaoMap.current) return;

    markerLayer.current.forEach(marker => marker.setMap(null));
    markerLayer.current = [];

    markers.forEach(({ name, lat, lng, category, address, time, url, isGptRecommended }) => {
      const imageSrc = isGptRecommended
        ? `${process.env.PUBLIC_URL}/images/gpt-marker.png`
        : `${process.env.PUBLIC_URL}/images/${category}.png`;
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

      kakao.maps.event.addListener(marker, 'click', () => {
        if (openedInfowindow.current) {
          openedInfowindow.current.close();
        }
        infowindow.open(kakaoMap.current, marker);
        openedInfowindow.current = infowindow;
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
