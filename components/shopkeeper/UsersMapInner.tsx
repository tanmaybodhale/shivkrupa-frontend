'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface UserLocation {
  uid: string;
  name: string;
  phone: string;
  address?: {
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    location?: {
      lat: number;
      lng: number;
    };
  };
}

const DEFAULT_CENTER: LatLngTuple = [18.5204, 73.8567];

interface Props {
  usersWithLocation: UserLocation[];
  isDark?: boolean;
}

export default function UsersMapInner({ usersWithLocation, isDark }: Props) {
  const customIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <div className={`h-full w-full ${isDark ? 'map-dark' : ''}`}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          key={isDark ? 'dark' : 'light'}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={isDark
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
        />
        {usersWithLocation.map((user) => (
          <Marker
            key={user.uid}
            position={[user.address!.location!.lat, user.address!.location!.lng]}
            icon={customIcon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold">{user.name}</p>
                <p className="text-xs text-gray-500">📞 {user.phone}</p>
                {user.address?.street && (
                  <p className="text-xs mt-1">
                    📍 {user.address.street}, {user.address.area}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
