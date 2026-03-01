'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface LocationPickerProps {
  location: { lat: number; lng: number } | null;
  onLocationChange: (location: { lat: number; lng: number } | null) => void;
}

const DEFAULT_CENTER: LatLngTuple = [18.5204, 73.8567];

export default function LocationPickerInner({ location, onLocationChange }: LocationPickerProps) {
  const [mounted, setMounted] = useState(false);
  const [center, setCenter] = useState<LatLngTuple>(DEFAULT_CENTER);

  useEffect(() => {
    setMounted(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude]);
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          onLocationChange(newLoc);
          setCenter([newLoc.lat, newLoc.lng]);
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  if (!mounted) {
    return (
      <div className="h-64 bg-gray-100 rounded-xl animate-pulse flex items-center justify-center text-gray-400">
        Loading map...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="px-4 py-2 text-sm font-bold text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors flex items-center gap-2"
        >
          📍 Get Current Location
        </button>
        {location && (
          <span className="text-xs text-green-600 font-medium flex items-center">
            ✓ Location set
          </span>
        )}
      </div>
      <div className="h-64 rounded-xl overflow-hidden border border-orange-200">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker location={location} onLocationChange={onLocationChange} />
        </MapContainer>
      </div>
      {location && (
        <p className="text-xs text-gray-500">
          Selected: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
        </p>
      )}
    </div>
  );
}

function LocationMarker({ location, onLocationChange }: { location: { lat: number; lng: number } | null; onLocationChange: (loc: { lat: number; lng: number } | null) => void }) {
  const map = useMap();

  useMapEvents({
    click(e) {
      onLocationChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  useEffect(() => {
    if (location) {
      map.setView([location.lat, location.lng], 15);
    }
  }, [location, map]);

  const customIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  if (!location) return null;

  return <Marker position={[location.lat, location.lng]} icon={customIcon} />;
}
