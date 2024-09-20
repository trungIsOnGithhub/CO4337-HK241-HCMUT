import React, { useEffect, useState, useRef } from 'react';
import goongjs from '@goongmaps/goong-js';
import '@goongmaps/goong-js/dist/goong-js.css';

const GOONG_MAPTILES_KEY = 'hzX8cXab72XCozZSYvZqkV26qMMQ8JdpkiUwK1Iy';
const GOONG_API_KEY = '2jcRRCquuKp2hdK4BcQsMZLsrJuXSNuXYlfcWXyA';

// Simple polyline decoder function
function decodePolyline(str, precision) {
  var index = 0,
      lat = 0,
      lng = 0,
      coordinates = [],
      shift = 0,
      result = 0,
      byte = null,
      latitude_change,
      longitude_change,
      factor = Math.pow(10, precision || 5);

  while (index < str.length) {
    byte = null;
    shift = 0;
    result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
    shift = result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

    lat += latitude_change;
    lng += longitude_change;

    coordinates.push([lng / factor, lat / factor]);
  }

  return coordinates;
}

const Mapbox = ({ userCoords, providerCoords, small }) => {

  
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [startLocation, setStartLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [startCoords, setStartCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [isUpdatingStart, setIsUpdatingStart] = useState(false);

  // Add this new function
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(`https://rsapi.goong.io/Geocode?latlng=${lat},${lng}&api_key=${GOONG_API_KEY}`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
    } catch (error) {
      console.error("Error in reverse geocoding:", error);
    }
    return "";
  };

  useEffect(() => {
    if (map.current) return; // initialize map only once

    goongjs.accessToken = GOONG_MAPTILES_KEY;

    map.current = new goongjs.Map({
      container: mapContainer.current,
      style: 'https://tiles.goong.io/assets/goong_map_web.json',
      center: [105.83991, 21.02800],
      zoom: 9
    });

    // Request user's location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async position => {
        const { longitude, latitude } = position.coords;
        map.current.setCenter([longitude, latitude]);
        
        // Reverse geocode to get address
        const response = await fetch(`https://rsapi.goong.io/Geocode?latlng=${latitude},${longitude}&api_key=${GOONG_API_KEY}`);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          setStartLocation(data.results[0].formatted_address);
          setStartCoords([longitude, latitude]);

          // Add marker for user's location
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

          const popup = new goongjs.Popup({ offset: 25 }).setHTML(`<h3>${data.results[0].formatted_address}</h3>`);

          new goongjs.Marker(el)
            .setLngLat([longitude, latitude])
            .setPopup(popup)
            .addTo(map.current);
        }
      }, () => {
      });
    } else {
    }
  }, []);

  useEffect(() => {
    if (startCoords && destCoords) {
      drawRoute();
    }
  }, [startCoords, destCoords]);

  const handleLocationInput = async (e, isStart) => {
    const value = e.target.value;
    if (isStart) {
      setStartLocation(value);
      setIsUpdatingStart(true);
    } else {
      setDestination(value);
      setIsUpdatingStart(false);
    }

    if (value.length > 2) {
      const response = await fetch(`https://rsapi.goong.io/Place/AutoComplete?api_key=${GOONG_API_KEY}&input=${encodeURIComponent(value)}`);
      const data = await response.json();
      setSuggestions(data.predictions || []);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = async (placeId) => {
    const response = await fetch(`https://rsapi.goong.io/Place/Detail?place_id=${placeId}&api_key=${GOONG_API_KEY}`);
    const data = await response.json();

    if (data.result && data.result.geometry) {
      const lat = data.result.geometry.location.lat;
      const lng = data.result.geometry.location.lng;

      if (isUpdatingStart) {
        setStartLocation(data.result.name);
        setStartCoords([lng, lat]);
      } else {
        setDestination(data.result.name);
        setDestCoords([lng, lat]);
      }
    }

    setSuggestions([]);
  };

  const drawRoute = async () => {
    if (!startCoords || !destCoords) return;

    const [startLng, startLat] = startCoords;
    const [destLng, destLat] = destCoords;

    // Get directions
    const directionsResponse = await fetch(`https://rsapi.goong.io/Direction?origin=${startLat},${startLng}&destination=${destLat},${destLng}&vehicle=car&api_key=${GOONG_API_KEY}`);
    const directionsData = await directionsResponse.json();

    if (directionsData.routes && directionsData.routes.length > 0) {
      const route = directionsData.routes[0];
      const routeGeometry = route.overview_polyline.points;

      setRouteInfo({
        distance: route.legs[0].distance.text,
        duration: route.legs[0].duration.text
      });

      // Remove existing layers, sources, and markers
      ['route', 'start-marker', 'end-marker'].forEach(id => {
        if (map.current.getLayer(id)) map.current.removeLayer(id);
        if (map.current.getSource(id)) map.current.removeSource(id);
      });
      map.current.getCanvas().style.cursor = 'default';
      const markers = document.getElementsByClassName('mapboxgl-marker');
      while(markers[0]) {
        markers[0].parentNode.removeChild(markers[0]);
      }

      // Add the route to the map
      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: decodePolyline(routeGeometry)
            }
          }
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#FFD700', // Màu vàng
          'line-width': 8
        }
      });

      // Add start and end markers
      [
        { coordinates: startCoords, color: '#3887be', name: startLocation }, // Màu xanh lá
        { coordinates: destCoords, color: '#f30', name: destination }
      ].forEach(point => {
        // Create a DOM element for the marker
        const el = document.createElement('div');
        el.className = 'marker';
        el.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C7.02944 0 3 4.02944 3 9C3 13.9706 12 24 12 24C12 24 21 13.9706 21 9C21 4.02944 16.9706 0 12 0ZM12 12C10.3431 12 9 10.6569 9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9C15 10.6569 13.6569 12 12 12Z" fill="${point.color}"/>
          </svg>
        `;
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.cursor = 'pointer';

        // Create the popup
        const popup = new goongjs.Popup({ offset: 25 }).setHTML(`<h3>${point.name}</h3>`);

        // Create the marker
        const marker = new goongjs.Marker(el)
          .setLngLat(point.coordinates)
          .setPopup(popup) // sets a popup on this marker
          .addTo(map.current);

        // Show popup on hover
        el.addEventListener('mouseenter', () => popup.addTo(map.current));
        el.addEventListener('mouseleave', () => popup.remove());
      });

      // Fit the map to the route
      const bounds = new goongjs.LngLatBounds();
      decodePolyline(routeGeometry).forEach(coord => bounds.extend(coord));
      map.current.fitBounds(bounds, { padding: 50 });
    }
  };

  useEffect(() => {
    if (userCoords && providerCoords) {
      setStartCoords([userCoords.longitude, userCoords.latitude]);
      setDestCoords([providerCoords.longitude, providerCoords.latitude]);
      
      // Add this: Update destination address
      reverseGeocode(providerCoords.latitude, providerCoords.longitude)
        .then(address => setDestination(address));
    }
  }, [userCoords, providerCoords]);

  return (
    <div style={{ position: 'relative' }} className='h-full'>
      <div ref={mapContainer} className='h-full' />
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '10px',
        borderRadius: '5px'
      }}>
        <div>
          <label 
          htmlFor="start-location" 
          style={{
            display: 'block',
            marginBottom: '5px',
            color: '#3887be'  // Blue color for user location
          }}
          className='font-semibold'
          >
            Your Location
          </label>
          <input
            id="start-location"
            type="text"
            placeholder="Enter your start location"
            value={startLocation}
            onChange={(e) => handleLocationInput(e, true)}
            style={{
              width: small ? '150px' : '250px',
              padding: small ? '2px' : '6px',
              border: '1px solid #3887be',
              borderRadius: '4px'
            }}
          />
        </div>
        <div>
          <label 
          htmlFor="destination" 
          style={{
            display: 'block',
            marginBottom: '5px',
            color: '#f30'  // Red color for destination
          }}
          className='font-semibold'>
            Destination
          </label>
          <input
            id="destination"
            type="text"
            placeholder="Enter destination"
            value={destination}
            onChange={(e) => handleLocationInput(e, false)}
            style={{
              width: small ? '150px' : '250px',
              padding: small ? '2px' : '6px',
              border: '1px solid #f30',
              borderRadius: '4px'
            }}
          />
        </div>
        {suggestions.length > 0 && (
          <ul style={{ 
            backgroundColor: 'white', 
            border: '1px solid #ddd',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {suggestions.map((suggestion) => (
              <li 
                key={suggestion.place_id} 
                onClick={() => handleSuggestionSelect(suggestion.place_id)}
                style={{ padding: '10px', cursor: 'pointer' }}
              >
                {suggestion.description}
              </li>
            ))}
          </ul>
        )}
      </div>
      {routeInfo && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          backgroundColor: 'white',
          padding: small? '4px' : '10px',
          borderRadius: '5px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          zIndex: 1000
        }}>
          <div><strong>Distance:</strong> {routeInfo.distance}</div>
          <div><strong>Estimated Time:</strong> {routeInfo.duration}</div>
        </div>
      )}
    </div>
  );
};

export default Mapbox;
