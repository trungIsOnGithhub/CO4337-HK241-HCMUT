import React, { useState, useRef, useEffect } from 'react';
import goongjs from '@goongmaps/goong-js';
import '@goongmaps/goong-js/dist/goong-js.css';
import axios from 'axios';

const GOONG_API_KEY = '2jcRRCquuKp2hdK4BcQsMZLsrJuXSNuXYlfcWXyA';
const GOONG_MAPTILES_KEY = 'hzX8cXab72XCozZSYvZqkV26qMMQ8JdpkiUwK1Iy';

const MapConvert = () => {
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [error, setError] = useState('');
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return; // initialize map only once

    goongjs.accessToken = GOONG_MAPTILES_KEY;

    map.current = new goongjs.Map({
      container: mapContainer.current,
      style: 'https://tiles.goong.io/assets/goong_map_web.json',
      center: [105.83991, 21.02800],
      zoom: 9
    });
  }, []);

  const handleInputChange = (e) => {
    setLocation(e.target.value);
  };

  const handleCheckLocation = async () => {
    try {
      const response = await axios.get(`https://rsapi.goong.io/Geocode?address=${encodeURIComponent(location)}&api_key=${GOONG_API_KEY}`);
      const data = await response.data;

      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        setCoordinates({ lat, lng });
        setError('');

        // Update map center and add marker
        map.current.setCenter([lng, lat]);
        map.current.setZoom(15);

        // Remove existing markers
        const markers = document.getElementsByClassName('mapboxgl-marker');
        while (markers[0]) {
          markers[0].parentNode.removeChild(markers[0]);
        }

        // Add new marker
        const el = document.createElement('div');
        el.className = 'marker';
        el.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C7.02944 0 3 4.02944 3 9C3 13.9706 12 24 12 24C12 24 21 13.9706 21 9C21 4.02944 16.9706 0 12 0ZM12 12C10.3431 12 9 10.6569 9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9C15 10.6569 13.6569 12 12 12Z" fill="#3887be"/>
          </svg>
        `;
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.cursor = 'pointer';

        new goongjs.Marker(el)
          .setLngLat([lng, lat])
          .addTo(map.current);
      } else {
        setCoordinates(null);
        setError('Invalid location');
      }
    } catch (error) {
      setCoordinates(null);
      setError('Error fetching location');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <input
        type="text"
        placeholder="Enter location"
        value={location}
        onChange={handleInputChange}
        style={{ width: '300px', padding: '10px', marginRight: '10px' }}
      />
      <button onClick={handleCheckLocation} style={{ padding: '10px' }}>Check Location</button>
      {coordinates && (
        <div style={{ marginTop: '20px' }}>
          <div><strong>Latitude:</strong> {coordinates.lat}</div>
          <div><strong>Longitude:</strong> {coordinates.lng}</div>
        </div>
      )}
      {error && (
        <div style={{ marginTop: '20px', color: 'red' }}>
          {error}
        </div>
      )}
      <div ref={mapContainer} style={{ height: '400px', marginTop: '20px' }} />
    </div>
  );
};

export default MapConvert;
